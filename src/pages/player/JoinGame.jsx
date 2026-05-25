import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinGame } from '../../firebase/helpers'
import { useAuth } from '../../hooks/useAuth'
import { useGameContext } from '../../context/GameContext'

export default function JoinGame() {
  const navigate = useNavigate()
  const { uid } = useAuth()
  const { setRoomCode, setRole, setNickname } = useGameContext()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
