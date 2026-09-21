import { useNavigate } from 'react-router-dom'

function TechSambadFooter() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-white/10 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-1">
      <p className="text-white/50 text-xs">
        © {new Date().getFullYear()}{' '}
        <a
          href="https://techsambad.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
        >
          TechSambad OPC Pvt. Ltd.
        </a>
        {' '}· All rights reserved
      </p>
      <p className="text-white/30 text-xs italic text-center sm:text-right">
        Views are my own and made in personal capacity. SAP is not responsible for any content.
      </p>
    </div>
  )
}

export default function PlayerHome() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-8 p-6 pb-20">
      <h1 className="text-white font-black text-6xl tracking-tight drop-shadow-lg">QuizBlitz</h1>
      <p className="text-white/70 text-xl">Real-time multiplayer quizzes</p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate('/play')}
          className="bg-yellow-400 text-gray-900 font-bold text-xl py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          Join a Game
        </button>
      </div>
      <p className="text-white/30 text-sm">Enter a room code to join your session</p>
      <TechSambadFooter />
    </div>
  )
}
