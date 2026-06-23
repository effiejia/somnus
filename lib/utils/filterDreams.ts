import type { Dream } from "@/lib/types";

/**
 * Case-insensitive match of a query against dream title or body.
 * Empty/whitespace query returns the list unchanged.
 */
export function filterDreams(dreams: Dream[], query: string): Dream[] {
	const q = query.trim().toLowerCase();
	if (!q) return dreams;
	return dreams.filter(
		(d) => d.title.toLowerCase().includes(q) || d.body.toLowerCase().includes(q),
	);
}
