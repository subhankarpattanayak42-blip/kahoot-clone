import { useEffect, useRef, useState } from 'react'
import { usePlayers } from '../../hooks/usePlayers'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Leaderboard from '../../components/Leaderboard'

export default function HostGameOver({ game, roomCode }) {
  const { players } = usePlayers(roomCode)
  const navigate = useNavigate()
  const saved = useRef(false)
  const [saveStatus, setSaveStatus] = useState('')

  useEffect(() => {
    if (saved.current || !players.length) return
    saved.current = true
    saveResults()
  }, [players.length])

  async function saveResults() {
    const totalQuestions = game.questions?.length ?? 0
    try {
      const resultsRef = collection(db, 'quiz_results')
      await Promise.all(players.map(p => {
        const answers = p.answers || {}
        const correctCount = Object.values(answers).filter(a => a.isCorrect).length
        return addDoc(resultsRef, {
          roomCode,
          playerNickname: p.nickname || p.id,
          playerEmail: p.email || null,
          score: p.score ?? 0,
          correctCount,
          totalQuestions,
          answers,
          savedAt: serverTimestamp(),
        })
      }))
      setSaveStatus(`✅ ${players.length} player results saved`)
    } catch (e) {
      console.warn('Firestore save error:', e.message)
      setSaveStatus(`⚠️ Save failed: ${e.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-white font-black text-4xl">Game Over!</h1>
      <p className="text-white/70 text-xl">Final Standings</p>
      <Leaderboard players={players} />
      {saveStatus && (
        <p className={`text-sm ${saveStatus.startsWith('✅') ? 'text-green-400' : 'text-yellow-300'}`}>
          {saveStatus}
        </p>
      )}
      <button
        onClick={() => navigate('/')}
        className="bg-yellow-400 text-gray-900 font-bold text-xl px-10 py-4 rounded-2xl hover:scale-105 transition mt-4"
      >
        Back to Home
      </button>
    </div>
  )
}
