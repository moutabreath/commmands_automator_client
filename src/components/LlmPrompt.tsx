import { useState, useEffect, useRef } from 'react'
import LlmPromptView, { type Message } from './LlmPromptView'

export default function LlmPrompt() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => setImagePreview('')

  const sendMessage = async () => {
    if (!input.trim() && !imagePreview) return

    const userMsg: Message = { role: 'user', text: input, image: imagePreview }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    removeImage()
    setIsProcessing(true)

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? ''
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

      const parts: object[] = []
      if (userMsg.text) parts.push({ text: userMsg.text })
      if (userMsg.image) {
        parts.push({ inlineData: { data: userMsg.image.split(',')[1], mimeType: userMsg.image.split(';')[0].split(':')[1] } })
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts }] }),
      })
      const data = await response.json()
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.'
      setMessages(prev => [...prev, { role: 'bot', text: botText }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: `**Error:** Failed to connect to Gemini API.\n\n${(error as Error).message}` }])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <LlmPromptView
      messages={messages}
      input={input}
      imagePreview={imagePreview}
      isProcessing={isProcessing}
      chatEndRef={chatEndRef}
      onInputChange={setInput}
      onImageChange={handleImageChange}
      onRemoveImage={removeImage}
      onSend={sendMessage}
    />
  )
}
