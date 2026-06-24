"use client";

import { useEffect, useState } from "react";

// Matches Tailwind's `md` breakpoint — below this we treat the viewport as mobile.
const MOBILE_BREAKPOINT = 768;

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
		const update = () => setIsMobile(query.matches);

		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, [breakpoint]);

	return isMobile;
}
