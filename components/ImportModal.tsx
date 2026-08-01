"use client";

import { useEffect, useRef, useState } from "react";
import { importDream } from "@/lib/api/dreams";
import { generateTitle } from "@/lib/api/title";
import { parseDateDocument, parseFiles, type ParsedEntry } from "@/lib/utils/parseDreamImport";

interface ImportModalProps {
	userId: string;
	onClose: () => void;
	onImported: () => void;
}

type Mode = "paste" | "files";
type Stage = "input" | "importing" | "done";

function formatPreviewDate(date: Date | null): string {
	if (!date) return "Today";
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function withDates(entries: ParsedEntry[]): ParsedEntry[] {
	const today = new Date();
	return entries.map((e) => (e.date !== null ? e : { ...e, date: today }));
}

export default function ImportModal({ userId, onClose, onImported }: ImportModalProps) {
	const [mode, setMode] = useState<Mode>("paste");
	const [rawText, setRawText] = useState("");
	const [entries, setEntries] = useState<ParsedEntry[]>([]);
	const [fileCount, setFileCount] = useState(0);
	const [stage, setStage] = useState<Stage>("input");
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (mode !== "paste" || !rawText.trim()) {
			setEntries([]);
			return;
		}
		setEntries(parseDateDocument(rawText));
	}, [rawText, mode]);

	const resolvedEntries = withDates(entries);

	async function handleFiles(fileList: FileList | null) {
		if (!fileList || fileList.length === 0) return;
		setFileCount(fileList.length);
		setEntries(await parseFiles(fileList));
	}

	async function handleImport() {
		if (resolvedEntries.length === 0) return;
		setStage("importing");
		setProgress({ done: 0, total: resolvedEntries.length });

		for (let i = 0; i < resolvedEntries.length; i++) {
			const entry = resolvedEntries[i];
			try {
				const title = await generateTitle(entry.body);
				await importDream(userId, title, entry.body, entry.date!);
			} catch {
				// Continue even if one entry fails
			}
			setProgress({ done: i + 1, total: resolvedEntries.length });
		}

		setStage("done");
		onImported();
	}

	return (
		<div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
			<div className="absolute inset-0 bg-black/60" onClick={onClose} />
			<div className="relative z-10 w-full md:max-w-lg bg-[#111] border border-[#222] rounded-t-2xl md:rounded-2xl p-6 flex flex-col gap-5 max-h-[85vh]">
				<div className="flex items-center justify-between">
					<h2 className="font-serif font-medium text-[#ededed] text-xl">Import dreams</h2>
					<button onClick={onClose} className="text-[#555] hover:text-[#888] text-sm transition-colors">
						✕
					</button>
				</div>

				{stage === "importing" && (
					<div className="flex flex-col items-center gap-3 py-8">
						<div className="w-5 h-5 border-2 border-[#333] border-t-[#888] rounded-full animate-spin" />
						<p className="text-[#6b6b6b] text-sm">
							Creating {progress.done} of {progress.total}…
						</p>
					</div>
				)}

				{stage === "done" && (
					<div className="flex flex-col items-center gap-3 py-8">
						<p className="text-[#ededed] text-sm">
							{progress.total} dream{progress.total !== 1 ? "s" : ""} imported.
						</p>
						<button
							onClick={onClose}
							className="border border-[#333] rounded-full px-4 py-1.5 text-sm text-[#ededed] hover:border-[#555] transition-colors"
						>
							Done
						</button>
					</div>
				)}

				{stage === "input" && (
					<>
						{/* Mode tabs */}
						<div className="flex gap-4 border-b border-[#1a1a1a]">
							{(["paste", "files"] as Mode[]).map((m) => (
								<button
									key={m}
									onClick={() => {
										setMode(m);
										setEntries([]);
										setRawText("");
										setFileCount(0);
									}}
									className={`pb-2 text-sm transition-colors ${
										mode === m
											? "text-[#ededed] border-b border-[#ededed] -mb-px"
											: "text-[#555] hover:text-[#888]"
									}`}
								>
									{m === "paste" ? "Paste text" : "Upload files"}
								</button>
							))}
						</div>

						{mode === "paste" && (
							<textarea
								value={rawText}
								onChange={(e) => setRawText(e.target.value)}
								placeholder={`Paste your dream journal here.\n\nSeparate entries with date headers (e.g. "July 30"), "---" dividers, or leave blank lines between dreams.`}
								className="w-full h-40 bg-[#0a0a0a] border border-[#222] rounded-lg p-3 text-[#c0c0c0] text-sm leading-relaxed resize-none outline-none placeholder-[#555] focus:border-[#333]"
							/>
						)}

						{mode === "files" && (
							<div
								onClick={() => fileInputRef.current?.click()}
								className="flex flex-col items-center justify-center gap-2 h-32 border border-dashed border-[#333] rounded-lg cursor-pointer hover:border-[#555] transition-colors"
							>
								<input
									ref={fileInputRef}
									type="file"
									multiple
									accept=".txt,.md"
									className="hidden"
									onChange={(e) => handleFiles(e.target.files)}
								/>
								<p className="text-[#555] text-sm">
									{fileCount > 0
										? `${fileCount} file${fileCount !== 1 ? "s" : ""} selected`
										: "Click to select .txt or .md files"}
								</p>
								{fileCount === 0 && (
									<p className="text-[#333] text-xs">Upload one or more .txt or .md files</p>
								)}
							</div>
						)}

						{/* Preview */}
						{resolvedEntries.length > 0 && (
							<div className="flex flex-col gap-1 overflow-y-auto max-h-48">
								<p className="text-[#555] text-xs mb-1">
									{resolvedEntries.length} dream{resolvedEntries.length !== 1 ? "s" : ""} detected
									{entries.some((e) => e.date === null) && (
										<span className="text-[#444]"> · Undated entries will be set to today</span>
									)}
								</p>
								{resolvedEntries.map((entry, i) => (
									<div key={i} className="flex gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
										<span className="text-[#444] text-xs shrink-0 w-24">
											{formatPreviewDate(entry.date)}
										</span>
										<span className="text-[#888] text-xs truncate">{entry.body.slice(0, 80)}</span>
									</div>
								))}
							</div>
						)}

						<button
							onClick={handleImport}
							disabled={resolvedEntries.length === 0}
							className="w-full bg-[#ededed] text-[#0a0a0a] rounded-full py-2 text-sm font-medium hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
						>
							{resolvedEntries.length > 0
								? `Import ${resolvedEntries.length} dream${resolvedEntries.length !== 1 ? "s" : ""}`
								: "Import dreams"}
						</button>
					</>
				)}
			</div>
		</div>
	);
}
