import { useEffect, useRef, useState } from 'react'
import { usePlayers } from '../../hooks/usePlayers'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
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
    const rows = players.map(p => {
      const answers = p.answers || {}
      const correctCount = Object.values(answers).filter(a => a.isCorrect).length
      return {
        room_code: roomCode,
        player_nickname: p.nickname || p.id,
        player_email: p.email || null,
        score: p.score ?? 0,
        correct_count: correctCount,
        total_questions: totalQuestions,
        answers,
      }
    })

    try {
      const { error } = await supabase.from('quiz_results').insert(rows)
      if (error) {
        // Table might not exist yet — user needs to run the migration SQL
        console.warn('Supabase quiz_results insert failed:', error.message)
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          setSaveStatus('⚠️ Quiz results table not created yet — run the SQL migration from scripts/create-quiz-results-table.sql')
        } else {
          setSaveStatus(`⚠️ Save failed: ${error.message}`)
        }
      } else {
        setSaveStatus(`✅ ${rows.length} player results saved`)
        console.log(`Saved ${rows.length} quiz results to Supabase`)
      }
    } catch (e) {
      console.warn('Supabase save error:', e.message)
      setSaveStatus(`⚠️ Save error: ${e.message}`)
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