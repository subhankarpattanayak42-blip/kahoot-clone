import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

export function useGame(roomCode) {
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!roomCode) return
    const unsub = onSnapshot(
      doc(db, 'games', roomCode),
      (snap) => {
        if (snap.exists()) {
          setGame({ id: snap.id, ...snap.data() })
        } else {
          setError('Game not found')
        }
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }, [roomCode])

  return { game, loading, error }
}
