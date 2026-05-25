import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            "AIzaSyCdvRAuss9sZqZW-7cKQQ9fFrpecsj6Glw",
  authDomain:        "kahootclone-110c6.firebaseapp.com",
  projectId:         "kahootclone-110c6",
  storageBucket:     "kahootclone-110c6.firebasestorage.app",
  messagingSenderId: "177467082673",
  appId:             "1:177467082673:web:7272ab311157f6bf4cdf90",
}

const app = initializeApp(firebaseConfig)
export const db   = getFirestore(app)
export const auth = getAuth(app)
