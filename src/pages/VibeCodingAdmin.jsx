import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = 'vibecodingximb'
const PROJECT_ID = 'kahootclone-110c6'
const API_KEY = 'AIzaSyCdvRAuss9sZqZW-7cKQQ9fFrpecsj6Glw'

// Paid emails from Stripe screenshot — pre-seeded
const PAID_EMAILS_SEED = new Set([
  'adityaauro1999@gmail.com',
  'amansaraf22108@gmail.com',
  'jena.binay@gmail.com',
  'kunalkashikar@gmail.com',
  'sjulka205@gmail.com',
  'vipulsingh281195@gmail.com',
  'amritkumar91@gmail.com',
  'kaushik.padhy86@gmail.com',
  'anuj.sharma@coltie.com',
  'amohanty1608@gmail.com',
  'panukampa@gmail.com',
  'swarup001@gmail.com',
  'alokgupta.gbpuat@gmail.com',
  'princesahani725@gmail.com',
  'sidddharth93@gmail.com',
])

async function fetchCollection(collectionName, status) {
  let allDocs = []
  let pageToken = ''
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}?key=${API_KEY}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Firestore error: ${res.status}`)
    const data = await res.json()
    allDocs = allDocs.concat(data.documents || [])
    pageToken = data.nextPageToken || ''
  } while (pageToken)

  return allDocs.map(doc => {
    const f = doc.fields || {}
    const getVal = key => {
      const v = f[key]
      if (!v) return ''
      return v.stringValue ?? v.integerValue ?? v.timestampValue ?? ''
    }
    const getBool = key => f[key]?.booleanValue ?? null
    const submittedRaw = getVal('submittedAt')
    let submittedAt = null
    try { submittedAt = new Date(submittedRaw) } catch {}
    const email = getVal('email').toLowerCase()
    // paid field from DB, fallback to seed list
    const paidFromDB = getBool('paid')
    const paid = paidFromDB !== null ? paidFromDB : PAID_EMAILS_SEED.has(email)
    return {
      id: doc.name.split('/').pop(),
      collection: collectionName,
      status,
      name: getVal('name'),
      email,
      phone: getVal('phone'),
      batch: String(getVal('batch')),
      wantToLearn: getVal('wantToLearn'),
      submittedAt,
      paid,
    }
  })
}

async function signInAnonymously() {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true }),
  })
  const data = await res.json()
  return data.idToken
}

async function updatePaidField(collection, docId, paid, idToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?updateMask.fieldPaths=paid&key=${API_KEY}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ fields: { paid: { booleanValue: paid } } }),
  })
  return res.ok
}

function StatusBadge({ status }) {
  if (status === 'registered') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">Registered</span>
  }
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Waitlisted</span>
}

function PaidToggle({ paid, onChange, saving }) {
  return (
    <button
      onClick={onChange}
      disabled={saving}
      className={`relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${
        paid
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
          : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
      } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {saving ? '...' : paid ? '✓ Paid' : '✗ Unpaid'}
    </button>
  )
}

export default function VibeCodingAdmin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState('all')
  const [allRows, setAllRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState({})
  const [idToken, setIdToken] = useState(null)

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) { setAuthed(true); setAuthError('') }
    else setAuthError('Incorrect password.')
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    setFetchError('')
    // Sign in anonymously for write access
    signInAnonymously().then(token => setIdToken(token)).catch(() => {})
    Promise.all([
      fetchCollection('vibecoding_registrations', 'registered'),
      fetchCollection('vibecoding_waitlist', 'waitlisted'),
    ])
      .then(([regs, wait]) => {
        const combined = [...regs, ...wait].sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
        setAllRows(combined)
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false))
  }, [authed])

  async function togglePaid(row) {
    const newPaid = !row.paid
    setSaving(s => ({ ...s, [row.id]: true }))
    const ok = await updatePaidField(row.collection, row.id, newPaid, idToken)
    if (ok) {
      setAllRows(rows => rows.map(r => r.id === row.id ? { ...r, paid: newPaid } : r))
    }
    setSaving(s => ({ ...s, [row.id]: false }))
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1a2f45] to-[#0D1B2A] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-5">
          <div className="text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h1 className="text-xl font-extrabold text-white">Admin Access</h1>
            <p className="text-gray-400 text-sm mt-1">Vibe Coding Participants</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#F0AB00] focus:ring-1 focus:ring-[#F0AB00] transition"
          />
          {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-[#F0AB00] hover:bg-[#d99a00] text-[#0D1B2A] font-extrabold text-lg transition">
            Login
          </button>
        </form>
      </div>
    )
  }

  const registered = allRows.filter(r => r.status === 'registered')
  const waitlisted = allRows.filter(r => r.status === 'waitlisted')
  const paid = allRows.filter(r => r.paid)
  const unpaid = allRows.filter(r => !r.paid)
  const displayRows = tab === 'all' ? allRows : tab === 'registered' ? registered : tab === 'waitlisted' ? waitlisted : tab === 'paid' ? paid : unpaid

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1a2f45] to-[#0D1B2A] px-4 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Vibe Coding Admin</h1>
            <p className="text-gray-400 text-sm mt-1">
              {loading ? 'Loading...' : fetchError ? 'Error loading data'
                : `${registered.length} registered · ${waitlisted.length} waitlisted · ${paid.length} paid · ${unpaid.length} unpaid`}
            </p>
          </div>
          <button onClick={() => setAuthed(false)} className="text-xs text-gray-500 hover:text-white transition border border-white/10 px-3 py-1.5 rounded-lg">
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all',        label: `All (${allRows.length})` },
            { key: 'registered', label: `Registered (${registered.length})` },
            { key: 'waitlisted', label: `Waitlisted (${waitlisted.length})` },
            { key: 'paid',       label: `✓ Paid (${paid.length})` },
            { key: 'unpaid',     label: `✗ Unpaid (${unpaid.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.key ? 'bg-[#F0AB00] text-[#0D1B2A]' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {fetchError && (
          <div className="text-center text-red-400 py-10 bg-red-900/20 rounded-xl border border-red-500/20">{fetchError}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : !fetchError && displayRows.length === 0 ? (
          <div className="text-center text-gray-500 py-20">No entries.</div>
        ) : !fetchError && (
          <div className="space-y-4">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-white/10 text-[#F0AB00] uppercase text-xs tracking-wider">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">What they want to learn</th>
                    <th className="px-4 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((r, i) => (
                    <tr key={r.id} className={`border-t border-white/5 transition ${r.paid ? 'hover:bg-emerald-900/10' : 'hover:bg-red-900/10'}`}>
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        <PaidToggle paid={r.paid} onChange={() => togglePaid(r)} saving={!!saving[r.id]} />
                      </td>
                      <td className="px-4 py-3 text-white font-semibold">{r.name}</td>
                      <td className="px-4 py-3 text-gray-300">{r.email}</td>
                      <td className="px-4 py-3 text-gray-300">{r.phone}</td>
                      <td className="px-4 py-3 text-gray-300">{r.batch}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{r.wantToLearn}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {r.submittedAt?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {displayRows.map((r, i) => (
                <div key={r.id} className="bg-white/10 border border-white/10 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{r.name}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <span className="text-xs text-gray-500">#{i + 1}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PaidToggle paid={r.paid} onChange={() => togglePaid(r)} saving={!!saving[r.id]} />
                  </div>
                  <p className="text-xs text-gray-400">{r.email} · {r.phone}</p>
                  <p className="text-xs text-[#F0AB00]">Batch {r.batch}</p>
                  <p className="text-xs text-gray-400">{r.wantToLearn}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
