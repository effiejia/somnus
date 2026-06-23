"use client";

import { DeleteIcon, RefreshIcon, ShareIcon } from "@/components/icons";
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
		<div className="flex items-center gap-2 flex-shrink-0 pt-1">
			{buttonMode === "disabled" && (
				<button
					disabled
					className="text-sm px-3 py-1 rounded-full bg-[#1a1a1a] text-[#444] cursor-not-allowed"
				>
					Analyze
				</button>
			)}
			{buttonMode === "analyze" && (
				<button
					onClick={onAnalyze}
					className="text-sm px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
				>
					Analyze
				</button>
			)}
			{buttonMode === "analyzing" && (
				<button
					disabled
					className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-blue-600/40 text-blue-300 cursor-not-allowed"
				>
					<span className="w-3 h-3 border-2 border-blue-400/40 border-t-blue-300 rounded-full animate-spin" />
					Analyzing...
				</button>
			)}
			{buttonMode === "view" && (
				<button
					onClick={onView}
					className="text-sm px-3 py-1 rounded-full border border-[#333] text-[#ededed] hover:border-[#555] transition-colors"
				>
					View analysis
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
