import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Terminal, MessageSquare, Briefcase, Play, Send, Image as ImageIcon, X, Trash2, Check, AlertCircle } from 'lucide-react';

// --- Firebase Setup ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Helper Functions ---
const parseLinkedInName = (url) => {
  if (!url) return '';
  const match = url.match(/linkedin\.com\/in\/([^/?]+)/);
  if (!match) return '';
  const slug = match[1].replace(/\d+$/, '');
  return slug.split('-').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const parseCompanyName = (url) => {
  if (!url) return '';
  const lowerUrl = url.toLowerCase();
  let match = lowerUrl.match(/(?:comeet\.com\/jobs|jobs\.smartrecruiters\.com|job-boards\.greenhouse\.io)\/([^/?]+)/);
  if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1);
  
  if (lowerUrl.includes('gh_jid=')) {
    match = lowerUrl.match(/https?:\/\/(?:www\.)?([^.]+)\./);
    if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1);
  }
  
  match = lowerUrl.match(/jobs\.lever\.co\/([^/?]+)/);
  if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1);
  return "";
};

const renderMarkdown = (text) => {
  if (!text) return { __html: '' };
  // Simple regex-based markdown parser
  let html = text
    .replace(/```(?:[a-z]+)?\n([\s\S]*?)```/g, '<pre class="bg-[#1a1a1a] border border-[#444] p-3 rounded-md my-2 overflow-x-auto font-mono text-sm text-[#9EA3F5]"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-[#1a1a1a] border border-[#444] text-[#9EA3F5] px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-300">$1</em>')
    .replace(/\n/g, '<br/>');
  return { __html: html };
};

