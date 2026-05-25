import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameContext } from '../../context/GameContext'
import { createGame } from '../../firebase/helpers'
import { useAuth } from '../../hooks/useAuth'
import { v4 as uuidv4 } from 'uuid'

const BLANK_QUESTION = () => ({
  id: uuidv4(),
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  timeLimit: 20,
})

export default function CreateQuiz() {
  const navigate = useNavigate()
  const { uid } = useAuth()
  const { setRoomCode, setRole } = useGameContext()
  const [questions, setQuestions] = useState([BLANK_QUESTION()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateQuestion(qi, field, value) {
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, [field]: value } : q))
  }

  function updateOption(qi, oi, value) {
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qi) return q
      const options = [...q.options]
      options[oi] = value
      return { ...q, options }
    }))
  }

  async function handleCreate() {
    for (const q of questions) {
      if (!q.text.trim()) return setError('All questions must have text.')
      if (q.options.some(o => !o.trim())) return setError('All answer options must be filled in.')
    }
    setLoading(true)
    try {
      const code = await createGame(uid, questions)
      setRoomCode(code)
      setRole('host')
      navigate(`/host/${code}`)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-white font-black text-3xl mb-6">Create Your Quiz</h1>
        {questions.map((q, qi) => (
          <div key={q.id} className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold">Question {qi + 1}</span>
              {questions.length > 1 && (
                <button
                  onClick={() => setQuestions(qs => qs.filter((_, i) => i !== qi))}
                  className="text-red-300 hover:text-red-100 text-sm"
                >Remove</button>
              )}
            </div>
            <input
              className="w-full bg-white/20 text-white placeholder-white/50 rounded-xl px-4 py-2 mb-3 outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Question text..."
              value={q.text}
              onChange={e => updateQuestion(qi, 'text', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 mb-3">
              {q.options.map((opt, oi) => (
                <label key={oi} className={`flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer border-2 ${q.correctIndex === oi ? 'border-green-400 bg-green-400/20' : 'border-white/20 bg-white/10'}`}>
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === oi}
                    onChange={() => updateQuestion(qi, 'correctIndex', oi)}
                    className="accent-green-400"
                  />
                  <input
                    className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm"
                    placeholder={`Option ${oi + 1}`}
                    value={opt}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                  />
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3 text-white text-sm">
              <label>Timer:</label>
              {[10, 20, 30, 60].map(t => (
                <button
                  key={t}
                  onClick={() => updateQuestion(qi, 'timeLimit', t)}
                  className={`px-3 py-1 rounded-lg font-bold ${q.timeLimit === t ? 'bg-white text-purple-700' : 'bg-white/20'}`}
                >{t}s</button>
              ))}
            </div>
          </div>
        ))}
        {error && <p className="text-red-300 text-sm mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={() => setQuestions(qs => [...qs, BLANK_QUESTION()])}
            className="flex-1 bg-white/20 text-white font-bold py-3 rounded-2xl hover:bg-white/30 transition"
          >+ Add Question</button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 bg-yellow-400 text-gray-900 font-bold py-3 rounded-2xl hover:bg-yellow-300 transition disabled:opacity-50"
          >{loading ? 'Creating...' : 'Create Game'}</button>
        </div>
      </div>
    </div>
  )
}
