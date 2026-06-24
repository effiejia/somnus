export function formatRelativeDate(iso: string): string {
	const date = new Date(iso);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffHours = diffMs / (1000 * 60 * 60);

	if (diffHours < 24 && date.toDateString() === now.toDateString()) {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);
	if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
	return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatTimestamp(iso: string): string {
	const d = new Date(iso);
	const date = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
	const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	return `${date} at ${time}`;
}

export function formatEditedSuffix(createdAt: string, updatedAt: string): string | null {
	const created = new Date(createdAt);
	const updated = new Date(updatedAt);
	if (updated.getTime() - created.getTime() <= 300_000) return null;
	const sameDay =
		updated.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) ===
		created.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
	const updatedDate = updated.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
	const updatedTime = updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	return sameDay ? `Edited at ${updatedTime}` : `Edited ${updatedDate} at ${updatedTime}`;
}
