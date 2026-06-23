// Matches the index route "/" for the @createdream slot so a soft navigation
// back to "/" (e.g. canceling a new dream) clears the intercepting `(.)new`
// overlay. `default.tsx` only covers hard navigation/refresh, and the sibling
// `[...catchAll]` route can't match the root, so without this the overlay would
// stay visible after Cancel. See Next.js parallel-routes "modals" docs.
export default function Page() {
	return null;
}
