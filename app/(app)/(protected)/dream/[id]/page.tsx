"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import AnalysisPanel from "@/components/AnalysisPanel";
import DreamEntryToolbar from "@/components/DreamEntryToolbar";
import ShareModal from "@/components/ShareModal";
import { useDreamEntry } from "@/hooks/useDreamEntry";
import { formatEditedSuffix, formatTimestamp } from "@/lib/utils/formatDate";

function toDatetimeLocalValue(iso: string): string {
	const d = new Date(iso);
	const offset = d.getTimezoneOffset();
	return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export default function DreamEntryPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const {
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
		runAnalysis,
		handleDelete,
		setShareToken,
	} = useDreamEntry(id);

	const [editingDate, setEditingDate] = useState(false);
	const path = usePathname();
	if (!dream) return null;

	const hasText = body.trim() !== "";
	const isAnalyzed = !!dream.analysis;
	const isStale = isAnalyzed && body !== dream.analyzed_body;

	type ButtonMode = "disabled" | "analyze" | "view" | "analyzing";
	const buttonMode: ButtonMode = isAnalyzing
		? "analyzing"
		: !hasText
			? "disabled"
			: !isAnalyzed
				? "analyze"
				: "view";

	const editedSuffix = formatEditedSuffix(dream.created_at, dream.updated_at);

	return (
		<>
			<motion.main
				initial={{ opacity: 0, x: -10 }}
				animate={
					path === `/dream/${id}`
						? { scale: 1, opacity: 1, x: 0, filter: "none" }
						: { scale: 0.9, opacity: 0.3, x: 0, filter: "blur(10px)" }
				}
				transition={{ duration: 0.2 }}
				className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 py-4 pb-32"
			>
				<button
					onClick={() => router.push("/")}
					className="hidden lg:flex text-[#555] hover:text-[#888] text-sm transition-colors mb-6"
				>
					← Back
				</button>

				<div className="flex items-start justify-between gap-4 mb-8">
					<div className="relative flex-1 min-w-0">
						<input
							value={title}
							onChange={handleTitleChange}
							onBlur={() => handleBlur(title, body)}
							placeholder="Untitled"
							className="font-serif font-medium text-3xl text-[#ededed] leading-tight bg-transparent border-none outline-none w-full placeholder-[#555]"
						/>
						<p className="text-[#6b6b6b] text-sm mt-1">
							{editingDate ? (
								<input
									// biome-ignore lint/a11y/noAutofocus: intentional focus on edit
									autoFocus
									type="datetime-local"
									defaultValue={toDatetimeLocalValue(dream.created_at)}
									onBlur={(e) => {
										setEditingDate(false);
										if (e.target.value) handleDateChange(e.target.value);
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") e.currentTarget.blur();
										if (e.key === "Escape") {
											setEditingDate(false);
										}
									}}
									className="bg-transparent text-[#6b6b6b] text-sm outline-none"
								/>
							) : (
								<button
									onClick={() => setEditingDate(true)}
									className="hover:text-[#888] transition-colors"
								>
									{formatTimestamp(dream.created_at)}
								</button>
							)}
							{!editingDate && editedSuffix && (
								<>
									{" · "}
									{editedSuffix}
								</>
							)}
						</p>
					</div>

					<DreamEntryToolbar
						buttonMode={buttonMode}
						isStale={isStale}
						isAnalyzing={isAnalyzing}
						onAnalyze={runAnalysis}
						onView={() => setShowPanel(true)}
						onShare={() => setShowShareModal(true)}
						onDelete={handleDelete}
					/>
				</div>

				<textarea
					ref={bodyRef}
					value={body}
					onChange={handleBodyChange}
					onBlur={() => handleBlur(title, body)}
					placeholder="Write your dream..."
					rows={1}
					className="w-full font-serif-thin text-[#c0c0c0] text-base md:text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder-[#555] wrap-break-word"
				/>
			</motion.main>

			<AnimatePresence>
				{showPanel && dream.analysis && (
					<AnalysisPanel analysis={dream.analysis} onClose={() => setShowPanel(false)} />
				)}
			</AnimatePresence>

			{showShareModal && (
				<ShareModal
					dream={dream}
					onClose={() => setShowShareModal(false)}
					onTokenChange={setShareToken}
				/>
			)}
			<HomeButton onClick={() => router.push("/")} className="lg:hidden fixed bottom-6 left-6 z-20" />
			<Link
				href="/new"
				className="fixed bottom-6 right-6 z-20 w-12 h-12 bg-[#ededed] text-[#0a0a0a] rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors text-2xl font-light"
			>
				+
			</Link>
		</>
	);
}

function HomeButton({ className, onClick }: { className?: string; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className={
				className +
				" w-12 h-12 bg-[#1a1a1a] text-[#ededed] rounded-full flex items-center justify-center shadow-lg hover:bg-[#222] transition-colors"
			}
		>
			<svg
				className="w-4 h-4"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
		</button>
	);
}
