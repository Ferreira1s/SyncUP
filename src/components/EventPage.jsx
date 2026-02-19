import { useState, useEffect } from 'react'
import { subscribeToEvent, addParticipant } from '../firebase'
import NamePrompt from './NamePrompt'
import AvailabilityGrid from './AvailabilityGrid'
import ResultsView from './ResultsView'

function EventPage({ eventId, onNotify }) {
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState('name') // 'name' | 'grid' | 'results'
    const [participantName, setParticipantName] = useState(null)
    const [linkCopied, setLinkCopied] = useState(false)

    // Subscribe to real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToEvent(eventId, (data) => {
            if (data) {
                setEvent(data)
            } else {
                onNotify('Evento não encontrado!', 'error')
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [eventId])

    const shareLink = window.location.origin + '/evento/' + eventId

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setLinkCopied(true)
            onNotify('Link copiado!', 'success')
            setTimeout(() => setLinkCopied(false), 2000)
        }).catch(() => {
            onNotify('Não foi possível copiar o link', 'error')
        })
    }

    const handleNameSubmit = (name) => {
        setParticipantName(name)
        setStep('grid')
    }

    const handleAvailabilityDone = async (availability) => {
        try {
            await addParticipant(eventId, participantName, availability)
            setStep('results')
            onNotify(`${participantName} adicionado com sucesso!`, 'success')
        } catch (err) {
            onNotify('Erro ao guardar: ' + err.message, 'error')
        }
    }

    const handleAddAnother = () => {
        setParticipantName(null)
        setStep('name')
    }

    if (loading) {
        return (
            <div className="view-content card" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⏳</div>
                <p style={{ color: 'var(--text-muted)' }}>A carregar evento...</p>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="view-content card" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>😕</div>
                <p>Evento não encontrado.</p>
                <a href="/" className="btn" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>
                    Voltar ao Início
                </a>
            </div>
        )
    }

    return (
        <div className="view-content">
            {/* Share Link Banner */}
            <div className="card" style={{
                marginBottom: 'var(--spacing-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'space-between'
            }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Partilha este link com os teus amigos:</p>
                    <p style={{
                        fontSize: '0.8rem',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        wordBreak: 'break-all',
                        color: 'var(--accent)',
                        fontFamily: 'monospace'
                    }}>
                        {shareLink}
                    </p>
                </div>
                <button
                    onClick={handleCopyLink}
                    className="btn"
                    style={{ width: 'auto', padding: '8px 20px', fontSize: '0.85rem' }}
                >
                    {linkCopied ? '✓ Copiado!' : 'Copiar Link'}
                </button>
            </div>

            {/* Step Content */}
            {step === 'name' && (
                <NamePrompt onNext={handleNameSubmit} onError={(msg) => onNotify(msg, 'error')} />
            )}

            {step === 'grid' && (
                <AvailabilityGrid
                    eventName={event.name}
                    participantName={participantName}
                    onDone={handleAvailabilityDone}
                    onError={(msg) => onNotify(msg, 'error')}
                />
            )}

            {step === 'results' && (
                <ResultsView
                    group={event}
                    onAddParticipant={handleAddAnother}
                    onRestart={() => window.location.href = '/'}
                    onNotify={onNotify}
                />
            )}
        </div>
    )
}

export default EventPage
