const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const post = async <T>(path: string, body: unknown): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export interface TrackedJobDto {
  job_id?: string
  job_url: string
  job_title: string
  job_state: string
  update_time?: string
  contact_name?: string
  contact_linkedin?: string
  contact_email?: string
}

export interface CompanyDto {
  company_id?: string
  company_name: string
  tracked_jobs: TrackedJobDto[]
}

export interface CompanyApiResponse {
  code: string
  company?: CompanyDto
}

export const jobsApi = {
  trackNew: (user_id: string, company_name: string, job_dto: TrackedJobDto) =>
    post<CompanyApiResponse>('/api/jobs/track-new', { user_id, company_name, job_dto }),

  getTracked: (user_id: string, company_name: string) =>
    post<CompanyApiResponse>('/api/jobs/get-tracked', { user_id, company_name }),

  deleteTracked: (user_id: string, companies_jobs: CompanyDto[]) =>
    post<{ success: boolean }>('/api/jobs/delete-tracked', { user_id, companies_jobs }),
}
