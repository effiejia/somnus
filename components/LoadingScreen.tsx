"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const LOAD_TEXT = "Dreaming...";

const charVariants = {
	initial: { opacity: 1, x: "-140%" },
	animate: (index: number) => {
		return { opacity: 1, x: "0%", transition: { duration: 0.5, delay: index * 0.05 } };
	},
};

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
	const [fading, setFading] = useState(false);

	useEffect(() => {
		const fadeTimer = setTimeout(() => setFading(true), 1400);
		const doneTimer = setTimeout(onDone, 1900);
		return () => {
			clearTimeout(fadeTimer);
			clearTimeout(doneTimer);
		};
	}, [onDone]);

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] transition-all duration-500 ${
				fading ? "opacity-0 blur-md" : "opacity-100 blur-none"
			} text-3xl `}
		>
			{LOAD_TEXT.split("").map((char, index) => (
				<motion.div
					key={index}
					className="inline-block overflow-hidden px-[0.1em] mx-[-0.1em] font-serif italic leading-relaxed text-[#ededed]"
				>
					<motion.p
						initial={"initial"}
						animate={"animate"}
						exit={"exit"}
						variants={charVariants}
						custom={index}
					>
						{char}
					</motion.p>
				</motion.div>
			))}
		</div>
	);
}
