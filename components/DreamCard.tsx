"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteIcon, RefreshIcon, ShareIcon } from "@/components/icons";
import ShareModal from "@/components/ShareModal";
import TooltipIconButton from "@/components/TooltipIconButton";
import type { Dream } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils/formatDate";

interface DreamCardProps {
	dream: Dream;
	onAnalyze: (dream: Dream) => void;
	onViewAnalysis: (dream: Dream) => void;
	onDelete: (id: string) => void;
	onTokenChange: (id: string, token: string | null) => void;
	selecting: boolean;
	selected: boolean;
	onToggleSelect: (id: string) => void;
}

export default function DreamCard({
	dream,
	onAnalyze,
	onViewAnalysis,
	onDelete,
	onTokenChange,
	selecting,
	selected,
	onToggleSelect,
}: DreamCardProps) {
	const router = useRouter();
	const [showShareModal, setShowShareModal] = useState(false);

	const isAnalyzed = !!dream.analysis;
	const isStale = isAnalyzed && dream.body !== dream.analyzed_body;

	function handleClick() {
		if (selecting) {
			onToggleSelect(dream.id);
		} else {
			router.push(`/dream/${dream.id}`);
		}
	}

	return (
		<div
			onClick={handleClick}
			className={`group/card relative border-b border-[#1a1a1a] px-4 py-4 cursor-pointer transition-colors hover:bg-[#111111] md:hover:bg-transparent ${
				selected ? "bg-[#111111]" : ""
			}`}
		>
			<div className="flex items-start justify-between gap-16">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="font-serif font-medium text-[#ededed] text-lg leading-snug truncate">
							{dream.title || "Untitled"}
						</h3>
					</div>
					<p className="text-[#6b6b6b] text-sm leading-snug truncate">
						<span className="text-[#444]">{formatRelativeDate(dream.created_at)}</span>
						{dream.body && (
							<>
								{" · "}
								{dream.body}
							</>
						)}
					</p>
				</div>

				<div className="relative shrink-0 flex items-center">
					{selecting && (
						<div className="absolute inset-0 flex items-center justify-end">
							<div
								className={`w-4 h-4 rounded-full border ${selected ? "bg-blue-500 border-blue-500" : "border-[#444]"}`}
							/>
						</div>
					)}
					<div
						className={`flex items-center gap-2 transition-opacity shrink-0 ${selecting ? "opacity-0 pointer-events-none" : "opacity-100 md:opacity-0 md:group-hover/card:opacity-100"}`}
					>
						{!isAnalyzed && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									onAnalyze(dream);
								}}
								className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1 rounded-full transition-colors"
							>
								Analyze
							</button>
						)}
						{isAnalyzed && (
							<>
								<button
									onClick={(e) => {
										e.stopPropagation();
										onViewAnalysis(dream);
									}}
									className="border border-[#333] hover:border-[#555] text-[#ededed] text-sm px-3 py-1 rounded-full transition-colors"
								>
									View analysis
								</button>
								{isStale && (
									<TooltipIconButton
										label="Re-analyze"
										icon={<RefreshIcon className="w-4 h-4" />}
										onClick={(e) => {
											e.stopPropagation();
											onAnalyze(dream);
										}}
									/>
								)}
							</>
						)}
						<TooltipIconButton
							label="Share"
							icon={<ShareIcon className="w-4 h-4" />}
							onClick={(e) => {
								e.stopPropagation();
								setShowShareModal(true);
							}}
						/>
						<TooltipIconButton
							label="Delete"
							icon={<DeleteIcon className="w-4 h-4" />}
							onClick={(e) => {
								e.stopPropagation();
								onDelete(dream.id);
							}}
							className="text-[#6b6b6b] hover:text-[#888] p-1 transition-colors"
						/>
					</div>
				</div>
			</div>

			{showShareModal && (
				<ShareModal
					dream={dream}
					onClose={() => setShowShareModal(false)}
					onTokenChange={(token) => onTokenChange(dream.id, token)}
				/>
			)}
		</div>
	);
}
