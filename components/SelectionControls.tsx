"use client";

interface SelectionControlsProps {
	selecting: boolean;
	selectedCount: number;
	totalCount: number;
	actionLabel: string;
	onAction: () => void;
	onStartSelecting: () => void;
	onCancel: () => void;
}

export default function SelectionControls({
	selecting,
	selectedCount,
	totalCount,
	actionLabel,
	onAction,
	onStartSelecting,
	onCancel,
}: SelectionControlsProps) {
	if (selecting) {
		return (
			<>
				<button
					onClick={onAction}
					disabled={selectedCount === 0}
					className="text-red-400 text-sm disabled:opacity-30"
				>
					{actionLabel} ({selectedCount})
				</button>
				<button onClick={onCancel} className="text-[#6b6b6b] text-sm">
					Cancel
				</button>
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
