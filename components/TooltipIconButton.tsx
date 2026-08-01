"use client";

interface TooltipIconButtonProps {
	icon: React.ReactNode;
	label: string;
	onClick: (e: React.MouseEvent) => void;
	className?: string;
}

export default function TooltipIconButton({
	icon,
	label,
	onClick,
	className,
}: TooltipIconButtonProps) {
	return (
		<div className="relative group/btn">
			<button
				onClick={onClick}
				aria-label={label}
				className={className ?? "text-[#6b6b6b] hover:text-[#ededed] p-1 transition-colors"}
			>
				{icon}
			</button>
			<span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs text-[#aaa] bg-[#1e1e1e] whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity z-50">
				<span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e1e1e] rotate-45" />
				{label}
			</span>
		</div>
	);
}
