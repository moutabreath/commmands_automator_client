import { Briefcase, Trash2, AlertCircle, Search } from 'lucide-react'
import { type TrackedJobDto } from '../lib/api'
import JobFormRow from './JobFormRow'

export interface JobRow extends TrackedJobDto {
  company_name: string
  company_id?: string
}

const STATE_COLOR: Record<string, string> = {
  APPLIED: 'text-blue-400 border-blue-400/30',
  CONNECTION_REQUESTED: 'text-yellow-400 border-yellow-400/30',
  MESSAGE_SENT: 'text-purple-400 border-purple-400/30',
  EMAIL_SENT: 'text-orange-400 border-orange-400/30',
}

interface Props {
  userId: string
  jobs: JobRow[]
  selectedIds: Set<string>
  companySearch: string
  isLoading: boolean
  errorMsg: string
  onCompanySearchChange: (val: string) => void
  onFetchJobs: (company: string) => void
  onToggleSelect: (id: string) => void
  onBulkDelete: () => void
  onJobAdded: () => void
}

export default function JobTrackingView({
  userId, jobs, selectedIds, companySearch, isLoading, errorMsg,
  onCompanySearchChange, onFetchJobs, onToggleSelect, onBulkDelete, onJobAdded,
}: Props) {
  return (
    <div className="bg-[#2a2a2a] border border-[#444] rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#9EA3F5] flex items-center">
          <Briefcase className="w-5 h-5 mr-2" /> Application Tracker
        </h3>
        {selectedIds.size > 0 && (
          <button onClick={onBulkDelete} className="flex items-center px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 rounded text-sm">
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-grow bg-[#1a1a1a] border border-[#444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#9EA3F5] text-sm"
          placeholder="Enter company name to load jobs..."
          value={companySearch}
          onChange={e => onCompanySearchChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onFetchJobs(companySearch)}
        />
        <button
          onClick={() => onFetchJobs(companySearch)}
          disabled={isLoading || !companySearch.trim()}
          className="flex items-center px-4 py-2 bg-[#9EA3F5] text-[#1a1a1a] font-bold rounded hover:bg-[#8a8fe5] disabled:opacity-50 transition-colors text-sm"
        >
          <Search className="w-4 h-4 mr-1.5" /> {isLoading ? 'Loading...' : 'Load'}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}
        </div>
      )}

      <div className="overflow-x-auto border border-[#444] rounded">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#1a1a1a] text-gray-400 border-b border-[#444]">
            <tr>
              <th className="p-3 w-10" />
              {['Company', 'Title', 'URL', 'State', 'LinkedIn', 'Contact', 'Email'].map(h => (
                <th key={h} className="p-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <JobFormRow userId={userId} onJobAdded={onJobAdded} />
            {jobs.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-500">Search a company above to load its tracked jobs.</td></tr>
            ) : jobs.map(job => (
              <tr key={job.job_id} className="border-b border-[#444] hover:bg-[#1a1a1a]/50 transition-colors">
                <td className="p-3">
                  <input type="checkbox" checked={!!job.job_id && selectedIds.has(job.job_id)} onChange={() => job.job_id && onToggleSelect(job.job_id)} className="rounded border-[#444] bg-[#1a1a1a] accent-[#9EA3F5]" />
                </td>
                <td className="p-3 font-medium text-white">{job.company_name}</td>
                <td className="p-3 text-gray-300">{job.job_title}</td>
                <td className="p-3">
                  <a href={job.job_url} target="_blank" rel="noreferrer" className="text-[#9EA3F5] hover:underline max-w-[150px] truncate inline-block align-bottom">{job.job_url}</a>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-[#1a1a1a] border border-[#444] ${STATE_COLOR[job.job_state] ?? 'text-gray-300'}`}>
                    {job.job_state}
                  </span>
                </td>
                <td className="p-3 text-gray-400">
                  {job.contact_linkedin ? <a href={job.contact_linkedin} target="_blank" rel="noreferrer" className="hover:text-[#9EA3F5]">Profile Link</a> : '-'}
                </td>
                <td className="p-3 text-gray-300">{job.contact_name || '-'}</td>
                <td className="p-3 text-gray-300">{job.contact_email || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
