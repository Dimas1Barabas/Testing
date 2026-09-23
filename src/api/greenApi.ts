import type { Credentials } from '../types'

const API_URL = 'https://api.green-api.com'

export interface NotificationBody {
  typeWebhook: string
  idMessage: string
  timestamp: number
  senderData?: {
    chatId: string
    chatName?: string
    senderName?: string
  }
  messageData?: {
    typeMessage: string
    textMessageData?: { textMessage: string }
  }
}

export interface Notification {
  receiptId: number
  body: NotificationBody
}

async function call<T>(creds: Credentials, method: string, init?: RequestInit): Promise<T | null> {
  const res = await fetch(
    `${API_URL}/waInstance${creds.idInstance}/${method}/${creds.apiTokenInstance}`,
    init,
  )
  if (res.status === 204) return null
  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null
  if (!res.ok) {
    throw new Error(data?.error ?? `GREEN-API: HTTP ${res.status}`)
  }
  return data
}

export const greenApi = {
  getStateInstance(creds: Credentials) {
    return call<{ stateInstance: string }>(creds, 'getStateInstance')
  },

  checkAccount(creds: Credentials, phoneNumber: number) {
    return call<{ exist: boolean; chatId?: string }>(creds, 'checkAccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    })
  },

  sendMessage(creds: Credentials, chatId: string, message: string) {
    return call<{ idMessage: string }>(creds, 'sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    })
  },

  receiveNotification(creds: Credentials) {
    return call<Notification>(creds, 'receiveNotification')
  },

  deleteNotification(creds: Credentials, receiptId: number) {
    return call<{ result: boolean }>(creds, `deleteNotification/${receiptId}`, {
      method: 'DELETE',
    })
  },
}
