import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, set, get, onValue } from 'firebase/database'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

// --- Database Functions ---

// Create a new event, returns the event ID
export async function createEvent(name) {
    const eventsRef = ref(db, 'events')
    const newEventRef = push(eventsRef)
    await set(newEventRef, {
        name,
        createdAt: Date.now(),
        participants: {}
    })
    return newEventRef.key
}

// Get event data once
export async function getEvent(eventId) {
    const eventRef = ref(db, `events/${eventId}`)
    const snapshot = await get(eventRef)
    if (snapshot.exists()) {
        return { id: eventId, ...snapshot.val() }
    }
    return null
}

// Add a participant's availability to an event
export async function addParticipant(eventId, name, availability) {
    const participantsRef = ref(db, `events/${eventId}/participants`)
    const newParticipantRef = push(participantsRef)
    await set(newParticipantRef, {
        name,
        availability,
        addedAt: Date.now()
    })
    return newParticipantRef.key
}

// Subscribe to real-time updates for an event
export function subscribeToEvent(eventId, callback) {
    const eventRef = ref(db, `events/${eventId}`)
    const unsubscribe = onValue(eventRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val()
            // Convert participants from object to array
            const participants = data.participants
                ? Object.entries(data.participants).map(([id, p]) => ({ id, ...p }))
                : []
            callback({ id: eventId, name: data.name, participants })
        } else {
            callback(null)
        }
    })
    return unsubscribe
}

export default db
