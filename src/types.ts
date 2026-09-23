export interface Credentials {
  idInstance: string
  apiTokenInstance: string
}

export interface Message {
  id: string
  text: string
  out: boolean
  time: number
}

export interface Chat {
  chatId: string
  phone?: string
  name?: string
  messages: Message[]
}
