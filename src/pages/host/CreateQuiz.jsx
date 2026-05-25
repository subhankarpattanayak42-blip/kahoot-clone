import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import { useGameContext } from '../../context/GameContext'
import { createGame } from '../../firebase/helpers'
import { useAuth } from '../../hooks/useAuth'

const DEFAULT_TIME = 20

const BLANK_QUESTION = () => ({
  id: uuidv4(),
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  timeLimit: DEFAULT_TIME,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-white font-black text-3xl mb-6">Create Your Quiz</h1>

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
          >{loading ? 'Creating...' : `Create Game (${questions.length} Q)`}</button>
        </div>
      </div>
    </div>
  )
}
