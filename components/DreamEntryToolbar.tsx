"use client";

import { DeleteIcon, EyeIcon, RefreshIcon, ShareIcon, SparkleIcon } from "@/components/icons";
import TooltipIconButton from "@/components/TooltipIconButton";

interface DreamEntryToolbarProps {
	buttonMode: "disabled" | "analyze" | "view" | "analyzing";
	isStale: boolean;
	isAnalyzing: boolean;
	onAnalyze: () => void;
	onView: () => void;
	onShare: () => void;
	onDelete: () => void;
}

export default function DreamEntryToolbar({
	buttonMode,
	isStale,
	isAnalyzing,
	onAnalyze,
	onView,
	onShare,
	onDelete,
}: DreamEntryToolbarProps) {
	return (
		<div className="flex items-center gap-2 shrink-0 pt-1">
			{buttonMode === "disabled" && (
				<button
					disabled
					className="text-sm p-1.5 md:px-3 md:py-1 rounded-full bg-[#1a1a1a] text-[#444] cursor-not-allowed flex items-center justify-center"
				>
					<SparkleIcon className="w-4 h-4 md:hidden" />
					<span className="hidden md:inline">Analyze</span>
				</button>
			)}
			{buttonMode === "analyze" && (
				<button
					onClick={onAnalyze}
					className="text-sm p-1.5 md:px-3 md:py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center"
				>
					<SparkleIcon className="w-4 h-4 md:hidden" />
					<span className="hidden md:inline">Analyze</span>
				</button>
			)}
			{buttonMode === "analyzing" && (
				<button
					disabled
					className="flex items-center gap-1.5 text-sm p-1.5 md:px-3 md:py-1 rounded-full bg-blue-600/40 text-blue-300 cursor-not-allowed"
				>
					<span className="w-3 h-3 border-2 border-blue-400/40 border-t-blue-300 rounded-full animate-spin" />
					<span className="hidden md:inline">Analyzing...</span>
				</button>
			)}
			{buttonMode === "view" && (
				<button
					onClick={onView}
					className="text-sm p-1.5 md:px-3 md:py-1 rounded-full border border-[#333] text-[#ededed] hover:border-[#555] transition-colors flex items-center justify-center"
				>
					<EyeIcon className="w-4 h-4 md:hidden" />
					<span className="hidden md:inline">View analysis</span>
				</button>
			)}

			{/* Re-analyze icon — only when stale */}
			{isStale && !isAnalyzing && (
				<TooltipIconButton
					label="Re-analyze"
					icon={<RefreshIcon className="w-4 h-4" />}
					onClick={onAnalyze}
				/>
			)}

			<TooltipIconButton label="Share" icon={<ShareIcon className="w-4 h-4" />} onClick={onShare} />

			<TooltipIconButton
				label="Delete"
				icon={<DeleteIcon className="w-4 h-4" />}
				onClick={onDelete}
				className="text-[#6b6b6b] hover:text-red-400 p-1 transition-colors"
			/>
		</div>
	);
}
