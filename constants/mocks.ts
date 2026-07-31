import type { SharedDream } from "@/lib/types";

export const MOCK_SHARED = process.env.NODE_ENV === "development";

export const MOCK_SHARED_ENTRIES: SharedDream[] = [
	{
		id: "mock-shared-1",
		viewer_id: "mock-viewer",
		dream_id: "mock-dream-1",
		sharer_email: "afoyer@example.com",
		saved_at: new Date().toISOString(),
		dream: {
			id: "mock-dream-1",
			user_id: "mock-user",
			title: "The glass hallway",
			body: "I was walking through a hallway made entirely of glass. Each panel reflected a different version of me — some younger, some I didn't recognise at all.",
			analysis: null,
			analyzed_body: null,
			share_token: "mock-token-1",
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
		},
	},
	{
		id: "mock-shared-2",
		viewer_id: "mock-viewer",
		dream_id: "mock-dream-2",
		sharer_email: "afoyer@example.com",
		saved_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
		dream: {
			id: "mock-dream-2",
			user_id: "mock-user",
			title: "Running through the airport",
			body: "Late for a flight I couldn't find on the departures board. Every gate number I reached turned into a different one.",
			analysis:
				"**Emotional tone:** High anxiety with an undercurrent of helplessness.\n\n**Key symbols:**\n- *The airport* — transition, anticipation of change\n- *Missing gate* — fear of missing an opportunity\n\n**Possible interpretation:** A deadline or decision is weighing on you.",
			analyzed_body: "Late for a flight I couldn't find on the departures board.",
			share_token: "mock-token-2",
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
			updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
		},
	},
];

export const MOCK_ANALYSIS = process.env.NEXT_PUBLIC_MOCK_ANALYSIS === "true";

export const MOCK_ANALYSIS_TEXT = `**Emotional tone:** Anxious undercurrent softened by moments of wonder — the dream oscillates between unease and awe.

**Key symbols:**
- *Falling water* — transition, the unconscious releasing something held for too long
- *Unfamiliar house* — unexplored aspects of the self; rooms not yet entered
- *The figure at the door* — an unresolved relationship or decision waiting for acknowledgement

**Patterns:** This dream continues a recurring theme of threshold imagery. You are standing at edges — doorways, shorelines, the tops of staircases — without crossing them. This may reflect waking hesitation around a significant change.

**Possible interpretation:** Part of you is ready to move forward; another part is still cataloguing what would be left behind. The anxiety isn't a warning — it's the feeling of momentum building.

**Suggested reflection:** What would it mean to step through the door?`;
