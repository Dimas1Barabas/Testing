import { useState, type FormEvent } from 'react'

interface Props {
  onClose: () => void
  onCreate: (phone: string) => Promise<string | null>
}

export default function NewChatDialog({ onClose, onCreate }: Props) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    const err = await onCreate(phone)
    setBusy(false)
    if (err) {
      setError(err)
    } else {
      onClose()
    }
  }

  return (
    <div className="dialog-overlay" onClick={busy ? undefined : onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Новый чат</h2>
        <p className="sub">Введите номер телефона получателя в MAX (РФ или РБ)</p>
        <form onSubmit={handleSubmit}>
          <input
            className="field"
            placeholder="+7 999 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoFocus
          />
          {error && <div className="login-error">{error}</div>}
          <div className="actions">
            <button className="btn-ghost" type="button" onClick={onClose} disabled={busy}>
              Отмена
            </button>
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? 'Создание…' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
