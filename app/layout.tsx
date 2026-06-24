import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const ebGaramond = EB_Garamond({
	subsets: ["latin"],
	weight: ["400", "500"],
	style: ["normal", "italic"],
	variable: "--font-serif",
});

const ppNeueMontreal = localFont({
	src: [
		{ path: "../public/fonts/PPNeueMontreal-Book.otf", weight: "400", style: "normal" },
		{ path: "../public/fonts/PPNeueMontreal-Medium.otf", weight: "500", style: "normal" },
		{ path: "../public/fonts/PPNeueMontreal-Italic.otf", weight: "400", style: "italic" },
	],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "Somnus",
	description: "Record, analyze, and share your dreams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${ebGaramond.variable} ${ppNeueMontreal.variable}`}>
			<body className="min-h-screen bg-[#0a0a0a] text-[#ededed] antialiased">{children}</body>
		</html>
	);
}
