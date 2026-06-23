"use client";

import { motion } from "motion/react";
import { NewDreamPageUI } from "../../new/page";

export default function NewDream() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			// Sits below the fixed navbar (z-30) and above the main dream log,
			// which scales down + blurs itself behind this translucent scrim.
			className="fixed pt-16 inset-0 z-20 overflow-y-auto bg-[#0a0a0a]/60"
		>
			<NewDreamPageUI />
		</motion.div>
	);
}
