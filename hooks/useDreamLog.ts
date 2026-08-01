"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MOCK_SHARED, MOCK_SHARED_ENTRIES } from "@/constants/mocks";
import { getCurrentUser } from "@/lib/api/auth";
import { analyzeDream } from "@/lib/api/analyze";
import { getSharedWithMe, removeSharedWithMe } from "@/lib/api/sharing";
import type { Dream, SharedDream } from "@/lib/types";
import * as cache from "@/lib/utils/dreamCache";
import { filterDreams } from "@/lib/utils/filterDreams";
import { useDreamStore } from "@/store/useDreamStore";

export function useDreamLog() {
	const router = useRouter();

	const dreams = useDreamStore((s) => s.dreams);
	const query = useDreamStore((s) => s.query);
	const loadDreams = useDreamStore((s) => s.loadDreams);
	const hydrateFromCache = useDreamStore((s) => s.hydrateFromCache);
	const storeSearch = useDreamStore((s) => s.search);
	const storeRemoveDream = useDreamStore((s) => s.removeDream);
	const storeRemoveMany = useDreamStore((s) => s.removeMany);
	const storeSetShareToken = useDreamStore((s) => s.setShareToken);
	const storeUpdateOne = useDreamStore((s) => s.updateOne);
	const filtered = useMemo(() => filterDreams(dreams, query), [dreams, query]);

	const [loading, setLoading] = useState(true);
	const [showSplash, setShowSplash] = useState(false);
	const [selecting, setSelecting] = useState(false);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [userId, setUserId] = useState<string | null>(null);
	const [tab, setTab] = useState<"my" | "shared">("my");
	const [sharedWithMe, setSharedWithMe] = useState<SharedDream[]>([]);
	const [analyzingProgress, setAnalyzingProgress] = useState<{ done: number; total: number } | null>(null);

	useEffect(() => {
		if (!cache.hasSeenSplash()) {
			setShowSplash(true);
		}
		if (cache.hasCachedDreams()) {
			hydrateFromCache();
			setLoading(false);
		}
	}, [hydrateFromCache]);

	useEffect(() => {
		async function init() {
			const user = await getCurrentUser();
			if (!user) {
				router.replace("/login");
				return;
			}
			setUserId(user.id);
			await loadDreams(user.id);
			const shared = await getSharedWithMe(user.id);
			setSharedWithMe(MOCK_SHARED ? [...MOCK_SHARED_ENTRIES, ...shared] : shared);
			setLoading(false);
		}
		init();
	}, [router, loadDreams]);

	const search = storeSearch;

	async function removeDream(id: string) {
		await storeRemoveDream(id);
	}

	async function deleteSelected() {
		await storeRemoveMany([...selected]);
		setSelected(new Set());
		setSelecting(false);
	}

	async function analyzeSelected() {
		const unanalyzed = dreams.filter((d) => selected.has(d.id) && !d.analysis);
		if (unanalyzed.length === 0) return;

		setAnalyzingProgress({ done: 0, total: unanalyzed.length });

		for (let i = 0; i < unanalyzed.length; i++) {
			const dream = unanalyzed[i];
			try {
				await analyzeDream(dream.id, dream.title, dream.body);
				// Fetch the updated analysis to reflect it in the store
				storeUpdateOne(dream.id, {
					analysis: "analyzed",
					analyzed_body: dream.body,
				});
			} catch {
				// Continue with remaining dreams even if one fails
			}
			setAnalyzingProgress({ done: i + 1, total: unanalyzed.length });
		}

		// Reload to get accurate analysis text from DB
		if (userId) await loadDreams(userId);
		setAnalyzingProgress(null);
		setSelected(new Set());
		setSelecting(false);
	}

	function goToNew() {
		router.push("/new");
	}

	function goToAnalyze(dream: Dream) {
		router.push(`/dream/${dream.id}?analyze=true`);
	}

	function goToViewAnalysis(dream: Dream) {
		router.push(`/dream/${dream.id}?view=true`);
	}

	async function removeShared(dreamId: string) {
		await removeSharedWithMe(dreamId);
		setSharedWithMe((prev) => prev.filter((s) => s.dream_id !== dreamId));
	}

	async function removeSelectedShared() {
		await Promise.all([...selected].map((id) => removeSharedWithMe(id)));
		setSharedWithMe((prev) => prev.filter((e) => !selected.has(e.dream_id)));
		setSelected(new Set());
		setSelecting(false);
	}

	function onTokenChange(id: string, token: string | null) {
		storeSetShareToken(id, token);
	}

	function toggleSelect(id: string) {
		setSelected((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	}

	function dismissSplash() {
		cache.markSplashSeen();
		setShowSplash(false);
	}

	function startSelecting() {
		setSelecting(true);
	}

	function cancelSelecting() {
		setSelecting(false);
		setSelected(new Set());
	}

	function selectAll() {
		if (tab === "shared") {
			setSelected(new Set(sharedWithMe.map((e) => e.dream_id)));
		} else {
			setSelected(new Set(filtered.map((d) => d.id)));
		}
	}

	function openSharedDream(entry: SharedDream) {
		if (MOCK_SHARED && entry.id.startsWith("mock-")) {
			cache.writeMockSharedDream(entry.dream);
		}
		router.push(`/share/${entry.dream.share_token}`);
	}

	const unanalyzedSelectedCount = dreams.filter((d) => selected.has(d.id) && !d.analysis).length;

	return {
		loading,
		showSplash,
		dismissSplash,
		dreams,
		filtered,
		tab,
		setTab,
		sharedWithMe,
		selecting,
		startSelecting,
		cancelSelecting,
		selected,
		toggleSelect,
		deleteSelected,
		analyzeSelected,
		analyzingProgress,
		unanalyzedSelectedCount,
		selectAll,
		search,
		removeDream,
		removeShared,
		removeSelectedShared,
		onTokenChange,
		openSharedDream,
		goToNew,
		goToAnalyze,
		goToViewAnalysis,
		userId,
		loadDreams,
	};
}
