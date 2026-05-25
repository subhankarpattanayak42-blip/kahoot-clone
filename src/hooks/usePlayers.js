import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

export function usePlayers(roomCode) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomCode) return
    const unsub = onSnapshot(
      collection(db, 'games', roomCode, 'players'),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => b.score - a.score)
        setPlayers(list)
        setLoading(false)
      }
    )
    return unsub
  }, [roomCode])

  return { players, loading }
}
