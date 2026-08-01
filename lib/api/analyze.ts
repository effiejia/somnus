import { updateDream } from "@/lib/api/dreams";

export async function analyzeDream(dreamId: string, title: string, body: string): Promise<void> {
	const res = await fetch("/api/analyze", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ title, body }),
	});
	if (!res.ok) throw new Error("Analysis failed");
	const json = await res.json();
	const analysis: string = json.analysis ?? "";
	await updateDream(dreamId, { analysis, analyzed_body: body });
}
