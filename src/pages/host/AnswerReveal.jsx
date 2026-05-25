import { usePlayers } from '../../hooks/usePlayers'
import { showLeaderboard } from '../../firebase/helpers'
import AnswerButton from '../../components/AnswerButton'
import ProgressBar from '../../components/ProgressBar'

export default function AnswerReveal({ game, roomCode }) {
  const { players } = usePlayers(roomCode)
  const qi = game.currentQuestionIndex
  const question = game.questions[qi]
  const correctCount = players.filter(p => p.answers?.[question.id]?.isCorrect).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col p-6 gap-4">
      <ProgressBar current={qi + 1} total={game.questions.length} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <h2 className="text-white font-black text-2xl text-center">Answer Revealed!</h2>
        <div className="bg-white/10 rounded-2xl px-8 py-4 text-center max-w-xl w-full">
          <p className="text-white font-bold text-xl">{question.text}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {question.options.map((opt, i) => (
            <AnswerButton
              key={i}
              index={i}
              text={opt}
              correct={i === question.correctIndex}
              revealed
              disabled
            />
          ))}
        </div>

        <p className="text-white text-lg font-semibold">
          {correctCount} / {players.length} got it right!
        </p>

        <button
          onClick={() => showLeaderboard(roomCode)}
          className="bg-yellow-400 text-gray-900 font-bold text-xl px-10 py-4 rounded-2xl hover:scale-105 transition"
        >
          Show Leaderboard
        </button>
      </div>
    </div>
  )
}
