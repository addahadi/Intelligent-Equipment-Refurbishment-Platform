// Module-level session state, readable by the axios interceptor (which runs
// outside React). The Auth/Lang context keeps these in sync.
import type { Lang } from '../types'

const TOKEN_KEY = 'recond_token'
const LANG_KEY = 'recond_lang'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

let currentLang: Lang = (localStorage.getItem(LANG_KEY) as Lang) || 'fr'

export function getLang(): Lang {
  return currentLang
}

export function setLang(lang: Lang): void {
  currentLang = lang
  localStorage.setItem(LANG_KEY, lang)
}
