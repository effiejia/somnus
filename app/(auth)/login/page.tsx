"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SomnusIcon from "@/components/SomnusIcon";
import { signIn, signUp } from "@/lib/api/auth";

const motionVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
};

export default function LoginPage() {
	const router = useRouter();
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (mode === "signup") {
			const { error } = await signUp(email, password);
			if (error) {
				setError(error.message);
			} else {
				router.push("/");
				router.refresh();
			}
		} else {
			const { error } = await signIn(email, password);
			if (error) {
				setError(error.message);
			} else {
				router.push("/");
				router.refresh();
			}
		}
		setLoading(false);
	}

	return (
		<motion.div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
			<motion.div
				className="w-full max-w-sm"
				variants={motionVariants}
				initial="initial"
				animate="animate"
				exit="exit"
				transition={{ staggerChildren: 0.05 }}
			>
				{/* Logo */}
				<div className="flex flex-col items-center gap-2 mb-12 justify-center">
					<SomnusIcon size={48} />
					<span className="text-[#ededed] font-serif text-3xl font-medium">Somnus</span>
				</div>

				<h1 className="font-serif text-2xl text-[#ededed] mb-1 text-center">
					{mode === "signin" ? "Welcome back" : "Create account"}
				</h1>
				<p className="text-[#6b6b6b] text-sm text-center mb-8">
					{mode === "signin" ? "Sign in to your dream log" : "Start recording your dreams"}
				</p>

<motion.form onSubmit={handleSubmit} className="space-y-4" variants={motionVariants}>
					<div>
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 text-[#ededed] placeholder-[#444] outline-none focus:border-[#444] transition-colors text-sm"
						/>
					</div>
					<div>
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 text-[#ededed] placeholder-[#444] outline-none focus:border-[#444] transition-colors text-sm"
						/>
					</div>

					{error && <p className="text-red-400 text-sm">{error}</p>}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-[#ededed] text-[#0a0a0a] rounded-lg py-3 text-sm font-medium hover:bg-white transition-colors disabled:opacity-50"
					>
						{loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
					</button>
				</motion.form>

				<p className="text-center text-[#6b6b6b] text-sm mt-6">
					{mode === "signin" ? "Don't have an account? " : "Already have an account? "}
					<button
						onClick={() => {
							setMode(mode === "signin" ? "signup" : "signin");
							setError("");
						}}
						className="text-[#ededed] hover:underline"
					>
						{mode === "signin" ? "Sign up" : "Sign in"}
					</button>
				</p>
			</motion.div>
		</motion.div>
	);
}
