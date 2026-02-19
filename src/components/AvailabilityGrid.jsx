import { useState, useEffect } from 'react'

function AvailabilityGrid({ eventName, participantName, onDone, onError }) {
    const [selected, setSelected] = useState([])
    const [isPainting, setIsPainting] = useState(false)
    const [paintMode, setPaintMode] = useState(true)

    // Generate dates (Next 30 days)
    const [dates, setDates] = useState([])
    useEffect(() => {
        const d = []
        const today = new Date()
        for (let i = 0; i < 30; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            d.push({
                full: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('pt-PT', { weekday: 'short' }),
                dayNum: date.getDate(),
                month: date.toLocaleDateString('pt-PT', { month: 'short' })
            })
        }
        setDates(d)
    }, [])

    const toggleSlot = (day) => {
        if (paintMode) {
            if (!selected.includes(day)) setSelected(prev => [...prev, day])
        } else {
            setSelected(prev => prev.filter(s => s !== day))
        }
    }

    const handleMouseDown = (day) => {
        setIsPainting(true)
        const isSelected = selected.includes(day)
        setPaintMode(!isSelected)
        toggleSlot(day)
    }

    const handleMouseEnter = (day) => {
        if (isPainting) toggleSlot(day)
    }

    const handleDone = () => {
        if (selected.length === 0) {
            onError('Por favor, seleciona pelo menos uma data!')
            return
        }
        onDone(selected)
    }

    return (
        <div className="card" style={{ maxWidth: '800px' }} onMouseUp={() => setIsPainting(false)} onMouseLeave={() => setIsPainting(false)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                <div>
                    <h3>Disponibilidade de {participantName}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Evento: {eventName}</p>
                </div>
                <button onClick={handleDone} className="btn" style={{ width: 'auto', padding: '8px 24px' }}>Concluir</button>
            </div>
            <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-muted)' }}>Clica ou arrasta para selecionar os teus dias livres.</p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                gap: '8px',
                userSelect: 'none'
            }}>
                {dates.map(d => {
                    const isSelected = selected.includes(d.full)
                    return (
                        <div
                            key={d.full}
                            onMouseDown={() => handleMouseDown(d.full)}
                            onMouseEnter={() => handleMouseEnter(d.full)}
                            style={{
                                background: isSelected ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '10px 4px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                border: isSelected ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.1)',
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            <div style={{ fontSize: '0.75rem', color: isSelected ? 'white' : 'var(--text-muted)', textTransform: 'uppercase' }}>{d.dayName}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{d.dayNum}</div>
                            <div style={{ fontSize: '0.65rem', color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{d.month}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default AvailabilityGrid
