import type { Chat } from './types'

/** Нормализует введённый номер к 7XXXXXXXXXX (РФ) или 375XXXXXXXXX (РБ). */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('8') && d.length === 11) d = '7' + d.slice(1)
  if ((d.startsWith('7') && d.length === 11) || (d.startsWith('375') && d.length === 12)) {
    return d
  }
  return null
}

export function formatPhone(digits: string): string {
  if (digits.startsWith('375') && digits.length === 12) {
    return `+375 ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`
  }
  if (digits.startsWith('7') && digits.length === 11) {
    return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  return digits
}

export function chatTitle(chat: Chat): string {
  return chat.name ?? (chat.phone ? formatPhone(chat.phone) : `ID ${chat.chatId}`)
}

const COLORS = ['#4c6ef5', '#845ef7', '#e8590c', '#0ca678', '#f59f00', '#e64980', '#12b886', '#5c7cfa']

export function colorFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length] ?? '#4c6ef5'
}

export function initials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function formatTime(ts: number): string {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(ts)
}
