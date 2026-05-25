import { useAuth } from '../../hooks/useAuth'
import { usePlayers } from '../../hooks/usePlayers'
import { useNavigate } from 'react-router-dom'
import Leaderboard from '../../components/Leaderboard'

export default function PlayerGameOver({ game, roomCode }) {
  const { uid } = useAuth()
  const { players } = usePlayers(roomCode)
  const navigate = useNavigate()

  const rank = players.findIndex(p => p.id === uid) + 1
  const me = players.find(p => p.id === uid)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-white font-black text-4xl">Game Over!</h1>
      {rank > 0 && (
        <p className="text-yellow-300 font-bold text-2xl">
          You finished #{rank} with {me?.score ?? 0} pts
        </p>
      )}
      <Leaderboard players={players} highlightUid={uid} />
      <button
        onClick={() => navigate('/')}
        className="bg-yellow-400 text-gray-900 font-bold text-xl px-10 py-4 rounded-2xl hover:scale-105 transition mt-4"
      >
        Play Again
      </button>
    </div>
  )
}
