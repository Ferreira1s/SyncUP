import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import Landing from './components/Landing'
import CreateGroup from './components/CreateGroup'
import EventPage from './components/EventPage'
import { createEvent } from './firebase'

function HomePage() {
  const [view, setView] = useState('landing')
  const navigate = useNavigate()
  const [notification, setNotification] = useState(null)

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreate = async (eventName) => {
    try {
      const eventId = await createEvent(eventName)
      navigate(`/evento/${eventId}`)
    } catch (err) {
      showNotification('Erro ao criar evento: ' + err.message, 'error')
    }
  }

  return (
    <AppShell notification={notification}>
      {view === 'landing' ? (
        <Landing
          onCreate={() => setView('create')}
        />
      ) : (
        <CreateGroup
          onBack={() => setView('landing')}
          onNext={handleCreate}
          onError={(msg) => showNotification(msg, 'error')}
        />
      )}
    </AppShell>
  )
}

function EventRoute() {
  const { eventId } = useParams()
  const [notification, setNotification] = useState(null)

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  return (
    <AppShell notification={notification}>
      <EventPage
        eventId={eventId}
        onNotify={showNotification}
      />
    </AppShell>
  )
}

function AppShell({ children, notification }) {
  return (
    <div id="app">
      <header className="app-header">
        <h1>SyncUp</h1>
        <p>Combine saídas sem stress.</p>
      </header>

      <main id="main-content">
        {children}
      </main>

      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: notification.type === 'error' ? 'var(--bg-card)' : notification.type === 'success' ? 'var(--success)' : 'var(--accent)',
          border: notification.type === 'error' ? '1px solid red' : 'none',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '99px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s',
          maxWidth: '90vw',
          textAlign: 'center'
        }}>
          {notification.msg}
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/evento/:eventId" element={<EventRoute />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
