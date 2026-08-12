import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { joinGame } from '../../firebase/helpers'
import { useAuth } from '../../hooks/useAuth'
import { useGameContext } from '../../context/GameContext'

export default function JoinGame() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { uid } = useAuth()
  const { setRoomCode, setRole, setNickname } = useGameContext()

  // Read from URL query params so a shareable link bypasses manual entry
  const [code, setCode] = useState(() =>
    (searchParams.get('code') || '').toUpperCase().trim()
  )
  const [name, setName] = useState(() => {
    const urlName = searchParams.get('name')
    const urlEmail = searchParams.get('email')
    if (urlName) return urlName.trim()
    if (urlEmail) return urlEmail.trim().split('@')[0] // use email local-part as nickname
    return ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const autoTriggered = useRef(false)

  // Auto-submit when URL params are present and auth is ready
  useEffect(() => {
    if (autoTriggered.current) return
    if (!code || !name) return
    if (!uid) return
    autoTriggered.current = true
    handleJoin()
  }, [code, name, uid])

  async function handleJoin() {
    if (!code.trim() || !name.trim()) return setError('Please enter room code and nickname.')
    setLoading(true)
    try {
      await joinGame(code.toUpperCase().trim(), uid, name.trim())
      setRoomCode(code.toUpperCase().trim())
      setRole('player')
      setNickname(name.trim())
      navigate(`/play/${code.toUpperCase().trim()}`)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  // If auto-joining, show a clean loading state instead of the form
  if (autoTriggered.current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-6xl animate-bounce">⏳</div>
        <h1 className="text-white font-black text-3xl text-center">
          Joining game <span className="text-yellow-300">{code}</span>...
        </h1>
        <p className="text-white/60 text-xl">
          You're in as <span className="text-yellow-300 font-bold">{name}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-white font-black text-4xl">Join Game</h1>
      <div className="bg-white/10 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-4">
        <input
          className="bg-white/20 text-white placeholder-white/50 font-bold text-2xl text-center tracking-widest uppercase rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50"
          placeholder="ROOM CODE"
          value={code}
          maxLength={6}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
        />
        <input
          className="bg-white/20 text-white placeholder-white/50 font-bold text-xl text-center rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50"
          placeholder="Your nickname"
          value={name}
          maxLength={20}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
        />
        {error && <p className="text-red-300 text-sm text-center">{error}</p>}
        <button
          onClick={handleJoin}
          disabled={loading}
          className="bg-yellow-400 text-gray-900 font-bold text-xl py-3 rounded-2xl hover:scale-105 transition disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join!'}
        </button>
      </div>
    </div>
  )
}
