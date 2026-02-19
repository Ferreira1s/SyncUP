import { useState, useEffect } from 'react'

function ResultsView({ group, onAddParticipant, onRestart, onNotify }) {
    const [heatmap, setHeatmap] = useState({})
    const [maxOverlap, setMaxOverlap] = useState(0)
    const [bestSlots, setBestSlots] = useState([])
    const [dates, setDates] = useState([])
    const totalParticipants = group?.participants?.length || 0

    // Generate dates (Next 30 days)
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
                month: date.toLocaleDateString('pt-PT', { month: 'short' }),
                fullLabel: date.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
            })
        }
        setDates(d)
    }, [])

    // Calculate heatmap
    useEffect(() => {
        if (!group || !group.participants || group.participants.length === 0) return

        const slotsMap = {}
        let max = 0
        let best = []

        group.participants.forEach(p => {
            // Firebase may store arrays as objects — normalize
            const avail = Array.isArray(p.availability) ? p.availability : Object.values(p.availability || {})
            avail.forEach(slot => {
                slotsMap[slot] = (slotsMap[slot] || 0) + 1
                if (slotsMap[slot] > max) max = slotsMap[slot]
            })
        })

        if (max > 0) {
            best = Object.entries(slotsMap)
                .filter(([_, count]) => count === max)
                .map(([slot]) => slot)
        }

        setHeatmap(slotsMap)
        setMaxOverlap(max)
        setBestSlots(best)
    }, [group])

    // Get label for a date
    const getDateLabel = (dateStr) => {
        const d = dates.find(x => x.full === dateStr)
        return d ? d.fullLabel : dateStr
    }

    // Determine if everyone is free on a given slot
    const isEveryoneFree = (count) => count === totalParticipants

    return (
        <div className="view-content" style={{ maxWidth: '800px' }}>
            {/* Best Days Banner */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>
                    {group?.name}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>
                    {totalParticipants} participante{totalParticipants !== 1 ? 's' : ''} registado{totalParticipants !== 1 ? 's' : ''}
                </p>

                {bestSlots.length > 0 ? (
                    <div>
                        <p style={{ color: 'var(--accent)', fontWeight: '600', marginBottom: 'var(--spacing-sm)', fontSize: '1.1rem' }}>
                            {isEveryoneFree(maxOverlap) ? '🎉 Todos disponíveis!' : `⭐ Melhor(es) dia(s) — ${maxOverlap}/${totalParticipants} disponíveis`}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                            {bestSlots.map(slot => (
                                <div key={slot} style={{
                                    background: 'var(--accent)',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '99px',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 0 15px var(--accent-glow)',
                                    textTransform: 'capitalize'
                                }}>
                                    {getDateLabel(slot)}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Ainda sem datas coincidentes.</p>
                )}
            </div>

            {/* Heatmap Grid */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Mapa de Disponibilidade</h4>
                <div className="grid-container" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                    gap: '8px'
                }}>
                    {dates.map(d => {
                        const count = heatmap[d.full] || 0
                        const isBest = count === maxOverlap && count > 0
                        const isAll = isEveryoneFree(count)

                        // Color intensity based on count
                        let bg = 'rgba(255,255,255,0.03)'
                        let borderColor = 'rgba(255,255,255,0.05)'

                        if (count > 0 && totalParticipants > 0) {
                            const ratio = count / totalParticipants
                            if (isAll) {
                                bg = 'var(--success)'
                                borderColor = 'var(--success)'
                            } else if (isBest) {
                                bg = 'var(--accent)'
                                borderColor = 'var(--accent)'
                            } else {
                                bg = `rgba(180, 120, 255, ${ratio * 0.6})`
                                borderColor = `rgba(180, 120, 255, ${ratio * 0.4})`
                            }
                        }

                        return (
                            <div
                                key={d.full}
                                title={`${count}/${totalParticipants} disponíveis`}
                                style={{
                                    background: bg,
                                    borderRadius: '8px',
                                    padding: '8px 4px',
                                    textAlign: 'center',
                                    border: `1px solid ${borderColor}`,
                                    boxShadow: (isBest || isAll) ? '0 0 10px var(--accent-glow)' : 'none',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ fontSize: '0.7rem', color: count > 0 ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{d.dayName}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{d.dayNum}</div>
                                <div style={{ fontSize: '0.6rem', color: count > 0 ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{d.month}</div>
                                {count > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '2px',
                                        right: '4px',
                                        fontSize: '0.6rem',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '4px',
                                        padding: '1px 3px'
                                    }}>
                                        {count}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Participants List */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Participantes</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(group?.participants || []).map(p => (
                        <div key={p.id} style={{
                            background: 'rgba(255,255,255,0.08)',
                            padding: '6px 14px',
                            borderRadius: '99px',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {p.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({(Array.isArray(p.availability) ? p.availability : Object.values(p.availability || {})).length} dias)</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                <button onClick={onAddParticipant} className="btn">
                    Adicionar Participante
                </button>
                <button onClick={onRestart} className="btn secondary">
                    Começar de Novo
                </button>
            </div>
        </div>
    )
}

export default ResultsView
