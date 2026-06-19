import api from '../lib/axios'
import { authResponseSchema, userSchema } from '../lib/schemas'
import type { User } from '../types'

export interface LoginInput { email: string; password: string }
export interface RegisterInput {
  nom: string
  email: string
  password: string
  telephone?: string
  adresse?: string
}

export async function login(input: LoginInput): Promise<{ token: string; user: User }> {
  const { data } = await api.post('/auth/login', input)
  return authResponseSchema.parse(data) as { token: string; user: User }
}

export async function register(input: RegisterInput): Promise<{ token: string; user: User }> {
  const { data } = await api.post('/auth/register', input)
  return authResponseSchema.parse(data) as { token: string; user: User }
}

export async function me(): Promise<User> {
  const { data } = await api.get('/auth/me')
  return userSchema.parse(data) as User
}
