import { useState, type FormEvent } from 'react'
import { greenApi } from '../api/greenApi'
import type { Credentials } from '../types'
import Logo from './Logo'

interface Props {
  onLogin: (creds: Credentials) => void
}

export default function LoginScreen({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const creds: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: token.trim(),
    }
    if (!creds.idInstance || !creds.apiTokenInstance) {
      setError('Заполните оба поля')
      return
    }
    setBusy(true)
    setError('')
    try {
      const state = await greenApi.getStateInstance(creds)
      if (state?.stateInstance === 'authorized') {
        onLogin(creds)
        return
      }
      setError(
        `Инстанс не авторизован в MAX (статус: ${state?.stateInstance ?? 'нет данных'}). ` +
          'Отсканируйте QR-код в консоли GREEN-API и попробуйте снова.',
      )
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Не удалось подключиться к GREEN-API',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <Logo size={56} />
        <h1>MAX Чат</h1>
        <p className="login-sub">
          Введите данные инстанса из{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            консоли GREEN-API
          </a>
        </p>
        <form onSubmit={handleSubmit}>
          <input
            className="field"
            placeholder="idInstance"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
          />
          <input
            className="field"
            placeholder="apiTokenInstance"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
          />
          {error && <div className="login-error">{error}</div>}
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Подключение…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
