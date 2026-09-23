import { useCallback, useEffect, useState } from 'react'
import { greenApi, type NotificationBody } from './api/greenApi'
import ChatWindow from './components/ChatWindow'
import LoginScreen from './components/LoginScreen'
import NewChatDialog from './components/NewChatDialog'
import Sidebar from './components/Sidebar'
import type { Chat, Credentials, Message } from './types'
import { normalizePhone } from './utils'

const CREDS_KEY = 'max-chat:creds'
const CHATS_KEY = 'max-chat:chats'
const POLL_MS = 3000

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(() => load<Credentials>(CREDS_KEY))
  const [chats, setChats] = useState<Chat[]>(() => load<Chat[]>(CHATS_KEY) ?? [])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (creds) localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
  }, [creds])

  useEffect(() => {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
  }, [chats])

  const activeChat = chats.find((c) => c.chatId === activeChatId) ?? null

  const handleNotification = useCallback((body: NotificationBody) => {
    if (body.typeWebhook !== 'incomingMessageReceived') return
    const chatId = body.senderData?.chatId
    const text = body.messageData?.textMessageData?.textMessage
    if (!chatId || !text || !body.idMessage) return
    const time = body.timestamp ? body.timestamp * 1000 : Date.now()
    setChats((prev) => {
      if (prev.some((c) => c.messages.some((m) => m.id === body.idMessage))) return prev
      const msg: Message = { id: body.idMessage, text, out: false, time }
      const i = prev.findIndex((c) => c.chatId === chatId)
      if (i === -1) {
        const chat: Chat = { chatId, name: body.senderData?.senderName, messages: [msg] }
        return [...prev, chat]
      }
      const next = [...prev]
      next[i] = {
        ...next[i],
        name: next[i].name ?? body.senderData?.senderName,
        messages: [...next[i].messages, msg],
      }
      return next
    })
  }, [])

  // Получение сообщений: поллинг receiveNotification + подтверждение deleteNotification
  useEffect(() => {
    if (!creds) return
    let running = false
    const tick = async () => {
      if (running) return
      running = true
      try {
        for (let i = 0; i < 10; i++) {
          const n = await greenApi.receiveNotification(creds)
          if (!n) break
          await greenApi.deleteNotification(creds, n.receiptId).catch(() => null)
          handleNotification(n.body)
        }
        setConnected(true)
      } catch {
        setConnected(false)
      } finally {
        running = false
      }
    }
    void tick()
    const id = window.setInterval(tick, POLL_MS)
    return () => window.clearInterval(id)
  }, [creds, handleNotification])

  async function createChat(rawPhone: string): Promise<string | null> {
    if (!creds) return 'Сначала войдите'
    const digits = normalizePhone(rawPhone)
    if (!digits) return 'Неверный номер. Формат: +7 999 123-45-67 (РФ или РБ)'
    try {
      const res = await greenApi.checkAccount(creds, Number(digits))
      if (!res || res.exist !== true || !res.chatId) {
        return 'Пользователь с таким номером не найден в MAX'
      }
      const chatId = res.chatId
      setChats((prev) =>
        prev.some((c) => c.chatId === chatId)
          ? prev
          : [...prev, { chatId, phone: digits, messages: [] }],
      )
      setActiveChatId(chatId)
      return null
    } catch (err) {
      return err instanceof Error && err.message ? err.message : 'Ошибка GREEN-API'
    }
  }

  async function handleSend(text: string): Promise<void> {
    if (!creds || !activeChat) throw new Error('Чат не выбран')
    const res = await greenApi.sendMessage(creds, activeChat.chatId, text)
    if (!res?.idMessage) throw new Error('GREEN-API не вернул idMessage')
    setChats((prev) =>
      prev.map((c) =>
        c.chatId === activeChat.chatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: res.idMessage, text, out: true, time: Date.now() },
              ],
            }
          : c,
      ),
    )
  }

  function logout() {
    localStorage.removeItem(CREDS_KEY)
    localStorage.removeItem(CHATS_KEY)
    setCreds(null)
    setChats([])
    setActiveChatId(null)
  }

  if (!creds) {
    return <LoginScreen onLogin={setCreds} />
  }

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        connected={connected}
        onSelect={setActiveChatId}
        onNewChat={() => setDialogOpen(true)}
        onLogout={logout}
      />
      <ChatWindow chat={activeChat} onSend={handleSend} />
      {dialogOpen && <NewChatDialog onClose={() => setDialogOpen(false)} onCreate={createChat} />}
    </div>
  )
}
