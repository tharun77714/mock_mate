"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type EmotionScores = Record<string, number>;

type EmotionSample = {
	timestamp: number;
	dominant: string;
	confidence: number;
	scores: EmotionScores;
	clarity?: number;
};

type EmotionSummary = {
	averages: EmotionScores;
	dominantCounts: Record<string, number>;
	avgConfidence: number;
	avgClarity: number;
	totalDetections: number;
};

export default function EmotionTracker({
	interviewId,
	sampleIntervalMs = 2000,
	showBadge = true,
	featureFlag = true,
}: {
	interviewId: string;
	sampleIntervalMs?: number;
	showBadge?: boolean;
	featureFlag?: boolean;
}) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [enabled, setEnabled] = useState<boolean>(false);
	const [initTried, setInitTried] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [dominant, setDominant] = useState<string>("");
	const [confidence, setConfidence] = useState<number>(0);
	const [isTracking, setIsTracking] = useState<boolean>(false);
	const samplesRef = useRef<EmotionSample[]>([]);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	const storageKey = useMemo(() => `emotion-summary:${interviewId}`, [interviewId]);

	const computeSummary = useCallback((samples: EmotionSample[]): EmotionSummary => {
		const totals: EmotionScores = {};
		const counts: Record<string, number> = {};
		let confidenceSum = 0;
		let claritySum = 0;
		let clarityCount = 0;
		for (const s of samples) {
			confidenceSum += s.confidence || 0;
			if (s.clarity !== undefined) {
				claritySum += s.clarity;
				clarityCount += 1;
			}
			counts[s.dominant] = (counts[s.dominant] || 0) + 1;
			for (const [k, v] of Object.entries(s.scores || {})) {
				totals[k] = (totals[k] || 0) + v;
			}
		}
		const averages: EmotionScores = {};
		const n = samples.length || 1;
		for (const [k, v] of Object.entries(totals)) {
			averages[k] = v / n;
		}
		return {
			averages,
			dominantCounts: counts,
			avgConfidence: n > 0 ? confidenceSum / n : 0,
			avgClarity: clarityCount > 0 ? claritySum / clarityCount : 0,
			totalDetections: samples.length,
		};
	}, []);

	const saveSummary = useCallback(() => {
		const summary = computeSummary(samplesRef.current);
		try {
			localStorage.setItem(storageKey, JSON.stringify(summary));
		} catch {}
	}, [computeSummary, storageKey]);

	const requestCamera = useCallback(async () => {
		setInitTried(true);
		setError("");
		let stream: MediaStream | null = null;
		try {
			// Prefer front camera with reasonable defaults
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: "user",
					width: { ideal: 640 },
					height: { ideal: 480 },
				},
				audio: false,
			});
			if (!videoRef.current) return;
			streamRef.current = stream;
			videoRef.current.srcObject = stream;
			// Wait for metadata to ensure dimensions are known
			await new Promise<void>((resolve) => {
				const v = videoRef.current!;
				if (v.readyState >= 1) {
					resolve();
				} else {
					v.onloadedmetadata = () => resolve();
				}
			});
			await videoRef.current.play().catch(() => {});
			setEnabled(true);
		} catch (e: any) {
			console.warn("Camera init failed:", e);
			setError("Camera permission denied or unavailable.");
			setEnabled(false);
			// Stop any partially opened tracks
			if (stream) {
				stream.getTracks().forEach((t) => t.stop());
			}
		}
	}, []);

	const stopTracking = useCallback(() => {
		setIsTracking(false);
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		saveSummary();
	}, [saveSummary]);

	const startTracking = useCallback(async () => {
		// If camera not initialized, request it
		if (!videoRef.current?.srcObject) {
			await requestCamera();
			// Wait a moment for camera stream to attach
			await new Promise((resolve) => setTimeout(resolve, 800));
		}
		// Start tracking if camera is ready
		if (videoRef.current?.srcObject) {
			setIsTracking(true);
		} else {
			console.warn("Cannot start emotion tracking - camera not ready");
		}
	}, [requestCamera]);

	// Watch for Call/End button clicks to start/stop tracking
	useEffect(() => {
		if (!featureFlag) return;

		const handleDocumentClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target) return;

			// Check if Call button was clicked
			const callButton = target.closest(".btn-call");
			if (callButton && !isTracking) {
				console.log("Call button clicked - starting emotion tracking");
				startTracking();
			}

			// Check if End button was clicked
			const endButton = target.closest(".btn-disconnect");
			if (endButton && isTracking) {
				console.log("End button clicked - stopping emotion tracking");
				stopTracking();
			}
		};

		// Also poll for button state changes (fallback)
		const pollButtonState = setInterval(() => {
			const endButton = document.querySelector(".btn-disconnect");

			// If End button is visible, we should be tracking
			if (endButton && !isTracking && videoRef.current?.srcObject) {
				startTracking();
			}

			// If End button disappeared and we're tracking, stop
			if (!endButton && isTracking) {
				stopTracking();
			}
		}, 1000);

		document.addEventListener("click", handleDocumentClick);

		return () => {
			document.removeEventListener("click", handleDocumentClick);
			clearInterval(pollButtonState);
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			const s = streamRef.current;
			if (s) {
				s.getTracks().forEach((t) => t.stop());
				streamRef.current = null;
			}
			saveSummary();
		};
	}, [featureFlag, isTracking, startTracking, stopTracking, saveSummary]);

	const captureAndAnalyze = useCallback(async () => {
		if (!videoRef.current || !canvasRef.current) return;
		const video = videoRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		canvas.width = video.videoWidth || 320;
		canvas.height = video.videoHeight || 240;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const imageBase64 = canvas.toDataURL("image/jpeg", 0.6);
		try {
			const res = await fetch("/api/emotion/analyze", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ imageBase64, sessionId: interviewId }),
			});
			const json = await res.json();
			if (!json?.success) return;
			const data = json.data || {};
			const dom = data?.dominant || data?.emotion || "";
			const conf = Number(data?.confidence ?? 0);
			const scores: EmotionScores = data?.scores || data?.emotions || {};
			const clarity = typeof data?.clarity === "number" ? data.clarity : undefined;
			setDominant(dom);
			setConfidence(conf);
			samplesRef.current.push({
				timestamp: Date.now(),
				dominant: dom,
				confidence: conf,
				scores,
				clarity,
			});
			// Persist periodically
			if (samplesRef.current.length % 3 === 0) {
				saveSummary();
			}
		} catch {
			// Silent failure: do not impact main app
		}
	}, [interviewId, saveSummary]);

	// Start/stop capture based on tracking state
	useEffect(() => {
		if (!isTracking || !enabled) {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			return;
		}
		timerRef.current = setInterval(captureAndAnalyze, sampleIntervalMs);
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [isTracking, enabled, captureAndAnalyze, sampleIntervalMs]);

	if (!featureFlag) return null;

	return (
		<>
			<video ref={videoRef} playsInline muted className="hidden" />
			<canvas ref={canvasRef} className="hidden" />
			{showBadge && enabled && (
				<div className="fixed bottom-4 right-4 z-40 px-3 py-2 rounded-full bg-[#1b1640] border border-[#2a235f] text-white text-sm shadow-md">
					<span className="font-semibold capitalize">{dominant || "..."}</span>
					{typeof confidence === "number" && confidence > 0 ? (
						<span className="ml-2 opacity-80">{confidence.toFixed(0)}%</span>
					) : null}
				</div>
			)}
			{showBadge && !enabled && initTried && (
				<button
					type="button"
					onClick={requestCamera}
					className="fixed bottom-4 right-4 z-40 px-3 py-2 rounded-full bg-[#1b1640] border border-[#2a235f] text-white text-sm shadow-md"
					title={error || "Enable camera"}
				>
					Enable camera
				</button>
			)}
		</>
	);
}


