"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionStore } from "@/store/useSessionStore";

export default function ProtectedLayout({
	children,
	createdream,
}: {
	children: React.ReactNode;
	/** Parallel route for new dreams */
	createdream: React.ReactNode;
}) {
	const router = useRouter();
	const status = useSessionStore((s) => s.status);

	useEffect(() => {
		if (status === "anon") router.replace("/login");
	}, [status, router]);

	// Render nothing until the session is confirmed; the (app) layout's navbar
	// stays visible above this blank, matching today's loading flash.
	if (status !== "authed") {
		return <div className="min-h-screen bg-[#0a0a0a]" />;
	}
	return (
		<>
			{children}
			<div>{createdream}</div>
		</>
	);
}
