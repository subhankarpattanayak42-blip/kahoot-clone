import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import { useGameContext } from '../../context/GameContext'
import { createGame, saveQuiz, loadSavedQuizzes, deleteSavedQuiz } from '../../firebase/helpers'
import { useAuth } from '../../hooks/useAuth'

const DEFAULT_TIME = 20

const BLANK_QUESTION = () => ({
  id: uuidv4(),
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  timeLimit: DEFAULT_TIME,
  noPoints: false,
})

function parseExcel(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  return rows
    .map(row => ({
      id: uuidv4(),
      text: String(row.question || row.Question || '').trim(),
      options: [
        String(row.option1 || row.Option1 || '').trim(),
        String(row.option2 || row.Option2 || '').trim(),
        String(row.option3 || row.Option3 || '').trim(),
        String(row.option4 || row.Option4 || '').trim(),
      ],
      correctIndex: Math.max(0, parseInt(row.correct || row.Correct || 1) - 1),
      timeLimit: parseInt(row.time || row.Time || DEFAULT_TIME) || DEFAULT_TIME,
      noPoints: String(row.points ?? row.Points ?? '1').trim() === '0',
    }))
    .filter(q => q.text && q.options.every(o => o))
}

function parseMarkdown(text) {
  const questions = []
  const blocks = text.split(/^## /m).filter(Boolean)
  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean)
    const questionText = lines[0].trim()
    const optionLines = lines.filter(l => l.startsWith('- '))
    const timeLine = lines.find(l => l.toLowerCase().startsWith('time:'))
    const timeLimit = timeLine ? parseInt(timeLine.split(':')[1]) || DEFAULT_TIME : DEFAULT_TIME
    const options = optionLines.map(l => l.replace(/^- /, '').replace(/\s*✓\s*$/, '').trim())
    const correctIndex = optionLines.findIndex(l => l.includes('✓'))
    if (questionText && options.length === 4) {
      questions.push({
        id: uuidv4(),
        text: questionText,
        options,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        timeLimit,
        noPoints: false,
      })
    }
  }
  return questions
}

