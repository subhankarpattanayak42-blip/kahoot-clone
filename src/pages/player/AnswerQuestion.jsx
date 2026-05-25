import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useGameContext } from '../../context/GameContext'
import { submitAnswer } from '../../firebase/helpers'
import AnswerButton from '../../components/AnswerButton'
import Timer from '../../components/Timer'
import ProgressBar from '../../components/ProgressBar'

export default function AnswerQuestion({ game, roomCode }) {
  const { uid } = useAuth()
  const qi = game.currentQuestionIndex
  const question = game.questions[qi]
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setSelected(null)
  }, [question.id])

  async function handleAnswer(optionIndex) {
    if (selected !== null) return
    setSelected(optionIndex)
    await submitAnswer(
      roomCode, uid, question.id,
      optionIndex, question.correctIndex,
      game.questionStartedAt, question.timeLimit
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col p-4 gap-4">
      <ProgressBar current={qi + 1} total={game.questions.length} />
      <Timer seconds={question.timeLimit} />

      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="bg-white/10 rounded-2xl px-6 py-5 text-center">
          <p className="text-white font-black text-2xl">{question.text}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt, i) => (
            <AnswerButton
              key={i}
              index={i}
              text={opt}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              selected={selected === i}
            />
          ))}
        </div>

        {selected !== null && (
          <p className="text-white/70 text-center animate-pulse">Answer submitted! Waiting for host...</p>
        )}
      </div>
    </div>
  )
}
