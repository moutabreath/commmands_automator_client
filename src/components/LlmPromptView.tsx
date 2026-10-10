import { type RefObject } from 'react'
import { MessageSquare, Send, Image as ImageIcon, X } from 'lucide-react'
import { renderMarkdown } from '../lib/utils'

export interface Message {
  role: 'user' | 'bot'
  text: string
  image?: string
}

interface Props {
  messages: Message[]
  input: string
  imagePreview: string
  isProcessing: boolean
  chatEndRef: RefObject<HTMLDivElement>
  onInputChange: (val: string) => void
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
  onSend: () => void
}

export default function LlmPromptView({
  messages, input, imagePreview, isProcessing, chatEndRef,
  onInputChange, onImageChange, onRemoveImage, onSend,
}: Props) {
  return (
    <div className="flex flex-col h-[600px] border border-[#444] rounded-lg overflow-hidden bg-[#2a2a2a]">
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#1a1a1a]">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
            <p>Start a conversation with Gemini...</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
            <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-[#9EA3F5] text-[#1a1a1a]' : 'bg-[#2a2a2a] border border-[#444] text-white'}`}>
              {msg.image && <img src={msg.image} alt="Upload" className="max-w-[200px] rounded-md mb-2 object-cover" />}
              {msg.text && <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={renderMarkdown(msg.text)} />}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="self-start p-3 rounded-lg bg-[#2a2a2a] border border-[#444] text-gray-400 flex items-center gap-1">
            {[0, 0.1, 0.2].map((delay, i) => (
              <span key={i} className="w-2 h-2 bg-[#9EA3F5] rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 bg-[#2a2a2a] border-t border-[#444]">
        {imagePreview && (
          <div className="relative inline-block mb-2">
            <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded border border-[#444]" />
            <button onClick={onRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <label className="cursor-pointer p-2 bg-[#1a1a1a] border border-[#444] rounded hover:border-[#9EA3F5] transition-colors flex-shrink-0 text-[#9EA3F5]">
            <ImageIcon className="w-5 h-5" />
            <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
          </label>
          <textarea
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }}
            placeholder="Message Gemini..."
            className="flex-grow bg-[#1a1a1a] border border-[#444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#9EA3F5] resize-none h-[42px] max-h-[120px]"
            rows={1}
          />
          <button
            onClick={onSend}
            disabled={isProcessing || (!input.trim() && !imagePreview)}
            className="p-2 bg-[#9EA3F5] text-[#1a1a1a] rounded hover:bg-[#8a8fe5] transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
