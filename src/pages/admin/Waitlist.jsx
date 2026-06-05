import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'

export default function Waitlist() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'waitlist'), orderBy('signedUpAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const list = []
      snap.forEach((doc) => {
        const data = doc.data()
        list.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          signedUpAt: data.signedUpAt?.toDate?.() ?? null,
        })
      })
      setEntries(list)
      setLoading(false)
    })

    return unsub
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Waitlist</h1>
            <p className="text-white/50 text-sm mt-1">
              {loading ? 'Loading...' : `${entries.length} signup${entries.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-white/50 hover:text-white underline text-sm"
          >
            ← Back
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-white/40 text-lg animate-pulse">Loading...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 text-center border border-white/20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-white/60 text-lg">No waitlist signups yet.</p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-white font-medium">{entry.name}</td>
                    <td className="px-6 py-4 text-white/70">
                      <a href={`mailto:${entry.email}`} className="hover:text-yellow-400 transition">
                        {entry.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-white/50 text-sm">
                      {entry.signedUpAt
                        ? entry.signedUpAt.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <p className="text-white/30 text-xs text-center mt-6">
          Data from <code className="text-white/50">waitlist</code> collection · Live updates
        </p>
      </div>
    </div>
  )
}