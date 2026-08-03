import { supabase } from "@/lib/supabaseClient";

export async function getCurrentUser() {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session?.user ?? null;
}

export async function signOut(): Promise<void> {
	await supabase.auth.signOut();
}

export async function signUp(email: string, password: string) {
	return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
	return supabase.auth.signInWithPassword({ email, password });
}
