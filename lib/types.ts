export interface Dream {
  id: string
  user_id: string
  title: string
  body: string
  analysis: string | null
  analyzed_body: string | null
  share_token: string | null
  created_at: string
  updated_at: string
}

export type DreamInsert = Pick<Dream, 'title' | 'body'>
export type DreamUpdate = Partial<Pick<Dream, 'title' | 'body' | 'analysis' | 'analyzed_body'>>

export interface SharedDream {
  id: string
  viewer_id: string
  dream_id: string
  sharer_email: string
  saved_at: string
  dream: Dream
}