function CommandsAutomator() {
  const [scripts] = useState([
    { id: '1', name: 'Scrape Job Data', desc: 'Extracts job metadata from a given URL.' },
    { id: '2', name: 'Generate Cover Letter', desc: 'Creates a custom cover letter template.' },
    { id: '3', name: 'Sync CRM', desc: 'Synchronizes local tracking with external CRM.' }
  ]);
  const [selectedScript, setSelectedScript] = useState(scripts[0].id);
  const [commandText, setCommandText] = useState('');
  const [flags, setFlags] = useState('');
  const [result, setResult] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const activeScript = scripts.find(s => s.id === selectedScript);

  const handleExecute = () => {
    setIsExecuting(true);
    setResult(`> Starting execution of '${activeScript.name}'...\n`);
    
    // Mock execution logic
    setTimeout(() => {
      setResult(prev => prev + `> Applying flags: ${flags || 'none'}\n`);
      setTimeout(() => {
        setResult(prev => prev + `> Processing command payload...\n> SUCCESS: Operation completed normally.\n\n--- Execution Details ---\nCommand text processed: ${commandText || 'N/A'}`);
        setIsExecuting(false);
      }, 800);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[#9EA3F5] font-medium mb-1">Select Script</label>
            <select 
              className="w-full bg-[#2a2a2a] border border-[#444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#9EA3F5]"
              value={selectedScript}
              onChange={(e) => setSelectedScript(e.target.value)}
            >
              {scripts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[#9EA3F5] font-medium mb-1">Script Description</label>
            <textarea 
              readOnly 
              className="w-full bg-[#1a1a1a] border border-[#444] rounded px-3 py-2 text-gray-300 resize-none opacity-80" 
              rows={2} 
              value={activeScript?.desc}
            />
          </div>
          <div>
            <label className="block text-[#9EA3F5] font-medium mb-1">Command Text (If Applicable)</label>
            <textarea 
              className="w-full bg-[#2a2a2a] border border-[#444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#9EA3F5] resize-vertical" 
              rows={3} 
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder="Enter additional parameters here..."
            />
          </div>
          <div>
            <label className="block text-[#9EA3F5] font-medium mb-1">Additional Flags</label>
            <input 
              type="text" 
              className="w-full bg-[#2a2a2a] border border-[#444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#9EA3F5]" 
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="e.g. --force --verbose"
            />
          </div>
          <button 
            onClick={handleExecute} 
            disabled={isExecuting}
            className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-[#9EA3F5] text-[#1a1a1a] font-bold rounded hover:bg-[#8a8fe5] transition-colors disabled:opacity-50"
          >
            {isExecuting ? <span className="animate-pulse">Running...</span> : <><Play className="w-5 h-5 mr-2" /> Execute Script</>}
          </button>
        </div>
        
        <div className="flex flex-col">
          <label className="block text-[#9EA3F5] font-medium mb-1">Command Result</label>
          <div className="flex-grow bg-[#1a1a1a] border border-[#444] rounded p-4 overflow-hidden relative">
            <textarea 
              readOnly 
              className="w-full h-full bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none" 
              value={result}
              placeholder="Execution output will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LlmPrompt() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const sendMessage = async () => {
    if (!input.trim() && !imagePreview) return;

    const userMsg = { role: 'user', text: input, image: imagePreview };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    removeImage();
    setIsProcessing(true);

    try {
      const apiKey = ""; // Canvas handles injection
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const parts = [];
      if (userMsg.text) parts.push({ text: userMsg.text });
      if (userMsg.image) {
        const base64Data = userMsg.image.split(',')[1];
        const mimeType = userMsg.image.split(';')[0].split(':')[1];
        parts.push({ inlineData: { data: base64Data, mimeType } });
      }

      const payload = { contents: [{ role: 'user', parts }] };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: `**Error:** Failed to connect to Gemini API.\n\n${error.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

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
              {msg.image && (
                <img src={msg.image} alt="User Upload" className="max-w-[200px] rounded-md mb-2 object-cover border border-black/20" />
              )}
              {msg.text && (
                <div 
                  className="prose prose-invert max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={renderMarkdown(msg.text)} 
                />
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="self-start max-w-[80%] p-3 rounded-lg bg-[#2a2a2a] border border-[#444] text-gray-400 flex items-center">
            <span className="w-2 h-2 bg-[#9EA3F5] rounded-full animate-bounce mr-1"></span>
            <span className="w-2 h-2 bg-[#9EA3F5] rounded-full animate-bounce mr-1" style={{animationDelay: '0.1s'}}></span>
            <span className="w-2 h-2 bg-[#9EA3F5] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 bg-[#2a2a2a] border-t border-[#444]">
        {imagePreview && (
          <div className="relative inline-block mb-2">
            <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded border border-[#444]" />
            <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <label className="cursor-pointer p-2 bg-[#1a1a1a] border border-[#444] rounded hover:border-[#9EA3F5] transition-colors flex-shrink-0 text-[#9EA3F5]">
            <ImageIcon className="w-5 h-5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Message Gemini..."
            className="flex-grow bg-[#1a1a1a] border border-[#444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#9EA3F5] resize-none h-[42px] max-h-[120px]"
            rows={1}
          />
          <button 
            onClick={sendMessage}
            disabled={isProcessing || (!input.trim() && !imagePreview)}
            className="p-2 bg-[#9EA3F5] text-[#1a1a1a] rounded hover:bg-[#8a8fe5] transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

const JobFormRow = ({ user, onJobAdded }) => {
  const [formData, setFormData] = useState({
    company: '', title: '', url: '', state: 'APPLIED', contactLinkedIn: '', contactName: '', contactEmail: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleBlur = () => {
    let updates = { ...formData };
    let changed = false;

    // Auto-fill Contact Name from LinkedIn
    if (updates.contactLinkedIn && !updates.contactName) {
      const name = parseLinkedInName(updates.contactLinkedIn);
      if (name) { updates.contactName = name; changed = true; }
    }

    // Auto-fill Company from URL
    if (updates.url && !updates.company) {
      const comp = parseCompanyName(updates.url);
      if (comp) { updates.company = comp; changed = true; }
    }

    if (changed) setFormData(updates);
  };

  const handleSave = async () => {
    if (!formData.company || !formData.url) return;
    setIsSaving(true);
    try {
      const jobsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'jobs');
      await addDoc(jobsRef, {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setFormData({ company: '', title: '', url: '', state: 'APPLIED', contactLinkedIn: '', contactName: '', contactEmail: '' });
      if (onJobAdded) onJobAdded();
    } catch (error) {
      console.error("Error adding job:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className="bg-[#1a1a1a] border-b-2 border-[#9EA3F5]/30">
      <td className="p-2"><input type="text" placeholder="Company *" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-sm text-white" /></td>
      <td className="p-2"><input type="text" placeholder="Job Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-sm text-white" /></td>
      <td className="p-2"><input type="text" placeholder="Job URL *" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} onBlur={handleBlur} className="w-full bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-sm text-white" /></td>
      <td className="p-2">
        <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-sm text-white">
          <option value="UNKNOWN">Unknown</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEWING">Interviewing</option>
          <option value="REJECTED">Rejected</option>
          <option value="OFFER">Offer</option>
        </select>
      </td>
      <td className="p-2"><input type="text" placeholder="LinkedIn URL" value={formData.contactLinkedIn} onChange={e => setFormData({...formData, contactLinkedIn: e.target.value})} onBlur={handleBlur} className="w-full bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-sm text-white" /></td>
      <td className="p-2"><input type="text" placeholder="Contact Name" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-sm text-white" /></td>
      <td className="p-2"><input type="text" placeholder="Contact Email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-sm text-white" /></td>
      <td className="p-2">
        <button onClick={handleSave} disabled={isSaving || !formData.company || !formData.url} className="w-full bg-[#9EA3F5] text-[#1a1a1a] rounded px-2 py-1 text-sm font-bold hover:bg-[#8a8fe5] disabled:opacity-50 transition-colors flex items-center justify-center">
          {isSaving ? '...' : <><Check className="w-4 h-4 mr-1" /> Add</>}
        </button>
      </td>
    </tr>
  );
};

function JobTracking() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [errorMsg, setErrorMsg] = useState('');

  // Setup Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setErrorMsg("Authentication failed. Please refresh.");
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Jobs
  useEffect(() => {
    if (!user) return;
    const jobsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'jobs');
    const unsubscribe = onSnapshot(jobsRef, 
      (snapshot) => {
        const fetchedJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Simple client-side sort by newest first (descending createdAt string)
        fetchedJobs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setJobs(fetchedJobs);
      },
      (error) => {
        console.error("Error fetching jobs:", error);
        setErrorMsg("Failed to load jobs.");
      }
    );
    return () => unsubscribe();
  }, [user]);

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (!user || selectedIds.size === 0) return;
    try {
      for (let id of selectedIds) {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'jobs', id));
      }
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Error deleting jobs:", err);
      setErrorMsg("Failed to delete selected jobs.");
    }
  };

  if (isInitializing) {
    return <div className="p-8 text-center text-gray-400">Authenticating...</div>;
  }

  return (
    <div className="bg-[#2a2a2a] border border-[#444] rounded-lg p-4 shadow-lg overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#9EA3F5] flex items-center">
          <Briefcase className="w-5 h-5 mr-2" /> Application Tracker
        </h3>
        {selectedIds.size > 0 && (
          <button 
            onClick={handleBulkDelete}
            className="flex items-center px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 rounded transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete Selected ({selectedIds.size})
          </button>
        )}
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
              <th className="p-3 w-10"></th>
              <th className="p-3 font-medium">Company</th>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">URL</th>
              <th className="p-3 font-medium">State</th>
              <th className="p-3 font-medium">LinkedIn</th>
              <th className="p-3 font-medium">Contact</th>
              <th className="p-3 font-medium">Email</th>
            </tr>
          </thead>
          <tbody>
            <JobFormRow user={user} />
            
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500">
                  No applications tracked yet. Fill the row above to add one.
                </td>
              </tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id} className="border-b border-[#444] hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(job.id)} 
                      onChange={() => toggleSelect(job.id)}
                      className="rounded border-[#444] bg-[#1a1a1a] accent-[#9EA3F5]"
                    />
                  </td>
                  <td className="p-3 font-medium text-white">{job.company}</td>
                  <td className="p-3 text-gray-300">{job.title || '-'}</td>
                  <td className="p-3">
                    {job.url ? <a href={job.url} target="_blank" rel="noreferrer" className="text-[#9EA3F5] hover:underline max-w-[150px] truncate inline-block align-bottom">{job.url}</a> : '-'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-[#1a1a1a] border border-[#444] ${job.state === 'OFFER' ? 'text-green-400 border-green-400/30' : job.state === 'REJECTED' ? 'text-red-400 border-red-400/30' : 'text-gray-300'}`}>
                      {job.state}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">
                    {job.contactLinkedIn ? <a href={job.contactLinkedIn} target="_blank" rel="noreferrer" className="hover:text-[#9EA3F5] truncate max-w-[120px] inline-block align-bottom">Profile Link</a> : '-'}
                  </td>
                  <td className="p-3 text-gray-300">{job.contactName || '-'}</td>
                  <td className="p-3 text-gray-300">{job.contactEmail || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default function App() {
  const [activeTab, setActiveTab] = useState('automator');

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 md:p-8 font-sans selection:bg-[#9EA3F5] selection:text-[#1a1a1a]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Navigation */}
        <header className="border-b-2 border-[#444] pb-4 mb-6">
          <h1 className="text-3xl font-bold text-white mb-6">Automator Pro</h1>
          <nav className="flex space-x-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('automator')}
              className={`flex items-center px-5 py-2.5 rounded-t-lg transition-colors font-medium border-b-2 -mb-[18px] ${activeTab === 'automator' ? 'bg-[#2a2a2a] text-[#9EA3F5] border-[#9EA3F5]' : 'text-gray-400 hover:text-white border-transparent'}`}
            >
              <Terminal className="w-4 h-4 mr-2" /> Commands
            </button>
            <button 
              onClick={() => setActiveTab('llm')}
              className={`flex items-center px-5 py-2.5 rounded-t-lg transition-colors font-medium border-b-2 -mb-[18px] ${activeTab === 'llm' ? 'bg-[#2a2a2a] text-[#9EA3F5] border-[#9EA3F5]' : 'text-gray-400 hover:text-white border-transparent'}`}
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Gemini AI
            </button>
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center px-5 py-2.5 rounded-t-lg transition-colors font-medium border-b-2 -mb-[18px] ${activeTab === 'jobs' ? 'bg-[#2a2a2a] text-[#9EA3F5] border-[#9EA3F5]' : 'text-gray-400 hover:text-white border-transparent'}`}
            >
              <Briefcase className="w-4 h-4 mr-2" /> Tracker
            </button>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="bg-[#1a1a1a]">
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
  );
}