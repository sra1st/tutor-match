'use client'
import React, { useEffect, useState } from 'react'
import { db } from '../../lib/firebaseClient'
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'

type MatchItem = {
  id: string
  tutorId?: string
  tuitionId?: string
  studentId?: string
  status?: string
  createdAt?: any
  paid?: boolean
}

export default function AdminPage(): JSX.Element {
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MatchItem[]
      setMatches(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function markConfirmed(id: string) {
    const ref = doc(db, 'matches', id)
    await updateDoc(ref, { status: 'confirmed' })
  }

  async function markPaid(id: string) {
    const ref = doc(db, 'matches', id)
    await updateDoc(ref, { paid: true })
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Admin — Matches</h1>
        {loading && <div>Loading…</div>}
        {!loading && matches.length === 0 && <div>No matches yet.</div>}
        <div className="space-y-3">
          {matches.map(m => (
            <div key={m.id} className="p-3 rounded-lg border flex justify-between items-center bg-white">
              <div>
                <div className="text-sm font-medium">Match ID: {m.id}</div>
                <div className="text-xs text-gray-600">Tutor: {m.tutorId || '-'} • Student: {m.studentId || '-'} • Tuition: {m.tuitionId || '-'}</div>
                <div className="text-xs text-gray-500">Status: {m.status || 'pending'} • Paid: {m.paid ? 'yes' : 'no'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => markConfirmed(m.id)} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Confirm</button>
                <button onClick={() => markPaid(m.id)} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Mark Paid</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
