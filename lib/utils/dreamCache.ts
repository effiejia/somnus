import type { Dream } from "@/lib/types";

const DREAMS_KEY = "somnus_dreams";
const AVATAR_KEY = "somnus_avatar";
const SPLASH_KEY = "somnus_splash_seen";
const MOCK_SHARED_KEY = "somnus_mock_shared_dream";

export function readCachedDreams(): Dream[] {
	if (typeof window === "undefined") return [];
	try {
		const cached = sessionStorage.getItem(DREAMS_KEY);
		return cached ? JSON.parse(cached) : [];
	} catch {
		return [];
	}
}

export function hasCachedDreams(): boolean {
	if (typeof window === "undefined") return false;
	return !!sessionStorage.getItem(DREAMS_KEY);
}

export function writeCachedDreams(dreams: Dream[]): void {
	try {
		sessionStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
	} catch {
		/* ignore */
	}
}

export function readCachedDream(id: string): Dream | null {
	return readCachedDreams().find((d) => d.id === id) ?? null;
}

export function updateCachedDream(updated: Dream): void {
	try {
		const dreams = readCachedDreams();
		const idx = dreams.findIndex((d) => d.id === updated.id);
		if (idx !== -1) {
			dreams[idx] = updated;
			writeCachedDreams(dreams);
		}
	} catch {
		/* ignore */
	}
}

export function readAvatar(fallback = "?"): string {
	if (typeof window === "undefined") return fallback;
	return sessionStorage.getItem(AVATAR_KEY) ?? fallback;
}

export function writeAvatar(initial: string): void {
	try {
		sessionStorage.setItem(AVATAR_KEY, initial);
	} catch {
		/* ignore */
	}
}

export function hasSeenSplash(): boolean {
	if (typeof window === "undefined") return true;
	return !!sessionStorage.getItem(SPLASH_KEY);
}

export function markSplashSeen(): void {
	try {
		sessionStorage.setItem(SPLASH_KEY, "1");
	} catch {
		/* ignore */
	}
}

export function writeMockSharedDream(dream: Dream): void {
	try {
		sessionStorage.setItem(MOCK_SHARED_KEY, JSON.stringify(dream));
	} catch {
		/* ignore */
	}
}

export function readMockSharedDream(): Dream | null {
	if (typeof window === "undefined") return null;
	try {
		const cached = sessionStorage.getItem(MOCK_SHARED_KEY);
		return cached ? JSON.parse(cached) : null;
	} catch {
		return null;
	}
}
