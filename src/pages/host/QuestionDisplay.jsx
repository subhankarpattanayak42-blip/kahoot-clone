import { useState, useCallback } from 'react'
import { usePlayers } from '../../hooks/usePlayers'
import { showReveal } from '../../firebase/helpers'
import Timer from '../../components/Timer'
import ProgressBar from '../../components/ProgressBar'

export default function QuestionDisplay({ game, roomCode }) {
  const { players } = usePlayers(roomCode)
  const qi = game.currentQuestionIndex
  const question = game.questions[qi]
  const [timerKey, setTimerKey] = useState(qi)

  const answeredCount = players.filter(p => p.answers?.[question.id]).length

  const handleExpire = useCallback(() => {
    showReveal(roomCode)
  }, [roomCode])

  const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-yellow-400', 'bg-green-500']

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col p-6 gap-4">
      <ProgressBar current={qi + 1} total={game.questions.length} />
      <Timer key={timerKey} seconds={question.timeLimit} onExpire={handleExpire} isHost />

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="bg-white/10 rounded-2xl px-8 py-6 text-center max-w-2xl w-full">
          <p className="text-white font-black text-3xl">{question.text}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {question.options.map((opt, i) => (
            <div key={i} className={`${COLORS[i]} text-white font-bold text-lg rounded-2xl p-4 text-center opacity-70`}>
              {opt}
            </div>
          ))}
        </div>

        <p className="text-white/70 text-lg">{answeredCount} / {players.length} answered</p>

        <button
          onClick={() => showReveal(roomCode)}
          className="bg-white text-purple-700 font-bold px-8 py-3 rounded-2xl hover:scale-105 transition"
        >
          End Question Early
        </button>
      </div>
    </div>
  )
}
