"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDream, updateDream, deleteDream } from "@/lib/api/dreams";
import * as cache from "@/lib/utils/dreamCache";
import { MOCK_ANALYSIS, MOCK_ANALYSIS_TEXT } from "@/constants/mocks";
import type { Dream } from "@/lib/types";

export function useDreamEntry(id: string) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [dream, setDream] = useState<Dream | null>(() => cache.readCachedDream(id));
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [showPanel, setShowPanel] = useState(false);
	const [showShareModal, setShowShareModal] = useState(false);

	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const bodyRef = useRef<HTMLTextAreaElement>(null);

	const runAnalysis = useCallback(async (d: Dream) => {
		setIsAnalyzing(true);
		try {
			let analysis: string;
			if (MOCK_ANALYSIS) {
				await new Promise((r) => setTimeout(r, 1200));
				analysis = MOCK_ANALYSIS_TEXT;
			} else {
				const res = await fetch("/api/analyze", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ dreamId: d.id, title: d.title, body: d.body }),
				});
				const json = await res.json();
				analysis = json.analysis ?? "No analysis returned.";
			}
			await updateDream(d.id, { analysis, analyzed_body: d.body });
			setDream((prev) => (prev ? { ...prev, analysis, analyzed_body: d.body } : prev));
			setShowPanel(true);
		} catch {
			alert("Analysis failed. Check your API key in .env.local.");
		} finally {
			setIsAnalyzing(false);
		}
	}, []);

	// Sync editable fields when dream loads
	useEffect(() => {
		if (dream) {
			setTitle(dream.title);
			setBody(dream.body);
		}
	}, [dream?.id]);

	// Auto-resize textarea
	useEffect(() => {
		const ta = bodyRef.current;
		if (!ta) return;
		ta.style.height = "auto";
		ta.style.height = ta.scrollHeight + "px";
	}, [body]);

	useEffect(() => {
		async function load() {
			const found = await getDream(id);
			if (!found) {
				router.replace("/");
				return;
			}
			setDream(found);
			setTitle(found.title);
			setBody(found.body);
			if (searchParams.get("analyze") === "true" && !found.analysis) {
				setTimeout(() => runAnalysis(found), 300);
			}
			if (searchParams.get("view") === "true" && found.analysis) {
				setShowPanel(true);
			}
		}
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	function scheduleSave(newTitle: string, newBody: string) {
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(() => save(newTitle, newBody), 1000);
	}

	async function save(newTitle: string, newBody: string) {
		if (!dream) return;
		await updateDream(dream.id, { title: newTitle, body: newBody });
		setDream((prev) => {
			if (!prev) return prev;
			const updated = { ...prev, title: newTitle, body: newBody };
			// Update sessionStorage cache
			cache.updateCachedDream(updated);
			return updated;
		});
	}

	function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setTitle(e.target.value);
		scheduleSave(e.target.value, body);
	}

	function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
		setBody(e.target.value);
		scheduleSave(title, e.target.value);
	}

	async function handleDateChange(localDatetimeValue: string) {
		if (!dream) return;
		const created_at = new Date(localDatetimeValue).toISOString();
		await updateDream(dream.id, { created_at });
		setDream((prev) => (prev ? { ...prev, created_at } : prev));
	}

	function handleBlur(newTitle: string, newBody: string) {
		if (saveTimer.current) clearTimeout(saveTimer.current);
		save(newTitle, newBody);
	}

	// Pass current body/title into runAnalysis so it uses latest edits
	function runAnalysisWithEdits() {
		if (!dream) return;
		runAnalysis({ ...dream, title, body });
	}

	async function handleDelete() {
		if (!confirm("Delete this dream?")) return;
		await deleteDream(id);
		router.replace("/");
	}

	function setShareToken(token: string | null) {
		setDream((prev) => (prev ? { ...prev, share_token: token } : prev));
	}

	return {
		dream,
		title,
		body,
		bodyRef,
		isAnalyzing,
		showPanel,
		setShowPanel,
		showShareModal,
		setShowShareModal,
		handleTitleChange,
		handleBodyChange,
		handleBlur,
		handleDateChange,
		runAnalysis: runAnalysisWithEdits,
		handleDelete,
		setShareToken,
	};
}
