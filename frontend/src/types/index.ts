export interface User {
  id: number
  email: string
  username: string
  is_active: boolean
  created_at: string
}

export interface Deck {
  id: number
  title: string
  description: string | null
  owner_id: number
  created_at: string
  updated_at: string
}

export interface Card {
  id: number
  front: string
  back: string
  deck_id: number
  easiness_factor: number
  interval: number
  repetitions: number
  next_review: string
  created_at: string
  updated_at: string
}

export interface ReviewPayload {
  quality: number // 0–5
}

export interface HealthStatus {
  status: string
  environment: string
}

export interface DbHealthStatus {
  status: string
  database: string
}

export type ApiStatus = 'online' | 'offline' | 'checking'
