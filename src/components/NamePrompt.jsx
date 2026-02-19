import { useState } from 'react'

function NamePrompt({ onNext, onError }) {
    const [name, setName] = useState('')

    const handleNext = () => {
        if (!name.trim()) {
            onError('Por favor, insira o seu nome!')
            return
        }
        onNext(name.trim())
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleNext()
    }

    return (
        <div className="view-content card">
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Quem és tu?</h3>
            <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
                Insere o teu nome para registar a tua disponibilidade.
            </p>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ex: João, Maria, Zé..."
                autoFocus
            />
            <button onClick={handleNext} className="btn" style={{ marginTop: 'var(--spacing-lg)' }}>
                Continuar
            </button>
        </div>
    )
}

export default NamePrompt
