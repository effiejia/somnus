import { create } from "zustand";
import { signOut as apiSignOut, getCurrentUser } from "@/lib/api/auth";
import * as cache from "@/lib/utils/dreamCache";

type SessionStatus = "idle" | "loading" | "authed" | "anon";

interface SessionState {
	userId: string | null;
	avatarInitial: string;
	status: SessionStatus;
	init: () => Promise<void>;
	signOut: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
	userId: null,
	avatarInitial: "?",
	status: "idle",

	// Idempotent + re-validating. Safe to call on every (app)-layout mount:
	// a concurrent call (React Strict Mode double-invoke) bails while a fetch
	// is in flight; the "loading" flash is only shown on the very first run so
	// re-entering the app after a login/logout cycle doesn't blank the screen.
	init: async () => {
		const { status } = get();
		if (status === "loading") return;
		if (status === "idle") {
			set({ status: "loading", avatarInitial: cache.readAvatar("?") });
		}
		const user = await getCurrentUser();
		if (!user) {
			set({ status: "anon", userId: null, avatarInitial: "?" });
			return;
		}
		const initial = (user.email?.[0] ?? "?").toUpperCase();
		cache.writeAvatar(initial);
		set({ status: "authed", userId: user.id, avatarInitial: initial });
	},

	signOut: async () => {
		await apiSignOut();
		set({ status: "anon", userId: null, avatarInitial: "?" });
	},
}));
