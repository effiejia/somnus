import { create } from "zustand";
import { deleteDream, getDreams } from "@/lib/api/dreams";
import type { Dream } from "@/lib/types";
import * as cache from "@/lib/utils/dreamCache";

interface DreamState {
	dreams: Dream[];
	query: string;
	importOpen: boolean;
	hydrateFromCache: () => void;
	loadDreams: (userId: string) => Promise<void>;
	search: (q: string) => void;
	removeDream: (id: string) => Promise<void>;
	removeMany: (ids: string[]) => Promise<void>;
	updateOne: (id: string, fields: Partial<Dream>) => void;
	setShareToken: (id: string, token: string | null) => void;
	openImport: () => void;
	closeImport: () => void;
}

export const useDreamStore = create<DreamState>((set, get) => ({
	dreams: [],
	query: "",
	importOpen: false,
	openImport: () => set({ importOpen: true }),
	closeImport: () => set({ importOpen: false }),

	// Read sessionStorage AFTER mount (called from an effect), never during
	// render, to avoid an SSR hydration mismatch (server has no sessionStorage).
	hydrateFromCache: () => {
		if (cache.hasCachedDreams()) set({ dreams: cache.readCachedDreams() });
	},

	loadDreams: async (userId) => {
		const data = await getDreams(userId);
		cache.writeCachedDreams(data);
		set({ dreams: data });
	},

	search: (q) => set({ query: q }),

	removeDream: async (id) => {
		await deleteDream(id);
		const dreams = get().dreams.filter((d) => d.id !== id);
		cache.writeCachedDreams(dreams);
		set({ dreams });
	},

	removeMany: async (ids) => {
		await Promise.all(ids.map((id) => deleteDream(id)));
		const idSet = new Set(ids);
		const dreams = get().dreams.filter((d) => !idSet.has(d.id));
		cache.writeCachedDreams(dreams);
		set({ dreams });
	},

	updateOne: (id, fields) => {
		const dreams = get().dreams.map((d) => (d.id === id ? { ...d, ...fields } : d));
		cache.writeCachedDreams(dreams);
		set({ dreams });
	},

	setShareToken: (id, token) => {
		const dreams = get().dreams.map((d) => (d.id === id ? { ...d, share_token: token } : d));
		cache.writeCachedDreams(dreams);
		set({ dreams });
	},
}));
