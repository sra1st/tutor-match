// lib/firebaseClient.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
}

if (!getApps().length) initializeApp(firebaseConfig)

export const auth = getAuth()
export const db = getFirestore()

let _confirmation: ConfirmationResult | null = null

export function setupRecaptcha(containerId = 'recaptcha-container') {
  // reuse if already created
  // @ts-ignore
  if ((window as any).recaptchaVerifier) return (window as any).recaptchaVerifier
  const verifier = new RecaptchaVerifier(containerId, { size: 'invisible' }, auth)
  // @ts-ignore
  (window as any).recaptchaVerifier = verifier
  return verifier
}

export async function sendPhoneOtp(phone: string) {
  setupRecaptcha()
  // @ts-ignore
  _confirmation = await signInWithPhoneNumber(auth, phone, (window as any).recaptchaVerifier)
  return true
}

export async function verifyPhoneOtp(code: string) {
  if (!_confirmation) throw new Error('No OTP requested')
  const userCredential = await _confirmation.confirm(code)
  return userCredential.user
}

/* Firestore helpers */
export function listenTuitions(onChange: (docs: any[]) => void) {
  const q = query(collection(db, 'tuitions'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => onChange(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function listenTutors(onChange: (docs: any[]) => void) {
  const q = query(collection(db, 'tutors'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => onChange(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export async function createTutor(data: any) {
  return addDoc(collection(db, 'tutors'), { ...data, createdAt: serverTimestamp() })
}
export async function createTuition(data: any) {
  return addDoc(collection(db, 'tuitions'), { ...data, createdAt: serverTimestamp() })
}
export async function createMatch(data: any) {
  return addDoc(collection(db, 'matches'), { ...data, createdAt: serverTimestamp(), status: 'pending' })
}
