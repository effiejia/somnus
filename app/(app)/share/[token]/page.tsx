"use client";

import { useParams } from "next/navigation";
import AnalysisPanel from "@/components/AnalysisPanel";
import { DeleteIcon } from "@/components/icons";
import Navbar from "@/components/Navbar";
import TooltipIconButton from "@/components/TooltipIconButton";
import { useSharedDream } from "@/hooks/useSharedDream";
import { formatTimestamp } from "@/lib/utils/formatDate";

export default function SharedDreamPage() {
	const { token } = useParams() as { token: string };
	const {
		dream,
		notFound,
		sharerEmail,
		isSaved,
		showPanel,
		setShowPanel,
		avatarInitial,
		handleSignOut,
		handleRemove,
	} = useSharedDream(token);

	if (notFound) {
		return (
			<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
				<div className="text-center px-8">
					<p className="font-serif text-2xl text-[#ededed] mb-2">Dream not found</p>
					<p className="text-[#6b6b6b] text-sm">This link may have expired or been removed.</p>
				</div>
			</div>
		);
	}

	if (!dream) return <div className="min-h-screen bg-[#0a0a0a]" />;

	return (
		<div className="min-h-screen bg-[#0a0a0a]">
			<Navbar avatarInitial={avatarInitial} onSignOut={handleSignOut} />

			<main className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 py-4 pb-32">
				<div className="flex items-start justify-between gap-4 mb-8">
					<div className="flex-1 min-w-0">
						<h1 className="font-serif font-medium text-3xl text-[#ededed] leading-tight">
							{dream.title || "Untitled"}
						</h1>
						<p className="text-[#6b6b6b] text-sm mt-1">
							{sharerEmail && (
								<>
									<span className="text-[#555]">From {sharerEmail}</span>
									{" · "}
								</>
							)}
							{formatTimestamp(dream.created_at)}
						</p>
					</div>

					<div className="flex items-center gap-2 shrink-0 pt-1">
						{dream.analysis && (
							<button
								onClick={() => setShowPanel(true)}
								className="text-sm px-3 py-1 rounded-full border border-[#333] text-[#ededed] hover:border-[#555] transition-colors"
							>
								View analysis
							</button>
						)}
						{isSaved && (
							<TooltipIconButton
								label="Remove"
								icon={<DeleteIcon className="w-4 h-4" />}
								onClick={handleRemove}
								className="text-[#6b6b6b] hover:text-red-400 p-1 transition-colors"
							/>
						)}
					</div>
				</div>

				<p className="font-serif-thin text-[#c0c0c0] text-base md:text-lg leading-relaxed whitespace-pre-wrap">
					{dream.body}
				</p>
			</main>

			{showPanel && dream.analysis && (
				<AnalysisPanel analysis={dream.analysis} onClose={() => setShowPanel(false)} />
			)}
		</div>
	);
}
