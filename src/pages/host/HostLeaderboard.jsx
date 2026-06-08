import { useEffect } from 'react'
import { usePlayers } from '../../hooks/usePlayers'
import { advanceQuestion } from '../../firebase/helpers'
import Leaderboard from '../../components/Leaderboard'
import ProgressBar from '../../components/ProgressBar'

export default function HostLeaderboard({ game, roomCode }) {
  const { players } = usePlayers(roomCode)
  const qi = game.currentQuestionIndex
  const isLast = qi >= game.questions.length - 1
  const wasNoPoints = game.questions[qi]?.noPoints === true

  // Auto-advance past no-points questions without showing leaderboard
  useEffect(() => {
    if (wasNoPoints) {
      advanceQuestion(roomCode, qi + 1, game.questions.length)
    }
  }, [wasNoPoints])

  if (wasNoPoints) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col p-6 gap-4">
      <ProgressBar current={qi + 1} total={game.questions.length} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <h2 className="text-white font-black text-3xl">Leaderboard</h2>
        <Leaderboard players={players} />
        <button
          onClick={() => advanceQuestion(roomCode, qi + 1, game.questions.length)}
          className="bg-yellow-400 text-gray-900 font-bold text-xl px-10 py-4 rounded-2xl hover:scale-105 transition mt-4"
        >
          {isLast ? 'End Game' : 'Next Question'}
        </button>
      </div>
    </div>
  )
}
