import { useState } from 'react'
import { jobsApi, type TrackedJobDto } from '../lib/api'
import { parseLinkedInName, parseCompanyName } from '../lib/utils'
import JobFormRowView, { type JobFormData } from './JobFormRowView'

interface Props {
  userId: string
  onJobAdded: () => void
}

const EMPTY: JobFormData = { company: '', title: '', url: '', state: 'APPLIED', contactLinkedIn: '', contactName: '', contactEmail: '' }

export default function JobFormRow({ userId, onJobAdded }: Props) {
  const [form, setForm] = useState<JobFormData>(EMPTY)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (key: keyof JobFormData, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleBlur = () => {
    const updates = { ...form }
    let changed = false
    if (updates.contactLinkedIn && !updates.contactName) {
      const name = parseLinkedInName(updates.contactLinkedIn)
      if (name) { updates.contactName = name; changed = true }
    }
    if (updates.url && !updates.company) {
      const comp = parseCompanyName(updates.url)
      if (comp) { updates.company = comp; changed = true }
    }
    if (changed) setForm(updates)
  }

  const handleSave = async () => {
    if (!form.company || !form.url || !form.title) return
    setIsSaving(true)
    try {
      const job: TrackedJobDto = {
        job_url: form.url,
        job_title: form.title,
        job_state: form.state,
        contact_name: form.contactName || undefined,
        contact_linkedin: form.contactLinkedIn || undefined,
        contact_email: form.contactEmail || undefined,
      }
      await jobsApi.trackNew(userId, form.company, job)
      setForm(EMPTY)
      onJobAdded()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <JobFormRowView
      form={form}
      isSaving={isSaving}
      onChange={handleChange}
      onBlur={handleBlur}
      onSave={handleSave}
    />
  )
}
