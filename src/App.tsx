import { useState } from 'react'
import { Terminal, MessageSquare, Briefcase } from 'lucide-react'
import CommandsAutomator from './components/CommandsAutomator'
import LlmPrompt from './components/LlmPrompt'
import JobTracking from './components/JobTracking'

type Tab = 'automator' | 'llm' | 'jobs'

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'automator', label: 'Commands', Icon: Terminal },
  { id: 'llm', label: 'Gemini AI', Icon: MessageSquare },
  { id: 'jobs', label: 'Tracker', Icon: Briefcase },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('automator')

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 md:p-8 font-sans selection:bg-[#9EA3F5] selection:text-[#1a1a1a]">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="border-b-2 border-[#444] pb-4 mb-6">
          <h1 className="text-3xl font-bold text-white mb-6">Automator Pro</h1>
          <nav className="flex space-x-2 overflow-x-auto">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-5 py-2.5 rounded-t-lg transition-colors font-medium border-b-2 -mb-[18px] ${
                  activeTab === id ? 'bg-[#2a2a2a] text-[#9EA3F5] border-[#9EA3F5]' : 'text-gray-400 hover:text-white border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" /> {label}
              </button>
            ))}
          </nav>
        </header>

        <main>
          {activeTab === 'automator' && (
            <section className="bg-[#2a2a2a] border border-[#444] rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-[#9EA3F5] mb-6">Commands Automator</h2>
              <CommandsAutomator />
            </section>
          )}
          {activeTab === 'llm' && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#9EA3F5] mb-2 px-1">AI Assistant</h2>
              <LlmPrompt />
            </section>
          )}
          {activeTab === 'jobs' && (
            <section>
              <JobTracking />
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
