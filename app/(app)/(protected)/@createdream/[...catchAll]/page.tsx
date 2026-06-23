// Closes the intercepting `(.)new` modal on soft navigation (e.g. after saving
// a dream and redirecting to /dream/[id]). Parallel-route slots keep their
// active content visible on client-side navigations that don't match the slot,
// so we match every non-/new route to a component that renders nothing.
export default function CatchAll() {
	return null;
}
