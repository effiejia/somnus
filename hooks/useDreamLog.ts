"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MOCK_SHARED, MOCK_SHARED_ENTRIES } from "@/constants/mocks";
import { getCurrentUser, signOut } from "@/lib/api/auth";
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
	const filtered = useMemo(() => filterDreams(dreams, query), [dreams, query]);

	const [loading, setLoading] = useState(true);
	const [showSplash, setShowSplash] = useState(false);
	const [selecting, setSelecting] = useState(false);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [_userId, setUserId] = useState<string | null>(null);
	const [tab, setTab] = useState<"my" | "shared">("my");
	const [sharedWithMe, setSharedWithMe] = useState<SharedDream[]>([]);
	const [avatarInitial, setAvatarInitial] = useState("?");

	// Hydrate from sessionStorage after mount. Reading storage during render
	// (e.g. in useState initializers) breaks SSR hydration: the server has no
	// sessionStorage, so its markup would not match the first client render.
	useEffect(() => {
		if (!cache.hasSeenSplash()) {
			setShowSplash(true);
		}
		setAvatarInitial(cache.readAvatar("?"));
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
			const initial = (user.email?.[0] ?? "?").toUpperCase();
			setAvatarInitial(initial);
			cache.writeAvatar(initial);
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

	async function handleSignOut() {
		await signOut();
		router.push("/login");
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

	function openSharedDream(entry: SharedDream) {
		if (MOCK_SHARED && entry.id.startsWith("mock-")) {
			cache.writeMockSharedDream(entry.dream);
		}
		router.push(`/share/${entry.dream.share_token}`);
	}

	return {
		loading,
		showSplash,
		dismissSplash,
		dreams,
		filtered,
		avatarInitial,
		tab,
		setTab,
		sharedWithMe,
		selecting,
		startSelecting,
		cancelSelecting,
		selected,
		toggleSelect,
		deleteSelected,
		search,
		removeDream,
		removeShared,
		removeSelectedShared,
		onTokenChange,
		handleSignOut,
		openSharedDream,
		goToNew,
		goToAnalyze,
		goToViewAnalysis,
	};
}
