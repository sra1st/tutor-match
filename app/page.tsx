'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { listenTuitions, listenTutors, sendPhoneOtp, verifyPhoneOtp, createTutor, createTuition, createMatch } from '../lib/firebaseClient'


export default function Page(): JSX.Element {
  const [role, setRole] = useState<'tutor' | 'student' | null>(null)
  const [page, setPage] = useState<'landing' | 'form' | 'listings' | 'swipe'>('landing')
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null)
  const [otpVerified, setOtpVerified] = useState(false)

  const [tutorForm, setTutorForm] = useState({ name: '', qualifications: '', location: '', subjects: '' })
  const [studentForm, setStudentForm] = useState({ classLevel: '', subjects: '', location: '', budget: '' })

  const [tuitions, setTuitions] = useState<any[]>([
    { id: 't1', classLevel: 'Grade 10', subject: 'Math', location: 'Gulshan', createdAt: Date.now() - 60000 }
  ])
  const [tutors, setTutors] = useState<any[]>([
    { id: 'u1', name: 'Ayesha Rahman', qualifications: 'BSc (Math), 4 yrs', location: 'Gulshan', subjects: 'Math, Physics', verified: true }
  ])

  const [activeMatch, setActiveMatch] = useState<any | null>(null)

  function sendOtp(phone: string) { setOtpSentTo(phone) }
  function verifyOtp(code: string) { if (!otpSentTo) return; setOtpVerified(true) }

  function submitTutor() {
    if (!tutorForm.name || !tutorForm.subjects) return alert('Name and subjects required')
    if (!otpVerified) return alert('Verify phone first')
    setTutors([ { id: 'u' + (tutors.length + 1), ...tutorForm, verified: true }, ...tutors ])
    setPage('listings')
  }

  function submitStudent() {
    if (!studentForm.classLevel || !studentForm.subjects) return alert('Class and subject required')
    if (!otpVerified) return alert('Verify phone first')
    setTuitions([ { id: 't' + (tuitions.length + 1), ...studentForm, createdAt: Date.now() }, ...tuitions ])
    setPage('listings')
  }

  function requestTutorMatch(tutorId: string) {
    const match = { id: 'm' + Date.now(), tutorId, status: 'pending', createdAt: Date.now() }
    setActiveMatch(match)
  }

  function confirmMatch() {
    if (!activeMatch) return
    setActiveMatch({ ...activeMatch, status: 'confirmed', confirmedAt: Date.now() })
    alert('Match confirmed. Collect payment via bKash to your number.')
  }

  /* --- UI components --- */
  function Landing() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-2xl w-full bg-white/5 rounded-2xl p-8">
          <h1 className="text-3xl font-semibold mb-2">TutorMatch — find tuitions in 30s</h1>
          <p className="text-sm text-slate-300 mb-6">Minimal. Fast. OTP verified.</p>
          <div className="flex gap-4">
            <button onClick={() => { setRole('student'); setPage('form') }} className="flex-1 py-3 rounded-lg bg-indigo-600">I need a tutor</button>
            <button onClick={() => { setRole('tutor'); setPage('form') }} className="flex-1 py-3 rounded-lg bg-slate-700">I am a tutor</button>
          </div>
          <div className="mt-6 text-xs text-slate-400">Or explore listings below.</div>
          <div className="mt-4 flex gap-3">
            <button onClick={() => setPage('listings')} className="text-sm underline">View listings</button>
            <button onClick={() => setPage('swipe')} className="text-sm underline">Swipe tutors</button>
          </div>
        </div>
      </div>
    )
  }

  function OtpBlock() {
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input className="flex-1 p-3 rounded border" placeholder="Phone +8801..." value={phone} onChange={e => setPhone(e.target.value)} />
          <button onClick={() => sendOtp(phone)} className="px-4 py-2 rounded bg-slate-700 text-white">Send OTP</button>
        </div>
        {otpSentTo && (
          <div className="flex gap-2 items-center">
            <input className="p-2 rounded border" placeholder="OTP code" value={code} onChange={e => setCode(e.target.value)} />
            <button onClick={() => verifyOtp(code)} className="px-3 py-2 rounded bg-green-600 text-white">Verify</button>
            <div className="text-sm text-slate-500">sent to {otpSentTo}</div>
          </div>
        )}
      </div>
    )
  }

  function QuickForm() {
    return (
      <div className="min-h-screen flex items-start justify-center bg-slate-900 p-6">
        <div className="w-full max-w-3xl bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">{role === 'tutor' ? 'Tutor signup' : 'Request tuition'}</h2>
            <button onClick={() => { setPage('landing'); setRole(null) }} className="text-sm text-slate-500">Back</button>
          </div>

          {role === 'tutor' ? (
            <div className="space-y-3">
              <input className="w-full p-3 rounded border" placeholder="Name" value={tutorForm.name} onChange={e => setTutorForm({ ...tutorForm, name: e.target.value })} />
              <input className="w-full p-3 rounded border" placeholder="Qualifications" value={tutorForm.qualifications} onChange={e => setTutorForm({ ...tutorForm, qualifications: e.target.value })} />
              <input className="w-full p-3 rounded border" placeholder="Location" value={tutorForm.location} onChange={e => setTutorForm({ ...tutorForm, location: e.target.value })} />
              <input className="w-full p-3 rounded border" placeholder="Subjects" value={tutorForm.subjects} onChange={e => setTutorForm({ ...tutorForm, subjects: e.target.value })} />
              <OtpBlock />
              <div className="flex gap-2 mt-4">
                <button onClick={submitTutor} className="flex-1 py-3 rounded bg-indigo-600 text-white">Submit & find tuitions</button>
                <button onClick={() => setPage('listings')} className="py-3 px-4 rounded border">Skip</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input className="w-full p-3 rounded border" placeholder="Class/Grade" value={studentForm.classLevel} onChange={e => setStudentForm({ ...studentForm, classLevel: e.target.value })} />
              <input className="w-full p-3 rounded border" placeholder="Subjects" value={studentForm.subjects} onChange={e => setStudentForm({ ...studentForm, subjects: e.target.value })} />
              <input className="w-full p-3 rounded border" placeholder="Location" value={studentForm.location} onChange={e => setStudentForm({ ...studentForm, location: e.target.value })} />
              <input className="w-full p-3 rounded border" placeholder="Budget (BDT)" value={studentForm.budget} onChange={e => setStudentForm({ ...studentForm, budget: e.target.value })} />
              <OtpBlock />
              <div className="flex gap-2 mt-4">
                <button onClick={submitStudent} className="flex-1 py-3 rounded bg-indigo-600 text-white">Post tuition</button>
                <button onClick={() => setPage('listings')} className="py-3 px-4 rounded border">Skip</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  function Listings() {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl">Live Listings</h3>
            <div className="flex gap-2">
              <button onClick={() => { setPage('landing'); setRole(null) }} className="px-3 py-2 rounded border">Home</button>
              <button onClick={() => setPage('swipe')} className="px-3 py-2 rounded bg-indigo-600 text-white">Swipe tutors</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Tuitions</h4>
              {tuitions.map(t => (
                <div key={t.id} className="p-4 rounded border mb-3 bg-white">
                  <div className="text-sm text-slate-600">{new Date(t.createdAt).toLocaleString()}</div>
                  <div className="font-semibold">{t.classLevel} - {t.subject}</div>
                  <div className="text-xs text-slate-500">{t.location}</div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium mb-2">Tutors</h4>
              {tutors.map(u => (
                <div key={u.id} className="p-4 rounded border mb-3 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.qualifications} • {u.location}</div>
                      <div className="text-sm mt-2">{u.subjects}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs ${u.verified ? 'text-green-600' : 'text-red-500'}`}>{u.verified ? 'Verified' : 'Unverified'}</div>
                      <button onClick={() => requestTutorMatch(u.id)} className="mt-3 px-3 py-1 rounded bg-emerald-600 text-white text-sm">Request</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function Swipe() {
    const [index, setIndex] = useState(0)
    const current = tutors[index]
    if (!current) return <div className="min-h-screen flex items-center justify-center">No tutors available.</div>

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 p-6">
        <div className="max-w-md mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <button onClick={() => setPage('listings')} className="text-sm">Back</button>
            <div className="text-sm">Swipe tutors</div>
            <div />
          </div>

          <motion.div key={current.id} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 rounded-2xl bg-white shadow">
            <div className="font-semibold text-lg">{current.name}</div>
            <div className="text-xs text-slate-500">{current.qualifications} • {current.location}</div>
            <div className="mt-3 text-sm">{current.subjects}</div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setIndex(i => i + 1)} className="flex-1 py-3 rounded border">Skip</button>
              <button onClick={() => { requestTutorMatch(current.id) }} className="flex-1 py-3 rounded bg-indigo-600 text-white">Select</button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {page === 'landing' && <Landing />}
      {page === 'form' && <QuickForm />}
      {page === 'listings' && <Listings />}
      {page === 'swipe' && <Swipe />}

      {activeMatch && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="font-semibold mb-2">Pending match</div>
            <div className="text-sm mb-4">Match id: {activeMatch.id}</div>
            <div className="flex gap-2">
              <button onClick={confirmMatch} className="flex-1 py-2 rounded bg-emerald-600 text-white">Confirm</button>
              <button onClick={() => setActiveMatch(null)} className="flex-1 py-2 rounded border">Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
