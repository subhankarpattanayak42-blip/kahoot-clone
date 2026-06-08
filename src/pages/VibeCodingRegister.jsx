import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID  = 'service_ang3oad'
const EMAILJS_TEMPLATE_ID = 'template_jvg1v7h'
const EMAILJS_PUBLIC_KEY  = 'f7J9oSKJyopPFqjsc'

const XIMB_BATCHES = Array.from({ length: new Date().getFullYear() - 1989 + 1 }, (_, i) => 1989 + i).reverse()

export default function VibeCodingRegister() {
  const [form, setForm] = useState({ name: '', batch: '', email: '', phone: '', wantToLearn: '' })
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!agreed) {
      setErrorMsg('Please accept the terms to continue.')
      return
    }
    setStatus('submitting')
    setErrorMsg('')

    try {
      await addDoc(collection(db, 'vibecoding_waitlist'), {
        ...form,
        submittedAt: serverTimestamp(),
      })
    } catch (firestoreErr) {
      console.error('Firestore error:', firestoreErr)
      setErrorMsg('Database error: ' + firestoreErr.message)
      setStatus('error')
      return
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:     form.name,
          from_email:    form.email,
          phone:         form.phone,
          batch:         form.batch,
          want_to_learn: form.wantToLearn,
          to_email:      'subhankarpattanayak42@gmail.com',
        },
        EMAILJS_PUBLIC_KEY
      )
    } catch (emailErr) {
      console.error('EmailJS error:', emailErr)
      setErrorMsg('Email error: ' + (emailErr.text || emailErr.message || JSON.stringify(emailErr)))
      setStatus('error')
      return
    }

    setStatus('success')
    setForm({ name: '', batch: '', email: '', phone: '', wantToLearn: '' })
    setAgreed(false)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#F0AB00] focus:ring-1 focus:ring-[#F0AB00] transition"
  const labelClass = "block text-sm font-semibold text-gray-300 mb-1"

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1a2f45] to-[#0D1B2A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F0AB00] mb-4 text-3xl">
            📋
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Vibe Coding Workshop
          </h1>
          <p className="text-[#F0AB00] font-semibold mt-1 text-lg">
            Build Autonomous Agents with AI
          </p>
          <div className="mt-3 inline-block bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-2">
            <p className="text-red-400 text-xs font-semibold">
              🔒 Registrations for this batch are now closed.
            </p>
          </div>
          <p className="text-gray-400 mt-3 text-sm">
            Join the waitlist and be the first to know about the next session.
          </p>
          <div className="mt-2 inline-block bg-[#F0AB00]/10 border border-[#F0AB00]/30 rounded-lg px-4 py-2">
            <p className="text-[#F0AB00] text-xs font-semibold">
              🎓 Exclusively open to XIMB Alumni only.
            </p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="bg-white/10 backdrop-blur border border-green-400/30 rounded-2xl p-8 text-center space-y-6">
            <div className="text-5xl mb-2">🎉</div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">You're on the waitlist!</h2>
              <p className="text-gray-300 text-sm">
                Thanks for your interest! Subhankar will reach out when the next session opens up.
              </p>
            </div>

            {/* Newsletter nudge */}
            <div className="bg-white/5 border border-[#F0AB00]/20 rounded-xl p-5 text-left space-y-3">
              <p className="text-[#F0AB00] text-xs font-semibold uppercase tracking-wide text-center">While you wait — stay in the loop</p>
              <p className="text-gray-300 text-sm text-center">
                Follow <span className="text-white font-semibold">TechSambad</span> for AI insights, productivity tips, and early access to future workshops.
              </p>
              <div className="flex flex-col gap-3 pt-1">
                <a
                  href="https://www.techsambad.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F0AB00] hover:bg-[#d99a00] text-[#0D1B2A] text-sm font-bold transition"
                >
                  🌐 TechSambad Website
                </a>
                <a
                  href="https://www.linkedin.com/newsletters/techsambad-7088136500952858625/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0A66C2] hover:bg-[#0958a8] text-white text-sm font-bold transition"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn Newsletter
                </a>
                <a
                  href="https://techsambad.substack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FF6719] hover:bg-[#e55a10] text-white text-sm font-bold transition"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>
                  Substack Newsletter
                </a>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-8 space-y-5 shadow-2xl"
          >
            {/* Name */}
            <div>
              <label className={labelClass}>Full Name <span className="text-[#F0AB00]">*</span></label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} required
                placeholder="e.g. Priya Sharma"
                className={inputClass}
              />
            </div>

            {/* Batch */}
            <div>
              <label className={labelClass}>XIMB Passing Out Year <span className="text-[#F0AB00]">*</span></label>
              <select
                name="batch"
                value={form.batch}
                onChange={handleChange}
                required
                className={`${inputClass} cursor-pointer`}
              >
                <option value="" disabled className="bg-[#0D1B2A]">Select your passing out year</option>
                {XIMB_BATCHES.map(year => (
                  <option key={year} value={year} className="bg-[#0D1B2A]">{year}</option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address <span className="text-[#F0AB00]">*</span></label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone Number <span className="text-[#F0AB00]">*</span></label>
              <input
                type="tel" name="phone" value={form.phone}
                onChange={handleChange} required
                placeholder="e.g. +91 98765 43210"
                className={inputClass}
              />
            </div>

            {/* What they want to learn */}
            <div>
              <label className={labelClass}>What do you want to learn? <span className="text-[#F0AB00]">*</span></label>
              <textarea
                name="wantToLearn" value={form.wantToLearn}
                onChange={handleChange} required rows={4}
                placeholder="e.g. How to build AI agents, understanding LLMs, using Claude API..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-[#F0AB00] uppercase tracking-wide">Privacy & Terms</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your personal information (name, email, phone number, and batch) is collected solely
                for the purpose of organising and communicating about future Vibe Coding Workshop sessions.
                <strong className="text-gray-300"> This information will not be shared with any third party</strong>,
                sold, or used for any commercial purpose. It will only be used by Subhankar Pattanayak
                to notify you when the next session opens up.
              </p>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#F0AB00] cursor-pointer"
                />
                <span className="text-xs text-gray-300 group-hover:text-white transition">
                  I have read and agree to the privacy terms above. I consent to being contacted about future workshop sessions.
                </span>
              </label>
            </div>

            {errorMsg && (
              <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting' || !agreed}
              className="w-full py-3 px-6 rounded-xl bg-[#F0AB00] hover:bg-[#d99a00] text-[#0D1B2A] font-extrabold text-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {status === 'submitting' ? 'Submitting...' : 'Join the Waitlist 📋'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-600 text-xs mt-6">
          Organised by Subhankar Pattanayak · Powered by Claude Code
        </p>
      </div>
    </div>
  )
}
