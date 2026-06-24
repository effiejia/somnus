"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDreamByShareToken } from "@/lib/api/dreams";
import { saveSharedDream, removeSharedWithMe, getSharerEmail } from "@/lib/api/sharing";
import { getCurrentUser } from "@/lib/api/auth";
import * as cache from "@/lib/utils/dreamCache";
import type { Dream } from "@/lib/types";

export function useSharedDream(token: string) {
	const router = useRouter();
	const [dream, setDream] = useState<Dream | null>(null);
	const [notFound, setNotFound] = useState(false);
	const [sharerEmail, setSharerEmail] = useState<string | null>(null);
	const [isSaved, setIsSaved] = useState(false);
	const [showPanel, setShowPanel] = useState(false);

	useEffect(() => {
		async function load() {
			let found = await getDreamByShareToken(token);
			if (!found) {
				found = cache.readMockSharedDream();
			}
			if (!found) {
				setNotFound(true);
				return;
			}
			setDream(found);

			const user = await getCurrentUser();
			if (!user || user.id === found.user_id) return;

			try {
				const email = await saveSharedDream(found.id);
				setSharerEmail(email);
				setIsSaved(true);
			} catch {
				// Already saved — fetch sharer email
				const email = await getSharerEmail(found.id);
				if (email) setSharerEmail(email);
				setIsSaved(true);
			}
		}
		load();
	}, [token]);

	async function handleRemove() {
		if (!dream) return;
		await removeSharedWithMe(dream.id);
		router.push("/");
	}

	return {
		dream,
		notFound,
		sharerEmail,
		isSaved,
		showPanel,
		setShowPanel,
		handleRemove,
	};
}
