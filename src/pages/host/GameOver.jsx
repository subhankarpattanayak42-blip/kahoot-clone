import { usePlayers } from '../../hooks/usePlayers'
import { useNavigate } from 'react-router-dom'
import Leaderboard from '../../components/Leaderboard'

export default function HostGameOver({ game, roomCode }) {
  const { players } = usePlayers(roomCode)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-white font-black text-4xl">Game Over!</h1>
      <p className="text-white/70 text-xl">Final Standings</p>
      <Leaderboard players={players} />
      <button
        onClick={() => navigate('/')}
        className="bg-yellow-400 text-gray-900 font-bold text-xl px-10 py-4 rounded-2xl hover:scale-105 transition mt-4"
      >
        Back to Home
      </button>
    </div>
  )
}
