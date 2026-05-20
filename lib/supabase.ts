import { createClient } from '@supabase/supabase-js'
import type { Dream } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getDreams(userId: string): Promise<Dream[]> {
  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getDream(id: string): Promise<Dream | null> {
  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getDreamByShareToken(token: string): Promise<Dream | null> {
  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('share_token', token)
    .single()
  if (error) return null
  return data
}

export async function createDream(userId: string, title: string, body: string): Promise<Dream> {
  const { data, error } = await supabase
    .from('dreams')
    .insert({ user_id: userId, title, body })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDream(id: string, fields: { title?: string; body?: string; analysis?: string }): Promise<void> {
  const { error } = await supabase
    .from('dreams')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteDream(id: string): Promise<void> {
  const { error } = await supabase.from('dreams').delete().eq('id', id)
  if (error) throw error
}

export async function generateShareToken(id: string): Promise<string> {
  const token = crypto.randomUUID()
  const { error } = await supabase
    .from('dreams')
    .update({ share_token: token })
    .eq('id', id)
  if (error) throw error
  return token
}
