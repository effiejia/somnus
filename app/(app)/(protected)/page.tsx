"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DreamCard from "@/components/DreamCard";
import ImportModal from "@/components/ImportModal";
import LoadingScreen from "@/components/LoadingScreen";
import SelectionControls from "@/components/SelectionControls";
import SharedDreamCard from "@/components/SharedDreamCard";
import { useDreamLog } from "@/hooks/useDreamLog";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useDreamStore } from "@/store/useDreamStore";

export default function DreamLogPage() {
	const {
		loading,
		showSplash,
		dismissSplash,
		dreams,
		filtered,
		tab,
		setTab,
		sharedWithMe,
		selecting,
		startSelecting,
		cancelSelecting,
		selected,
		toggleSelect,
		deleteSelected,
		analyzeSelected,
		analyzingProgress,
		unanalyzedSelectedCount,
		selectAll,
		removeDream,
		removeShared,
		removeSelectedShared,
		onTokenChange,
		openSharedDream,
		goToNew,
		goToAnalyze,
		goToViewAnalysis,
		userId,
		loadDreams,
	} = useDreamLog();

	const importOpen = useDreamStore((s) => s.importOpen);
	const closeImport = useDreamStore((s) => s.closeImport);
	const isMobile = useIsMobile();
	const path = usePathname();

	if (showSplash) return <LoadingScreen onDone={dismissSplash} />;
	if (loading) return null;

	const isEmpty = dreams.length === 0;
	return (
		<>
			<motion.main
				animate={
					path === "/"
						? { scale: 1, opacity: 1, filter: "none" }
						: { scale: 0.9, opacity: 0.3, filter: "blur(10px)" }
				}
				className="max-w-3xl mx-auto px-4 md:px-0 pb-24"
			>
				{isEmpty ? (
					<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-8 text-center">
						<h1 className="font-serif font-medium text-3xl text-[#ededed]">Dream log</h1>
						<p className="text-[#6b6b6b] text-sm max-w-xs">
							You haven&apos;t recorded any dreams yet. Tap the button below to begin.
						</p>
						<button
							onClick={goToNew}
							className="mt-4 bg-[#ededed] text-[#0a0a0a] px-6 py-2 rounded-full text-sm font-medium hover:bg-white transition-colors"
						>
							New dream
						</button>
					</div>
				) : (
					<>
						<h1 className="font-serif font-medium text-3xl text-[#ededed] py-6">Dream log</h1>

						{/* Tab strip + controls */}
						<div className="flex items-center justify-between border-b border-[#1a1a1a] h-11">
							<div className="flex gap-4">
								<button
									onClick={() => {
										setTab("my");
										cancelSelecting();
									}}
									className={`pb-3 text-sm transition-colors ${tab === "my" ? "text-[#ededed] border-b-2 border-[#ededed] -mb-px" : "text-[#555] hover:text-[#888]"}`}
								>
									My dreams
								</button>
								<button
									onClick={() => {
										setTab("shared");
										cancelSelecting();
									}}
									className={`pb-3 text-sm transition-colors flex items-center gap-1.5 ${tab === "shared" ? "text-[#ededed] border-b-2 border-[#ededed] -mb-px" : "text-[#555] hover:text-[#888]"}`}
								>
									Shared with you
									{sharedWithMe.length > 0 && (
										<span
											className={`text-xs rounded-full px-1.5 py-0.5 ${tab === "shared" ? "bg-[#222] text-[#888]" : "bg-[#1a1a1a] text-[#555]"}`}
										>
											{sharedWithMe.length}
										</span>
									)}
								</button>
							</div>

							<div className="flex items-center gap-2">
								{tab === "my" && (
									<SelectionControls
										selecting={selecting}
										selectedCount={selected.size}
										totalCount={dreams.length}
										onStartSelecting={startSelecting}
										onSelectAll={selectAll}
										onCancel={cancelSelecting}
	
										onDelete={deleteSelected}
										onAnalyze={analyzeSelected}
										analyzeCount={unanalyzedSelectedCount}
										analyzingProgress={analyzingProgress}
									/>
								)}
								{tab === "shared" && (
									<SelectionControls
										selecting={selecting}
										selectedCount={selected.size}
										totalCount={sharedWithMe.length}
										onStartSelecting={startSelecting}
										onSelectAll={selectAll}
										onCancel={cancelSelecting}
	
										onDelete={removeSelectedShared}
									/>
								)}
							</div>
						</div>

						{tab === "my" && (
							<div>
								{filtered.map((dream, index) => (
									<DreamAnimation index={index} key={index + "my"}>
										<DreamCard
											key={dream.id}
											dream={dream}
											onAnalyze={goToAnalyze}
											onViewAnalysis={goToViewAnalysis}
											onDelete={removeDream}
											onTokenChange={onTokenChange}
											selecting={selecting}
											selected={selected.has(dream.id)}
											onToggleSelect={toggleSelect}
										/>
									</DreamAnimation>
								))}
								{filtered.length === 0 && (
									<p className="text-center text-[#6b6b6b] text-sm py-16">No results</p>
								)}
							</div>
						)}

						{tab === "shared" && (
							<div>
								{sharedWithMe.length === 0 ? (
									<p className="text-center text-[#6b6b6b] text-sm py-16">
										No dreams have been shared with you yet.
									</p>
								) : (
									sharedWithMe.map((entry, index) => (
										<DreamAnimation index={index} key={index + "shared"}>
											<SharedDreamCard
												key={entry.id}
												entry={entry}
												onOpen={openSharedDream}
												onRemove={removeShared}
												selecting={selecting}
												selected={selected.has(entry.dream_id)}
												onToggleSelect={toggleSelect}
											/>
										</DreamAnimation>
									))
								)}
							</div>
						)}
					</>
				)}
			</motion.main>

			<Link
				className="fixed bottom-6 right-6 w-12 h-12 bg-[#ededed] text-[#0a0a0a] rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors text-xl font-light"
				href={isMobile ? "/dream/new" : "/new"}
			>
				+
			</Link>

			{importOpen && userId && (
				<ImportModal
					userId={userId}
					onClose={closeImport}
					onImported={() => {
						if (userId) loadDreams(userId);
					}}
				/>
			)}
		</>
	);
}

function DreamAnimation({ children, index }: { children: React.ReactNode; index: number }) {
	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{
				opacity: 1,
				x: 0,
				transition: { duration: 0.2, delay: 0.1 * index },
			}}
			exit={{ opacity: 0, x: 20 }}
		>
			{children}
		</motion.div>
	);
}
