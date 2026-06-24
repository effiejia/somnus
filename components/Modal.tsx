// app/components/Modal.tsx
"use client";

import { Maximize, X } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type ElementRef, type MouseEvent, useEffect, useRef } from "react";
import { useSessionStore } from "@/store/useSessionStore";

export function Modal({
	children,
	title,
	redirectTo,
}: {
	children: React.ReactNode;
	title?: string;
	redirectTo?: string;
}) {
	const router = useRouter();
	const dialogRef = useRef<ElementRef<"dialog">>(null);
	const setIsDirty = useSessionStore((s) => s.setIsDirty);
	const isDirty = useSessionStore((s) => s.isDirty);
	useEffect(() => {
		if (!dialogRef.current?.open) {
			dialogRef.current?.showModal();
		}
	}, []);

	function handleClose() {
		setIsDirty(false);
		router.back();
	}

	function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
		if (!dialogRef.current || isDirty) return;

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
			className=" fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg border-none rounded-xl p-0 shadow-2xl backdrop:bg-black/20 bg-black backdrop:backdrop-blur-sm"
		>
			<div className="relative p-8 pt-4">
				{/* Close Button */}
				<div className="flex items-center justify-between mb-4">
					<h1 className="font-serif text-xl text-white font-bold">{title ?? ""}</h1>
					<div className="flex items-center gap-2">
						<button
							onClick={handleClose}
							className=" text-gray-400 hover:text-gray-600 transition-colors text-lg"
							aria-label="Close modal"
						>
							<X />
						</button>
					</div>
					{redirectTo && (
						<button
							onClick={() => router.push(redirectTo)}
							className="absolute bottom-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg"
							aria-label="Go to next page"
						>
							<Maximize />
						</button>
					)}
				</div>
				{children}
			</div>
		</motion.dialog>
	);
}
