import { supabase } from "@/lib/supabaseClient";
import { encrypt, decrypt } from "@/lib/utils/encryption";
import type { Dream } from "@/lib/types";

async function decryptDream(dream: Dream): Promise<Dream> {
	return {
		...dream,
		body: await decrypt(dream.body),
		analysis: dream.analysis ? await decrypt(dream.analysis) : dream.analysis,
	};
}

export async function getDreams(userId: string): Promise<Dream[]> {
	const { data, error } = await supabase
		.from("dreams")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });
	if (error) throw error;
	return Promise.all((data ?? []).map(decryptDream));
}

export async function getDream(id: string): Promise<Dream | null> {
	const { data, error } = await supabase.from("dreams").select("*").eq("id", id).single();
	if (error) return null;
	return decryptDream(data);
}

export async function getDreamByShareToken(token: string): Promise<Dream | null> {
	const { data, error } = await supabase
		.from("dreams")
		.select("*")
		.eq("share_token", token)
		.single();
	if (error) return null;
	return decryptDream(data);
}

export async function createDream(userId: string, title: string, body: string): Promise<Dream> {
	const { data, error } = await supabase
		.from("dreams")
		.insert({ user_id: userId, title, body: await encrypt(body) })
		.select()
		.single();
	if (error) throw error;
	return decryptDream(data);
}

export async function updateDream(
	id: string,
	fields: { title?: string; body?: string; analysis?: string; analyzed_body?: string; created_at?: string },
): Promise<void> {
	const encrypted: typeof fields = { ...fields };
	if (fields.body !== undefined) encrypted.body = await encrypt(fields.body);
	if (fields.analysis !== undefined) encrypted.analysis = await encrypt(fields.analysis);
	if (fields.analyzed_body !== undefined) encrypted.analyzed_body = await encrypt(fields.analyzed_body);
	const { error } = await supabase
		.from("dreams")
		.update({ ...encrypted, updated_at: new Date().toISOString() })
		.eq("id", id);
	if (error) throw error;
}

export async function importDream(
	userId: string,
	title: string,
	body: string,
	createdAt: Date,
): Promise<Dream> {
	const { data, error } = await supabase
		.from("dreams")
		.insert({ user_id: userId, title, body: await encrypt(body), created_at: createdAt.toISOString() })
		.select()
		.single();
	if (error) throw error;
	return decryptDream(data);
}

export async function deleteDream(id: string): Promise<void> {
	const { error } = await supabase.from("dreams").delete().eq("id", id);
	if (error) throw error;
}
