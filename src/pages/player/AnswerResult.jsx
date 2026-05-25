import { useAuth } from '../../hooks/useAuth'
import { usePlayers } from '../../hooks/usePlayers'
import AnswerButton from '../../components/AnswerButton'

export default function AnswerResult({ game, roomCode }) {
  const { uid } = useAuth()
  const { players } = usePlayers(roomCode)
  const qi = game.currentQuestionIndex
  const question = game.questions[qi]

  const me = players.find(p => p.id === uid)
  const myAnswer = me?.answers?.[question.id]
  const isCorrect = myAnswer?.isCorrect
  const pointsEarned = myAnswer?.pointsEarned ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-6 p-6">
      <div className={`text-7xl ${isCorrect ? 'animate-bounce' : ''}`}>
        {isCorrect ? '✅' : '❌'}
      </div>
      <h2 className={`font-black text-4xl ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
        {isCorrect ? 'Correct!' : 'Wrong!'}
      </h2>
      {isCorrect && (
        <p className="text-yellow-300 font-bold text-2xl">+{pointsEarned} points</p>
      )}

      <div className="w-full max-w-sm">
        <p className="text-white/60 text-sm text-center mb-2">Correct answer:</p>
        <AnswerButton
          index={question.correctIndex}
          text={question.options[question.correctIndex]}
          correct
          revealed
          disabled
        />
      </div>

      <p className="text-white/50 text-sm animate-pulse">Waiting for leaderboard...</p>
    </div>
  )
}
