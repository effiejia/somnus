function fallbackTitle(body: string): string {
	const trimmed = body.trim();
	if (!trimmed) return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
	const words = trimmed.split(/\s+/).slice(0, 6).join(" ");
	const title = words.charAt(0).toUpperCase() + words.slice(1);
	return trimmed.split(/\s+/).length > 6 ? title + "…" : title;
}

export async function generateTitle(body: string): Promise<string> {
	try {
		const res = await fetch("/api/title", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ body }),
		});
		const json = await res.json();
		if (json.title) return json.title;
		console.error("Title API error:", json.error);
	} catch (err) {
		console.error("Title fetch failed:", err);
	}
	return fallbackTitle(body);
}
