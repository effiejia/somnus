"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface AnalysisPanelProps {
	analysis: string;
	onClose: () => void;
}

export default function AnalysisPanel({ analysis, onClose }: AnalysisPanelProps) {
	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [onClose]);

	return (
		<>
			{/* Backdrop */}
			<motion.div
				className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				onClick={onClose}
			/>

			{/* Panel */}
			<motion.div
				className="fixed bottom-0 left-1/2 w-full max-w-3xl z-50 bg-[#111111] border border-[#222222] rounded-t-2xl
                   max-h-[80vh] overflow-y-auto"
				initial={{ y: "100%", x: "-50%" }}
				animate={{ y: 0, x: "-50%" }}
				exit={{ y: "100%", x: "-50%" }}
				transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
			>
				<div className="sticky top-0 z-10 bg-[#111111] flex items-center justify-between p-5 pb-4 border-b border-[#222222]">
					<h2 className="font-serif font-medium text-lg text-[#ededed]">Analysis</h2>
					<button
						onClick={onClose}
						className="text-[#6b6b6b] hover:text-[#ededed] transition-colors"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
						>
							<path d="M18 6 6 18M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="p-5 md:p-8">
					<div className="text-[#c0c0c0] text-sm md:text-base leading-relaxed font-serif-thin space-y-4 [&_strong]:text-[#ededed] [&_strong]:font-medium [&_em]:italic [&_ul]:space-y-2 [&_li]:ml-4 [&_li]:list-disc">
						<ReactMarkdown>{analysis}</ReactMarkdown>
					</div>
				</div>
			</motion.div>
		</>
	);
}
