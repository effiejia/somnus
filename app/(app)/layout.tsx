"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useSessionStore } from "@/store/useSessionStore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const init = useSessionStore((s) => s.init);

	useEffect(() => {
		init();
	}, [init]);

	return (
		<div className="min-h-screen bg-[#0a0a0a]">
			<Navbar />
			{children}
		</div>
	);
}