export default function CreateQuiz() {
  const navigate = useNavigate()
  const { uid } = useAuth()
  const { setRoomCode, setRole } = useGameContext()
  const [questions, setQuestions] = useState([BLANK_QUESTION()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadMsg, setUploadMsg] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef()

  // Saved quizzes state
  const [savedQuizzes, setSavedQuizzes] = useState([])
  const [quizName, setQuizName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (!uid) return
    loadSavedQuizzes(uid).then(setSavedQuizzes).catch(() => {})
  }, [uid])

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

  async function handleFile(file) {
    setError('')
    setUploadMsg('')
    if (!file) return
    try {
      let parsed = []
      if (file.name.endsWith('.xlsx')) {
        const buf = await file.arrayBuffer()
        parsed = parseExcel(buf)
      } else if (file.name.endsWith('.md')) {
        const text = await file.text()
        parsed = parseMarkdown(text)
      } else {
        setError('Only .xlsx and .md files are supported.')
        return
      }
      if (parsed.length === 0) {
        setError('No valid questions found in the file. Check the format matches the sample.')
        return
      }
      setQuestions(qs => {
        const existing = qs.filter(q => q.text.trim())
        return [...existing, ...parsed]
      })
      setUploadMsg(`${parsed.length} question${parsed.length !== 1 ? 's' : ''} loaded from file!`)
    } catch (e) {
      setError('Failed to parse file: ' + e.message)
    }
  }

  async function handleFileInput(e) {
    await handleFile(e.target.files[0])
    e.target.value = ''
  }

  async function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    await handleFile(e.dataTransfer.files[0])
  }

  async function handleSaveQuiz() {
    const name = quizName.trim() || `Quiz ${new Date().toLocaleDateString()}`
    const valid = questions.filter(q => q.text.trim() && q.options.every(o => o.trim()))
    if (valid.length === 0) { setError('Add at least one complete question before saving.'); return }
    setSaving(true)
    setSaveMsg('')
    try {
      await saveQuiz(uid, name, valid)
      const updated = await loadSavedQuizzes(uid)
      setSavedQuizzes(updated)
      setSaveMsg(`Saved "${name}"`)
      setQuizName('')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (e) {
      setError('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  function handleLoadQuiz(quiz) {
    setQuestions(quiz.questions.map(q => ({ ...q, id: q.id || uuidv4() })))
    setUploadMsg(`Loaded "${quiz.name}" (${quiz.questions.length} questions)`)
    setShowSaved(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDeleteQuiz(quizId, name) {
    await deleteSavedQuiz(uid, quizId)
    setSavedQuizzes(qs => qs.filter(q => q.id !== quizId))
    setSaveMsg(`Deleted "${name}"`)
    setTimeout(() => setSaveMsg(''), 2000)
  }

  async function handleCreate() {
    setError('')
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
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-white font-black text-3xl mb-6">Create Your Quiz</h1>

        {/* My Saved Quizzes */}
        <div className="mb-6">
          <button
            onClick={() => setShowSaved(s => !s)}
            className="flex items-center gap-2 text-yellow-300 font-bold text-sm hover:text-yellow-200 transition"
          >
            <span>{showSaved ? '▾' : '▸'}</span>
            My Saved Quizzes ({savedQuizzes.length})
          </button>

          {showSaved && (
            <div className="mt-3 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              {savedQuizzes.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-6">No saved quizzes yet.</p>
              ) : (
                savedQuizzes.map(quiz => (
                  <div key={quiz.id} className="flex items-center justify-between px-4 py-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition">
                    <div>
                      <p className="text-white font-semibold">{quiz.name}</p>
                      <p className="text-white/40 text-xs">{quiz.questions.length} questions</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadQuiz(quiz)}
                        className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-400/30 transition"
                      >Load</button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id, quiz.name)}
                        className="bg-red-400/10 text-red-400 border border-red-400/20 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-400/20 transition"
                      >Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div
          className={`rounded-2xl border-2 border-dashed p-6 mb-6 text-center transition-colors cursor-pointer
            ${dragging ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/30 bg-white/5 hover:border-white/60 hover:bg-white/10'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.md"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="text-4xl mb-2">📂</div>
          <p className="text-white font-bold text-lg">Drop your file here or click to browse</p>
          <p className="text-white/50 text-sm mt-1">Supports .xlsx (Excel) and .md (Markdown)</p>
          {uploadMsg && (
            <p className="text-green-300 font-bold text-sm mt-2">✓ {uploadMsg}</p>
          )}
        </div>

        {/* Sample Download Links */}
        <div className="flex gap-3 mb-6 justify-center">
          <a
            href="/samples/sample-questions.xlsx"
            download
            className="bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition"
            onClick={e => e.stopPropagation()}
          >
            Download Excel Template
          </a>
          <a
            href="/samples/sample-questions.md"
            download
            className="bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition"
            onClick={e => e.stopPropagation()}
          >
            Download Markdown Template
          </a>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/40 text-sm">or add manually</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Manual Questions */}
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
              <span className="text-white/40 text-xs ml-1">(default: {DEFAULT_TIME}s)</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => updateQuestion(qi, 'noPoints', !q.noPoints)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${q.noPoints ? 'bg-blue-400/30 text-blue-200 border border-blue-400/50' : 'bg-white/10 text-white/50'}`}
              >{q.noPoints ? '★ Practice (no points)' : '☆ Mark as practice'}</button>
            </div>
          </div>
        ))}

        {error && <p className="text-red-300 text-sm mb-3">{error}</p>}
        {saveMsg && <p className="text-green-300 text-sm mb-3">✓ {saveMsg}</p>}
      </div>

      {/* Sticky bottom bar — always visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-purple-900/95 backdrop-blur border-t border-white/10 px-4 py-3 z-50">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400/50 text-sm"
            placeholder="Quiz name (optional)..."
            value={quizName}
            onChange={e => setQuizName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveQuiz()}
          />
          <button
            onClick={handleSaveQuiz}
            disabled={saving}
            className="bg-white/15 text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-white/25 transition disabled:opacity-50 whitespace-nowrap"
          >{saving ? '...' : '💾 Save'}</button>
          <button
            onClick={() => setQuestions(qs => [...qs, BLANK_QUESTION()])}
            className="bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-white/30 transition whitespace-nowrap"
          >+ Add</button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-yellow-400 text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-yellow-300 transition disabled:opacity-50 whitespace-nowrap"
          >{loading ? '...' : `▶ Play (${questions.length}Q)`}</button>
        </div>
      </div>
    </div>
  )
}
