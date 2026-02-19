function Landing({ onCreate }) {
    return (
        <div className="view-content card">
            <h2>Bem-vindo!</h2>
            <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
                Organiza o teu evento em segundos. Cria um plano e partilha o link com os teus amigos.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <button onClick={onCreate} className="btn">Criar Novo Plano</button>
            </div>
        </div>
    )
}

export default Landing
