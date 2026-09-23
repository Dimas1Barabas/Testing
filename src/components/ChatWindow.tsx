import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Chat } from '../types'
import { chatTitle, colorFor, formatPhone, formatTime, initials } from '../utils'

interface Props {
  chat: Chat | null
  onSend: (text: string) => Promise<void>
}

export default function ChatWindow({ chat, onSend }: Props) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const count = chat?.messages.length ?? 0

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [count, chat?.chatId])

  async function send() {
    const t = text.trim()
    if (!t || !chat || busy) return
    setBusy(true)
    setError('')
    try {
      await onSend(t)
      setText('')
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Не удалось отправить сообщение')
    } finally {
      setBusy(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void send()
  }

  if (!chat) {
    return (
      <main className="chat-window">
        <div className="chat-empty">
          <div className="chat-empty-inner">
            <div className="chat-empty-logo">{initials('M')}</div>
            <p>Выберите чат или создайте новый</p>
          </div>
        </div>
      </main>
    )
  }

  const title = chatTitle(chat)

  return (
    <main className="chat-window">
      <header className="chat-head">
        <div className="avatar" style={{ background: colorFor(chat.chatId) }}>
          {initials(title)}
        </div>
        <div>
          <div className="title">{title}</div>
          <div className="sub">{chat.phone ? formatPhone(chat.phone) : `ID ${chat.chatId}`}</div>
        </div>
      </header>

      <div className="messages" ref={listRef}>
        {count === 0 && <div className="messages-empty">Напишите первое сообщение</div>}
        {chat.messages.map((m) => (
          <div key={m.id} className={m.out ? 'msg out' : 'msg in'}>
            {m.text}
            <span className="t">{formatTime(m.time)}</span>
          </div>
        ))}
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <input
          placeholder="Сообщение"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
        />
        <button className="send-btn" type="submit" disabled={busy || !text.trim()} title="Отправить">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
          </svg>
        </button>
      </form>
      {error && <div className="send-error">{error}</div>}
    </main>
  )
}
