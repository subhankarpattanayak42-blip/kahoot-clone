import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_PASSWORD = 'quizblitz'

export default function HostHome() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) { setAuthed(true); setError('') }
    else setError('Incorrect password.')
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-5">
          <div className="text-center">
            <h1 className="text-5xl font-black text-white mb-2">QuizBlitz</h1>
            <p className="text-white/50 text-sm">Host access</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter host password"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-extrabold text-lg transition">
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-white font-black text-6xl tracking-tight drop-shadow-lg">QuizBlitz</h1>
      <p className="text-white/70 text-xl">Host Dashboard</p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate('/host/create')}
          className="bg-white text-purple-700 font-bold text-xl py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          Create a Quiz
        </button>
        <button
          onClick={() => navigate('/play')}
          className="bg-yellow-400 text-gray-900 font-bold text-xl py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          Join a Game
        </button>
      </div>
      <button onClick={() => setAuthed(false)} className="text-white/30 text-xs hover:text-white/60 transition mt-4">
        Logout
      </button>
    </div>
  )
}
