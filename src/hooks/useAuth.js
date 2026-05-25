import { useEffect, useState } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'

export function useAuth() {
  const [uid, setUid] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid)
        setLoading(false)
      } else {
        try {
          const result = await signInAnonymously(auth)
          setUid(result.user.uid)
        } catch (e) {
          console.error('Auth error', e)
        } finally {
          setLoading(false)
        }
      }
    })
    return unsub
  }, [])

  return { uid, loading }
}
