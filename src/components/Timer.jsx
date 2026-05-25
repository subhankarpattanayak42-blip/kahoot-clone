import { useEffect, useState } from 'react'

export default function Timer({ seconds, onExpire, isHost = false }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      if (isHost && onExpire) onExpire()
      return
    }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, isHost, onExpire])

  const pct = (remaining / seconds) * 100
  const color = pct > 50 ? 'bg-green-400' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-white font-semibold">{remaining}s</span>
      </div>
      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-linear rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
