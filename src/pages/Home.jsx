import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-white font-black text-6xl tracking-tight drop-shadow-lg">QuizBlitz</h1>
      <p className="text-white/70 text-xl">Real-time multiplayer quizzes</p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate('/host/create')}
          className="bg-white text-purple-700 font-bold text-xl py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          Host a Game
        </button>
        <button
          onClick={() => navigate('/play')}
          className="bg-yellow-400 text-gray-900 font-bold text-xl py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          Join a Game
        </button>
      </div>
    </div>
  )
}
