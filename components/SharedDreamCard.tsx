"use client";

import { DeleteIcon } from "@/components/icons";
import TooltipIconButton from "@/components/TooltipIconButton";
import type { SharedDream } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils/formatDate";

interface SharedDreamCardProps {
	entry: SharedDream;
	onOpen: (entry: SharedDream) => void;
	onRemove: (dreamId: string) => void;
	selecting: boolean;
	selected: boolean;
	onToggleSelect: (id: string) => void;
}

export default function SharedDreamCard({
	entry,
	onOpen,
	onRemove,
	selecting,
	selected,
	onToggleSelect,
}: SharedDreamCardProps) {
	return (
		<div
			onClick={() => {
				if (selecting) {
					onToggleSelect(entry.dream_id);
					return;
				}
				onOpen(entry);
			}}
			className={`group/card relative border-b border-[#1a1a1a] px-4 py-4 cursor-pointer transition-colors hover:bg-[#111111] md:hover:bg-transparent ${
				selected ? "bg-[#111111]" : ""
			}`}
		>
			<div className="flex items-center justify-between gap-16">
				<div className="flex items-center gap-3 min-w-0 flex-1">
					<div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center flex-shrink-0 text-xs text-[#ededed] uppercase">
						{entry.sharer_email[0]}
					</div>
					<div className="min-w-0 flex-1">
						<h3 className="font-serif font-medium text-[#ededed] text-lg leading-snug truncate mb-1">
							{entry.dream.title || "Untitled"}
						</h3>
						<p className="text-[#6b6b6b] text-sm leading-snug truncate">
							<span className="text-[#444]">{formatRelativeDate(entry.dream.created_at)}</span>
							{entry.dream.body && (
								<>
									{" · "}
									{entry.dream.body}
								</>
							)}
						</p>
					</div>
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
						className={`flex items-center gap-2 transition-opacity flex-shrink-0 ${selecting ? "opacity-0 pointer-events-none" : "opacity-100 md:opacity-0 md:group-hover/card:opacity-100"}`}
					>
						<TooltipIconButton
							label="Remove"
							icon={<DeleteIcon className="w-4 h-4" />}
							onClick={(e) => {
								e.stopPropagation();
								onRemove(entry.dream_id);
							}}
							className="text-[#6b6b6b] hover:text-[#888] p-1 transition-colors"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
