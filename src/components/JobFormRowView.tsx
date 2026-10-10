import { Check } from 'lucide-react'

export interface JobFormData {
  company: string
  title: string
  url: string
  state: string
  contactLinkedIn: string
  contactName: string
  contactEmail: string
}

interface Props {
  form: JobFormData
  isSaving: boolean
  onChange: (key: keyof JobFormData, value: string) => void
  onBlur: () => void
  onSave: () => void
}

const input = 'w-full bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#9EA3F5]'
const cell = 'p-2'

export default function JobFormRowView({ form, isSaving, onChange, onBlur, onSave }: Props) {
  return (
    <tr className="bg-[#1a1a1a] border-b-2 border-[#9EA3F5]/30">
      <td className={cell}><input className={input} placeholder="Company *" value={form.company} onChange={e => onChange('company', e.target.value)} /></td>
      <td className={cell}><input className={input} placeholder="Job Title *" value={form.title} onChange={e => onChange('title', e.target.value)} /></td>
      <td className={cell}><input className={input} placeholder="Job URL *" value={form.url} onChange={e => onChange('url', e.target.value)} onBlur={onBlur} /></td>
      <td className={cell}>
        <select className={input} value={form.state} onChange={e => onChange('state', e.target.value)}>
          <option value="APPLIED">Applied</option>
          <option value="CONNECTION_REQUESTED">Connection Requested</option>
          <option value="MESSAGE_SENT">Message Sent</option>
          <option value="EMAIL_SENT">Email Sent</option>
          <option value="UNKNOWN">Unknown</option>
        </select>
      </td>
      <td className={cell}><input className={input} placeholder="LinkedIn URL" value={form.contactLinkedIn} onChange={e => onChange('contactLinkedIn', e.target.value)} onBlur={onBlur} /></td>
      <td className={cell}><input className={input} placeholder="Contact Name" value={form.contactName} onChange={e => onChange('contactName', e.target.value)} /></td>
      <td className={cell}><input className={input} placeholder="Contact Email" value={form.contactEmail} onChange={e => onChange('contactEmail', e.target.value)} /></td>
      <td className={cell}>
        <button
          onClick={onSave}
          disabled={isSaving || !form.company || !form.url || !form.title}
          className="w-full bg-[#9EA3F5] text-[#1a1a1a] rounded px-2 py-1 text-sm font-bold hover:bg-[#8a8fe5] disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          {isSaving ? '...' : <><Check className="w-4 h-4 mr-1" /> Add</>}
        </button>
      </td>
    </tr>
  )
}
