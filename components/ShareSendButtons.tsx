"use client";

interface ShareSendButtonsProps {
	smsUrl: string;
	mailUrl: string;
	onNativeShare: () => void;
	nativeDisabled: boolean;
}

export default function ShareSendButtons({
	smsUrl,
	mailUrl,
	onNativeShare,
	nativeDisabled,
}: ShareSendButtonsProps) {
	return (
		<div className="space-y-2">
			<p className="text-[#555] text-xs uppercase tracking-wide">Send via</p>
			<div className="flex gap-2">
				<a
					href={smsUrl}
					className="flex-1 flex flex-col items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-xl py-3 transition-colors"
				>
					<svg
						className="w-5 h-5 text-[#ededed]"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
					</svg>
					<span className="text-[#aaa] text-xs">Message</span>
				</a>
				<a
					href={mailUrl}
					className="flex-1 flex flex-col items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-xl py-3 transition-colors"
				>
					<svg
						className="w-5 h-5 text-[#ededed]"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<rect width="20" height="16" x="2" y="4" rx="2" />
						<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
					</svg>
					<span className="text-[#aaa] text-xs">Mail</span>
				</a>
				{typeof navigator !== "undefined" && "share" in navigator && (
					<button
						onClick={onNativeShare}
						disabled={nativeDisabled}
						className="flex-1 flex flex-col items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-xl py-3 transition-colors disabled:opacity-40"
					>
						<svg
							className="w-5 h-5 text-[#ededed]"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
						>
							<circle cx="18" cy="5" r="3" />
							<circle cx="6" cy="12" r="3" />
							<circle cx="18" cy="19" r="3" />
							<path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
						</svg>
						<span className="text-[#aaa] text-xs">More</span>
					</button>
				)}
			</div>
		</div>
	);
}
