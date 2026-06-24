import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
	const { title, body } = await req.json();

	if (!body?.trim()) {
		return NextResponse.json({ error: "No dream content provided." }, { status: 400 });
	}

	const message = await client.messages.create({
		model: "claude-sonnet-4-6",
		max_tokens: 600,
		messages: [
			{
				role: "user",
				content: `Analyze the following dream. Explore its themes, symbols, and emotional atmosphere. Write 2-3 paragraphs in a thoughtful, literary tone — not clinical, not preachy. Do not use bullet points.

Dream title: ${title || "Untitled"}

Dream:
${body}`,
			},
		],
	});

	const analysis = message.content[0].type === "text" ? message.content[0].text : "";
	return NextResponse.json({ analysis });
}
