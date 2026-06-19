import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '../store/AppContext'
import { login, register, type LoginInput, type RegisterInput } from '../api/auth'

export function useLogin() {
  const { setSession } = useApp()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: ({ token, user }) => {
      setSession(token, user)
      qc.invalidateQueries({ queryKey: ['favoris'] })
      qc.invalidateQueries({ queryKey: ['commandes'] })
    },
  })
}

export function useRegister() {
  const { setSession } = useApp()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: ({ token, user }) => {
      setSession(token, user)
      qc.invalidateQueries({ queryKey: ['favoris'] })
      qc.invalidateQueries({ queryKey: ['commandes'] })
    },
  })
}
