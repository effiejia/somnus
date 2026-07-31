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
		max_tokens: 800,
		messages: [
			{
				role: "user",
				content: `You are a psychologist specializing in dream analysis. Analyze the following dream using exactly this structure:

**Interpretation**
2-3 sentences. What the dream likely reflects about the dreamer's inner life, concerns, or psychological state. Grounded and direct.

**Key Symbols**
3-5 bullet points. Each bullet names a symbol from the dream and gives a brief psychological reading of it.

**Emotional Tone**
1-2 sentences. Describe the dominant emotional atmosphere of the dream and what it might indicate.

Use a clinical but humane tone — informed and observational.

Dream title: ${title || "Untitled"}

Dream:
${body}`,
			},
		],
	});

	const analysis = message.content[0].type === "text" ? message.content[0].text : "";
	return NextResponse.json({ analysis });
}
