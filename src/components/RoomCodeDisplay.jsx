import { useState } from 'react'

export default function RoomCodeDisplay({ code }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-white text-sm uppercase tracking-widest opacity-70">Room Code</p>
      <button
        onClick={copy}
        className="bg-white text-purple-800 font-black text-5xl px-8 py-4 rounded-2xl tracking-widest shadow-lg hover:scale-105 transition-transform"
      >
        {code}
      </button>
      <p className="text-white text-xs opacity-60">{copied ? 'Copied!' : 'Click to copy'}</p>
    </div>
  )
}
