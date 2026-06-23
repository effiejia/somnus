// app/components/Modal.tsx
"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type ElementRef, type MouseEvent, useEffect, useRef } from "react";

export function Modal({ children, title }: { children: React.ReactNode; title?: string }) {
	const router = useRouter();
	const dialogRef = useRef<ElementRef<"dialog">>(null);

	useEffect(() => {
		if (!dialogRef.current?.open) {
			dialogRef.current?.showModal();
		}
	}, []);

	function handleClose() {
		router.back();
	}

	function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
		if (!dialogRef.current) return;

		const rect = dialogRef.current.getBoundingClientRect();
		const clickedInDialog =
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom;

		if (!clickedInDialog) {
			handleClose();
		}
	}

	return (
		<motion.dialog
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.2 }}
			ref={dialogRef}
			onClose={handleClose}
			onClick={handleBackdropClick}
			className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg border-none rounded-xl p-0 shadow-2xl backdrop:bg-black/20 bg-black backdrop:backdrop-blur-sm"
		>
			<div className="relative p-8 pt-4">
				{/* Close Button */}
				<div className="flex items-center justify-between mb-4">
					<h1 className="font-serif text-xl text-white font-bold">{title ?? ""}</h1>
					<button
						onClick={handleClose}
						className=" text-gray-400 hover:text-gray-600 transition-colors text-lg"
						aria-label="Close modal"
					>
						✕
					</button>
				</div>
				{children}
			</div>
		</motion.dialog>
	);
}
