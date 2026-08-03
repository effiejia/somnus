import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
	try {
		const { body } = await req.json();

		if (!body?.trim()) {
			return NextResponse.json({ error: "No dream content provided." }, { status: 400 });
		}

		const message = await client.messages.create({
			model: "claude-haiku-4-5-20251001",
			max_tokens: 20,
			messages: [
				{
					role: "user",
					content: `Give this dream a short descriptive title — 2 to 5 words, no punctuation, no quotes. The title should reflect the main subject or event of the dream, not interpret it. Reply with only the title.

Dream:
${body}`,
				},
			],
		});

		const title = message.content[0].type === "text" ? message.content[0].text.trim() : "";
		return NextResponse.json({ title });
	} catch (err) {
		console.error("Title API error:", err);
		return NextResponse.json({ error: String(err) }, { status: 500 });
	}
}
