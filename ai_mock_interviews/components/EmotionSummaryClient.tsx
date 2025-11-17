"use client";

import { useEffect, useState } from "react";

type EmotionSummary = {
	averages: Record<string, number>;
	dominantCounts: Record<string, number>;
	avgConfidence: number;
	avgClarity: number;
	totalDetections: number;
};

export default function EmotionSummaryClient({ interviewId }: { interviewId?: string }) {
	const [summary, setSummary] = useState<EmotionSummary | null>(null);

	useEffect(() => {
		if (!interviewId) return;
		try {
			const raw = localStorage.getItem(`emotion-summary:${interviewId}`);
			if (raw) {
				setSummary(JSON.parse(raw));
			}
		} catch {}
	}, [interviewId]);

	if (!interviewId) return null;

	return (
		<div className="card-border p-0.5">
			<div className="p-4 rounded-2xl bg-[#0f111a]">
				<h3>Emotion Summary</h3>
				{summary ? (
					<div className="mt-2 space-y-2">
						<p>
							Detections: <span className="font-semibold">{summary.totalDetections}</span>
						</p>
						<p>
							Avg Confidence: <span className="font-semibold">{summary.avgConfidence.toFixed(1)}%</span>
						</p>
						{typeof summary.avgClarity === "number" ? (
							<p>
								Avg Clarity: <span className="font-semibold">{summary.avgClarity.toFixed(1)}%</span>
							</p>
						) : null}
						<div>
							<p className="font-semibold mb-1">Top Emotions</p>
							<div className="flex flex-wrap gap-2">
								{Object.entries(summary.dominantCounts)
									.sort((a, b) => b[1] - a[1])
									.slice(0, 5)
									.map(([k, v]) => (
										<span
											key={k}
											className="px-2 py-1 rounded-full bg-[#1b1640] border border-[#2a235f] text-xs capitalize"
										>
											{k}: {v}
										</span>
									))}
							</div>
						</div>
					</div>
				) : (
					<p className="opacity-80">No emotion data yet for this interview.</p>
				)}
			</div>
		</div>
	);
}


