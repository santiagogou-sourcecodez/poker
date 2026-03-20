import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCGxIupxt8cXs9R7GB-KFPW8Ik9ys4FvbY',
  authDomain: 'poker-sudio.firebaseapp.com',
  projectId: 'poker-sudio',
  storageBucket: 'poker-sudio.firebasestorage.app',
  messagingSenderId: '687209387723',
  appId: '1:687209387723:web:a55569d607a46f6a7d2d4e',
}

const hasConfig = true

let app: FirebaseApp | null = null
let firestore: Firestore | null = null

if (hasConfig) {
  app = initializeApp(firebaseConfig)
  firestore = getFirestore(app)
}

export { app, firestore }
export { hasConfig as isFirebaseEnabled }
