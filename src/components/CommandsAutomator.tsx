import { useState } from 'react'
import CommandsAutomatorView from './CommandsAutomatorView'

export const SCRIPTS = [
  { id: '1', name: 'Scrape Job Data', desc: 'Extracts job metadata from a given URL.' },
  { id: '2', name: 'Generate Cover Letter', desc: 'Creates a custom cover letter template.' },
  { id: '3', name: 'Sync CRM', desc: 'Synchronizes local tracking with external CRM.' },
]

export default function CommandsAutomator() {
  const [selectedScript, setSelectedScript] = useState(SCRIPTS[0].id)
  const [commandText, setCommandText] = useState('')
  const [flags, setFlags] = useState('')
  const [result, setResult] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  const activeScript = SCRIPTS.find(s => s.id === selectedScript)!

  const handleExecute = () => {
    setIsExecuting(true)
    setResult(`> Starting execution of '${activeScript.name}'...\n`)
    setTimeout(() => {
      setResult(prev => prev + `> Applying flags: ${flags || 'none'}\n`)
      setTimeout(() => {
        setResult(prev => prev + `> Processing command payload...\n> SUCCESS: Operation completed normally.\n\n--- Execution Details ---\nCommand text processed: ${commandText || 'N/A'}`)
        setIsExecuting(false)
      }, 800)
    }, 400)
  }

  return (
    <CommandsAutomatorView
      scripts={SCRIPTS}
      selectedScript={selectedScript}
      commandText={commandText}
      flags={flags}
      result={result}
      isExecuting={isExecuting}
      activeScriptDesc={activeScript.desc}
      onScriptChange={setSelectedScript}
      onCommandTextChange={setCommandText}
      onFlagsChange={setFlags}
      onExecute={handleExecute}
    />
  )
}
