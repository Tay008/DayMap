export type ThemeName = 'paper' | 'ink' | 'moss'

const STORAGE_KEY = 'daymap.theme'

export function setTheme(name: ThemeName): void {
  document.documentElement.setAttribute('data-theme', name)
  try {
    localStorage.setItem(STORAGE_KEY, name)
  } catch {
    // localStorage can be blocked (private mode); the attribute still applies
  }
}

export function getTheme(): ThemeName {
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'ink' || attr === 'moss' ? attr : 'paper'
}
