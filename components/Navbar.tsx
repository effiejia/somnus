"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDreamStore } from "@/store/useDreamStore";
import { useSessionStore } from "@/store/useSessionStore";
import { ImportIcon } from "@/components/icons";
import TooltipIconButton from "@/components/TooltipIconButton";
import SomnusIcon from "./SomnusIcon";

export default function Navbar() {
	const router = useRouter();
	const pathname = usePathname();
	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState("");

	const avatarInitial = useSessionStore((s) => s.avatarInitial);
	const signOut = useSessionStore((s) => s.signOut);
	const search = useDreamStore((s) => s.search);
	const hasDreams = useDreamStore((s) => s.dreams.length > 0);
	const openImport = useDreamStore((s) => s.openImport);

	const showSearch = pathname === "/" && hasDreams;
	const showImport = pathname === "/";

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setQuery(e.target.value);
		search(e.target.value);
	}

	async function handleSignOut() {
		await signOut();
		router.push("/login");
	}

	return (
		<>
			{/* Mobile search overlay */}
			{searchOpen && (
				<div className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col p-4 md:hidden">
					<div className="flex items-center gap-3">
						<button
							onClick={() => {
								setSearchOpen(false);
								setQuery("");
								search("");
							}}
							className="text-[#6b6b6b]"
						>
							✕
						</button>
						<input
							// biome-ignore lint/a11y/noAutofocus: <>
							autoFocus
							className="flex-1 bg-transparent text-[#ededed] placeholder-[#6b6b6b] outline-none text-base"
							placeholder="Search dreams..."
							value={query}
							onChange={handleChange}
						/>
					</div>
					<div className="mt-4 h-px bg-[#222222]" />
				</div>
			)}

			<nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-6 h-14 bg-[#0a0a0a]">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2">
					<SomnusIcon size={24} />
					<span className="text-[#ededed] text-sm font-medium hidden sm:block">Somnus</span>
				</Link>

				{/* Desktop search */}
				{showSearch && (
					<div className="hidden md:flex items-center gap-2 bg-[#111111] border border-[#222222] rounded-full px-4 py-1.5 w-64">
						<svg
							className="w-3.5 h-3.5 text-[#6b6b6b]"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
						>
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.35-4.35" />
						</svg>
						<input
							className="bg-transparent text-[#ededed] placeholder-[#6b6b6b] outline-none text-sm w-full"
							placeholder="Search"
							value={query}
							onChange={handleChange}
						/>
					</div>
				)}

				{/* Right side */}
				<div className="flex items-center gap-3">
					{/* Mobile search trigger */}
					{showSearch && (
						<button className="md:hidden text-[#6b6b6b] hover:text-[#ededed] p-1 transition-colors" onClick={() => setSearchOpen(true)}>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<circle cx="11" cy="11" r="8" />
								<path d="m21 21-4.35-4.35" />
							</svg>
						</button>
					)}
					{/* Import */}
					{showImport && (
						<TooltipIconButton
							label="Import dreams"
							icon={<ImportIcon className="w-5 h-5" />}
							onClick={openImport}
						/>
					)}
					{/* Avatar — click to sign out */}
					<button
						onClick={handleSignOut}
						title="Sign out"
						className="w-8 h-8 rounded-full bg-[#222222] flex items-center justify-center text-xs text-[#ededed] hover:bg-[#333] transition-colors"
					>
						{avatarInitial}
					</button>
				</div>
			</nav>

			{/* Spacer so content doesn't hide under fixed nav */}
			<div className="h-14" />
		</>
	);
}
