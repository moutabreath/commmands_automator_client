import { useState } from 'react'
import { jobsApi, type TrackedJobDto, type CompanyDto } from '../lib/api'
import JobTrackingView, { type JobRow } from './JobTrackingView'

const USER_ID = import.meta.env.VITE_USER_ID ?? ''

export default function JobTracking() {
  const [companySearch, setCompanySearch] = useState('')
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchJobs = async (company: string) => {
    if (!company.trim()) return
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await jobsApi.getTracked(USER_ID, company.trim())
      if (res.company) {
        const rows: JobRow[] = res.company.tracked_jobs.map(j => ({
          ...j,
          company_name: res.company!.company_name,
          company_id: res.company!.company_id,
        }))
        setJobs(prev => {
          const others = prev.filter(j => j.company_name.toLowerCase() !== res.company!.company_name.toLowerCase())
          return [...others, ...rows]
        })
      }
    } catch {
      setErrorMsg(`No tracked jobs found for "${company}".`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleBulkDelete = async () => {
    const toDelete = jobs.filter(j => j.job_id && selectedIds.has(j.job_id))
    const byCompany = toDelete.reduce<Record<string, CompanyDto>>((acc, j) => {
      const key = j.company_name
      if (!acc[key]) acc[key] = { company_name: j.company_name, company_id: j.company_id, tracked_jobs: [] }
      acc[key].tracked_jobs.push(j as TrackedJobDto)
      return acc
    }, {})
    try {
      await jobsApi.deleteTracked(USER_ID, Object.values(byCompany))
      const deletedIds = new Set(toDelete.map(j => j.job_id))
      setJobs(prev => prev.filter(j => !deletedIds.has(j.job_id)))
      setSelectedIds(new Set())
    } catch {
      setErrorMsg('Failed to delete selected jobs.')
    }
  }

  return (
    <JobTrackingView
      userId={USER_ID}
      jobs={jobs}
      selectedIds={selectedIds}
      companySearch={companySearch}
      isLoading={isLoading}
      errorMsg={errorMsg}
      onCompanySearchChange={setCompanySearch}
      onFetchJobs={fetchJobs}
      onToggleSelect={toggleSelect}
      onBulkDelete={handleBulkDelete}
      onJobAdded={() => fetchJobs(companySearch)}
    />
  )
}
