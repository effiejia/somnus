import { supabase } from "@/lib/supabaseClient";
import type { SharedDream } from "@/lib/types";

export async function generateShareToken(id: string): Promise<string> {
	const token = crypto.randomUUID();
	const { error } = await supabase.from("dreams").update({ share_token: token }).eq("id", id);
	if (error) throw error;
	return token;
}

export async function removeShareToken(id: string): Promise<void> {
	const { error } = await supabase.from("dreams").update({ share_token: null }).eq("id", id);
	if (error) throw error;
}

export async function saveSharedDream(dreamId: string): Promise<string> {
	const { data, error } = await supabase.rpc("save_shared_dream", { p_dream_id: dreamId });
	if (error) throw error;
	return data as string;
}

export async function getSharedWithMe(viewerId: string): Promise<SharedDream[]> {
	const { data, error } = await supabase
		.from("shared_with_me")
		.select("*, dream:dream_id(*)")
		.eq("viewer_id", viewerId)
		.order("saved_at", { ascending: false });
	if (error) throw error;
	return (data ?? []) as SharedDream[];
}

export async function removeSharedWithMe(dreamId: string): Promise<void> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return;
	const { error } = await supabase
		.from("shared_with_me")
		.delete()
		.eq("viewer_id", user.id)
		.eq("dream_id", dreamId);
	if (error) throw error;
}

export async function getSharerEmail(dreamId: string): Promise<string | null> {
	const { data } = await supabase
		.from("shared_with_me")
		.select("sharer_email")
		.eq("dream_id", dreamId)
		.single();
	return data?.sharer_email ?? null;
}
