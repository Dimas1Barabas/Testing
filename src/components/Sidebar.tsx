import { useState } from 'react'
import type { Chat } from '../types'
import { chatTitle, colorFor, formatTime, initials } from '../utils'
import Logo from './Logo'

interface Props {
  chats: Chat[]
  activeChatId: string | null
  connected: boolean
  onSelect: (chatId: string) => void
  onNewChat: () => void
  onLogout: () => void
}

export default function Sidebar({
  chats,
  activeChatId,
  connected,
  onSelect,
  onNewChat,
  onLogout,
}: Props) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const visible = chats
    .filter((c) => !q || chatTitle(c).toLowerCase().includes(q) || (c.phone ?? '').includes(q))
    .toSorted((a, b) => {
      const ta = a.messages[a.messages.length - 1]?.time ?? 0
      const tb = b.messages[b.messages.length - 1]?.time ?? 0
      return tb - ta
    })

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <Logo size={34} />
        <span className="brand">MAX</span>
        <button className="icon-btn" type="button" onClick={onLogout} title="Выйти">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
        </button>
      </div>

      <div className="sidebar-search">
        <input
          className="field"
          placeholder="Поиск"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="sidebar-new">
        <button className="new-chat-btn" type="button" onClick={onNewChat}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
          Создать чат
        </button>
      </div>

      <div className="chat-list">
        {visible.length === 0 && (
          <div className="chat-list-empty">
            {chats.length === 0 ? 'Нет чатов. Создайте первый чат.' : 'Ничего не найдено'}
          </div>
        )}
        {visible.map((chat) => {
          const title = chatTitle(chat)
          const last = chat.messages[chat.messages.length - 1]
          return (
            <div
              key={chat.chatId}
              className={chat.chatId === activeChatId ? 'chat-item active' : 'chat-item'}
              onClick={() => onSelect(chat.chatId)}
            >
              <div className="avatar" style={{ background: colorFor(chat.chatId) }}>
                {initials(title)}
              </div>
              <div className="row">
                <div className="name">{title}</div>
                <div className="last">{last ? last.text : 'Нет сообщений'}</div>
              </div>
              {last && <span className="time">{formatTime(last.time)}</span>}
            </div>
          )
        })}
      </div>

      <div className="sidebar-foot">
        <span className={connected ? 'dot on' : 'dot'} />
        {connected ? 'Подключено' : 'Нет связи'}
      </div>
    </aside>
  )
}
