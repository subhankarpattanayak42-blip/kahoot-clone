import {
  doc, getDoc, setDoc, updateDoc, collection,
  serverTimestamp, Timestamp
} from 'firebase/firestore'
import { db } from './config'

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function generateRoomCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode()
    const snap = await getDoc(doc(db, 'games', code))
    if (!snap.exists()) return code
  }
  throw new Error('Could not generate a unique room code')
}

export async function createGame(hostUid, questions) {
  const roomCode = await generateRoomCode()
  await setDoc(doc(db, 'games', roomCode), {
    roomCode,
    hostUid,
    status: 'lobby',
    currentQuestionIndex: 0,
    questionStartedAt: null,
    questions,
    createdAt: serverTimestamp(),
  })
  return roomCode
}

export async function joinGame(roomCode, uid, nickname) {
  const gameSnap = await getDoc(doc(db, 'games', roomCode))
  if (!gameSnap.exists()) throw new Error('Game not found')
  await setDoc(doc(db, 'games', roomCode, 'players', uid), {
    nickname,
    score: 0,
    joinedAt: serverTimestamp(),
    answers: {},
  })
  return gameSnap.data()
}

export async function startGame(roomCode) {
  await updateDoc(doc(db, 'games', roomCode), {
    status: 'question',
    currentQuestionIndex: 0,
    questionStartedAt: serverTimestamp(),
  })
}

export async function showReveal(roomCode) {
  await updateDoc(doc(db, 'games', roomCode), { status: 'reveal' })
}

export async function showLeaderboard(roomCode) {
  await updateDoc(doc(db, 'games', roomCode), { status: 'leaderboard' })
}

export async function advanceQuestion(roomCode, nextIndex, totalQuestions) {
  if (nextIndex >= totalQuestions) {
    await updateDoc(doc(db, 'games', roomCode), { status: 'finished' })
  } else {
    await updateDoc(doc(db, 'games', roomCode), {
      status: 'question',
      currentQuestionIndex: nextIndex,
      questionStartedAt: serverTimestamp(),
    })
  }
}

export async function submitAnswer(roomCode, playerId, questionId, selectedIndex, correctIndex, questionStartedAt, timeLimit) {
  const isCorrect = selectedIndex === correctIndex
  let pointsEarned = 0
  if (isCorrect) {
    const startMs = questionStartedAt instanceof Timestamp
      ? questionStartedAt.toMillis()
      : Date.now()
    const elapsedFraction = Math.min((Date.now() - startMs) / (timeLimit * 1000), 1)
    pointsEarned = Math.round(1000 * (1 - 0.5 * elapsedFraction))
  }

  const playerRef = doc(db, 'games', roomCode, 'players', playerId)
  const snap = await getDoc(playerRef)
  const currentScore = snap.data()?.score ?? 0

  await updateDoc(playerRef, {
    [`answers.${questionId}`]: {
      selectedIndex,
      isCorrect,
      pointsEarned,
      answeredAt: serverTimestamp(),
    },
    score: currentScore + pointsEarned,
  })

  return { isCorrect, pointsEarned }
}
