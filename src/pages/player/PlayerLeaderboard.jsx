import { useAuth } from '../../hooks/useAuth'
import { usePlayers } from '../../hooks/usePlayers'
import Leaderboard from '../../components/Leaderboard'

export default function PlayerLeaderboard({ game, roomCode }) {
  const { uid } = useAuth()
  const { players } = usePlayers(roomCode)
  const qi = game.currentQuestionIndex

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-6 p-6">
      <h2 className="text-white font-black text-3xl">Leaderboard</h2>
      <p className="text-white/60 text-sm">After question {qi + 1} of {game.questions.length}</p>
      <Leaderboard players={players} highlightUid={uid} />
      <p className="text-white/40 text-sm animate-pulse mt-4">Waiting for host...</p>
    </div>
  )
}
