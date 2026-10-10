import { Play } from 'lucide-react'

interface Script {
  id: string
  name: string
  desc: string
}

interface Props {
  scripts: Script[]
  selectedScript: string
  commandText: string
  flags: string
  result: string
  isExecuting: boolean
  activeScriptDesc: string
  onScriptChange: (id: string) => void
  onCommandTextChange: (val: string) => void
  onFlagsChange: (val: string) => void
  onExecute: () => void
}

const inputCls = 'w-full bg-[#2a2a2a] border border-[#444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#9EA3F5]'

export default function CommandsAutomatorView({
  scripts, selectedScript, commandText, flags, result, isExecuting,
  activeScriptDesc, onScriptChange, onCommandTextChange, onFlagsChange, onExecute,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-[#9EA3F5] font-medium mb-1">Select Script</label>
          <select className={inputCls} value={selectedScript} onChange={e => onScriptChange(e.target.value)}>
            {scripts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[#9EA3F5] font-medium mb-1">Script Description</label>
          <textarea readOnly className="w-full bg-[#1a1a1a] border border-[#444] rounded px-3 py-2 text-gray-300 resize-none opacity-80" rows={2} value={activeScriptDesc} />
        </div>
        <div>
          <label className="block text-[#9EA3F5] font-medium mb-1">Command Text (If Applicable)</label>
          <textarea className={`${inputCls} resize-vertical`} rows={3} value={commandText} onChange={e => onCommandTextChange(e.target.value)} placeholder="Enter additional parameters here..." />
        </div>
        <div>
          <label className="block text-[#9EA3F5] font-medium mb-1">Additional Flags</label>
          <input type="text" className={inputCls} value={flags} onChange={e => onFlagsChange(e.target.value)} placeholder="e.g. --force --verbose" />
        </div>
        <button onClick={onExecute} disabled={isExecuting} className="flex items-center justify-center px-6 py-3 bg-[#9EA3F5] text-[#1a1a1a] font-bold rounded hover:bg-[#8a8fe5] transition-colors disabled:opacity-50">
          {isExecuting ? <span className="animate-pulse">Running...</span> : <><Play className="w-5 h-5 mr-2" /> Execute Script</>}
        </button>
      </div>

      <div className="flex flex-col">
        <label className="block text-[#9EA3F5] font-medium mb-1">Command Result</label>
        <div className="flex-grow bg-[#1a1a1a] border border-[#444] rounded p-4 min-h-[200px]">
          <textarea readOnly className="w-full h-full bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none" value={result} placeholder="Execution output will appear here..." />
        </div>
      </div>
    </div>
  )
}
