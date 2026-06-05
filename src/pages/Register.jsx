import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addDoc(collection(db, 'waitlist'), {
        name,
        email,
        signedUpAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to save to waitlist:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
        {submitted ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-white">You're on the list!</h2>
            <p className="text-white/70">
              We'll notify you as soon as the next cohort opens.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-white/50 hover:text-white underline text-sm"
            >
              Back to home
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-white">Registration Closed</h1>
              <div className="w-16 h-1 bg-yellow-400 mx-auto rounded-full" />
            </div>

            {/* Closed notice */}
            <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl p-4 text-center">
              <p className="text-white font-semibold text-lg">
                📢 Cohort is currently full
              </p>
              <p className="text-white/70 text-sm mt-1">
                We're reviewing applications and will get back to you soon.
              </p>
            </div>

            {/* Waitlist form */}
            <div className="space-y-3">
              <p className="text-white/80 text-sm text-center">
                Leave your details below to stay informed about the next cohort.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-xs uppercase tracking-wide mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs uppercase tracking-wide mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-yellow-400 text-gray-900 font-bold text-lg py-3 rounded-xl shadow-lg hover:scale-[1.02] hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Keep Me Updated'}
                </button>
              </form>
            </div>

            <p className="text-white/40 text-xs text-center">
              We'll only use this to notify you about upcoming cohorts. No spam.
            </p>

            <button
              onClick={() => navigate('/')}
              className="block mx-auto text-white/50 hover:text-white underline text-sm"
            >
              ← Back to home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}