import { useState } from 'react'

function CreateGroup({ onNext, onBack, onError }) {
    const [name, setName] = useState('')

    const handleNext = () => {
        if (!name.trim()) {
            onError('Por favor, insira um nome!')
            return
        }
        onNext(name)
    }

    return (
        <div className="view-content card">
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Nome do Evento</h3>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Jantar de Sexta, Café no Zé"
                autoFocus
            />
            <button onClick={handleNext} className="btn" style={{ marginTop: 'var(--spacing-lg)' }}>Seguinte</button>
            <button onClick={onBack} className="btn secondary" style={{ marginTop: 'var(--spacing-sm)' }}>Voltar</button>
        </div>
    )
}

export default CreateGroup
