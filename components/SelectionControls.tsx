"use client";

import { DeleteIcon, SparkleIcon, XIcon } from "@/components/icons";
import TooltipIconButton from "@/components/TooltipIconButton";

interface SelectionControlsProps {
	selecting: boolean;
	selectedCount: number;
	totalCount: number;
	onStartSelecting: () => void;
	onSelectAll: () => void;
	onCancel: () => void;

	onDelete?: () => void;
	onAnalyze?: () => void;
	analyzeCount?: number;
	analyzingProgress?: { done: number; total: number } | null;
}

export default function SelectionControls({
	selecting,
	selectedCount,
	totalCount,
	onStartSelecting,
	onSelectAll,
	onCancel,

	onDelete,
	onAnalyze,
	analyzeCount = 0,
	analyzingProgress,
}: SelectionControlsProps) {
	if (selecting) {
		return (
			<>
				<button
					onClick={onSelectAll}
					disabled={!!analyzingProgress}
					className="text-[#6b6b6b] text-sm hover:text-[#888] transition-colors disabled:opacity-30"
				>
					Select all
				</button>

				{onAnalyze && (
					<TooltipIconButton
						label={
							analyzingProgress
								? `Analyzing ${analyzingProgress.done} of ${analyzingProgress.total}…`
								: `Analyze (${analyzeCount})`
						}
						icon={<SparkleIcon className="w-4 h-4" />}
						onClick={onAnalyze}
						className={`p-1 transition-colors ${
							analyzeCount === 0 || !!analyzingProgress
								? "opacity-30 pointer-events-none text-[#6b6b6b]"
								: "text-blue-400 hover:text-blue-300"
						}`}
					/>
				)}

				{onDelete && (
					<TooltipIconButton
						label={`Delete (${selectedCount})`}
						icon={<DeleteIcon className="w-4 h-4" />}
						onClick={onDelete}
						className={`p-1 transition-colors ${
							selectedCount === 0 || !!analyzingProgress
								? "opacity-30 pointer-events-none text-[#6b6b6b]"
								: "text-red-400 hover:text-red-300"
						}`}
					/>
				)}

				<TooltipIconButton
					label="Cancel"
					icon={<XIcon className="w-4 h-4" />}
					onClick={onCancel}
					className={`text-[#555] hover:text-[#888] p-1 transition-colors${analyzingProgress ? " opacity-30 pointer-events-none" : ""}`}
				/>
			</>
		);
	}

	return (
		<>
			<span className="text-[#6b6b6b] text-sm">
				{totalCount} dream{totalCount !== 1 ? "s" : ""}
			</span>
			<button
				onClick={onStartSelecting}
				className="border border-[#333] rounded-full px-3 py-1 text-sm text-[#ededed] hover:border-[#555] transition-colors"
			>
				Select
			</button>
		</>
	);
}
