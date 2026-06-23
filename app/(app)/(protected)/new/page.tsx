"use client";

import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getCurrentUser } from "@/lib/api/auth";
import { createDream } from "@/lib/api/dreams";
import { generateTitle } from "@/lib/api/title";
import { useSessionStore } from "@/store/useSessionStore";

export function NewDreamPageUI({ hideCancel }: { hideCancel?: boolean } = {}) {
	const router = useRouter();
	const [body, setBody] = useState("");
	const [saving, setSaving] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const setIsDirty = useSessionStore((s) => s.setIsDirty);
	useEffect(() => {
		getCurrentUser().then((user) => {
			if (!user) router.replace("/login");
			else setUserId(user.id);
		});
	}, [router]);

	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	// Auto-resize textarea
	useEffect(() => {
		if (body.length > 0) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
		const ta = textareaRef.current;
		if (!ta) return;
		ta.style.height = "auto";
		ta.style.height = ta.scrollHeight + "px";
	}, [body]);

	async function handleSave() {
		if (!body.trim() || !userId) return;
		setSaving(true);
		const title = await generateTitle(body);
		const dream = await createDream(userId, title, body);
		router.push(`/dream/${dream.id}`);
	}

	return (
		<main className="max-w-3xl mx-auto px-4 md:px-0 py-4 pb-32">
			<div className="flex items-center justify-between mb-8">
				<p className="text-[#6b6b6b] text-sm">
					{new Date().toLocaleDateString("en-US", {
						month: "long",
						day: "numeric",
						year: "numeric",
					})}
					{" at "}
					{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
				</p>
				<div className="flex items-center gap-2">
					{!hideCancel && (
						<button
							onClick={() => {
								router.back();
							}}
							className="border border-[#333] rounded-full px-3 py-1.5 text-sm text-[#ededed] hover:border-[#555] transition-colors"
						>
							Cancel
						</button>
					)}
					<button
						onClick={handleSave}
						disabled={saving || !body.trim()}
						className="bg-[#ededed] text-[#0a0a0a] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white transition-colors disabled:opacity-40"
					>
						{saving ? "Saving..." : "Save"}
					</button>
				</div>
			</div>

			<textarea
				ref={textareaRef}
				value={body}
				onChange={(e) => setBody(e.target.value)}
				placeholder="What did you dream about?"
				rows={1}
				className="w-full font-serif-thin text-[#c0c0c0] text-base md:text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder-[#333] wrap-break-word"
			/>
		</main>
	);
}

export default function NewDreamPage() {
	redirect("/dream/new");
}
