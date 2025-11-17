import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const { imageBase64, sessionId } = await request.json();

	const serviceUrl = process.env.EMOTION_SERVICE_URL;
	if (!serviceUrl) {
		return NextResponse.json(
			{ error: "EMOTION_SERVICE_URL is not configured" },
			{ status: 500 }
		);
	}

	try {
		const res = await fetch(`${serviceUrl.replace(/\/$/, "")}/analyze`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ imageBase64, sessionId }),
		});

		if (!res.ok) {
			const text = await res.text();
			return NextResponse.json(
				{ error: "Emotion service error", details: text },
				{ status: 502 }
			);
		}

		const data = await res.json();
		return NextResponse.json({ success: true, data });
	} catch (e: any) {
		return NextResponse.json(
			{ error: "Failed to reach emotion service", details: String(e) },
			{ status: 502 }
		);
	}
}


