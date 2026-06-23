"use client";

import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AnalysisPanel from "@/components/AnalysisPanel";
import DreamEntryToolbar from "@/components/DreamEntryToolbar";
import Navbar from "@/components/Navbar";
import ShareModal from "@/components/ShareModal";
import { useDreamEntry } from "@/hooks/useDreamEntry";
import { formatEditedSuffix, formatTimestamp } from "@/lib/utils/formatDate";

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
		runAnalysis,
		handleDelete,
		setShareToken,
	} = useDreamEntry(id);

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
		<div className="min-h-screen bg-[#0a0a0a]">
			<Navbar />

			<main className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 py-4 pb-32">
				<div className="flex items-start justify-between gap-4 mb-8">
					<div className="flex-1 min-w-0">
						<input
							value={title}
							onChange={handleTitleChange}
							onBlur={() => handleBlur(title, body)}
							placeholder="Untitled"
							className="font-serif font-medium text-3xl text-[#ededed] leading-tight bg-transparent border-none outline-none w-full placeholder-[#333]"
						/>
						<p className="text-[#6b6b6b] text-sm mt-1">
							{formatTimestamp(dream.created_at)}
							{editedSuffix && (
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
					className="w-full font-serif-thin text-[#c0c0c0] text-base md:text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder-[#333] break-words"
				/>
			</main>

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

			<button
				onClick={() => router.push("/")}
				className="fixed bottom-6 left-6 w-12 h-12 bg-[#1a1a1a] text-[#ededed] rounded-full flex items-center justify-center shadow-lg hover:bg-[#222] transition-colors"
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

			<Link
				href="/new"
				className="fixed bottom-6 right-6 w-12 h-12 bg-[#ededed] text-[#0a0a0a] rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors text-2xl font-light"
			>
				+
			</Link>
		</div>
	);
}
