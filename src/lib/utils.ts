export const renderMarkdown = (text: string): { __html: string } => {
  if (!text) return { __html: '' }
  const html = text
    .replace(/```(?:[a-z]+)?\n([\s\S]*?)```/g, '<pre class="bg-[#1a1a1a] border border-[#444] p-3 rounded-md my-2 overflow-x-auto font-mono text-sm text-[#9EA3F5]"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-[#1a1a1a] border border-[#444] text-[#9EA3F5] px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-300">$1</em>')
    .replace(/\n/g, '<br/>')
  return { __html: html }
}

export const parseLinkedInName = (url: string): string => {
  const match = url.match(/linkedin\.com\/in\/([^/?]+)/)
  if (!match) return ''
  const slug = match[1].replace(/\d+$/, '')
  return slug.split('-').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export const parseCompanyName = (url: string): string => {
  const lower = url.toLowerCase()
  let match = lower.match(/(?:comeet\.com\/jobs|jobs\.smartrecruiters\.com|job-boards\.greenhouse\.io)\/([^/?]+)/)
  if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1)
  if (lower.includes('gh_jid=')) {
    match = lower.match(/https?:\/\/(?:www\.)?([^.]+)\./)
    if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1)
  }
  match = lower.match(/jobs\.lever\.co\/([^/?]+)/)
  if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1)
  return ''
}
