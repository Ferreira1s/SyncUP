# SyncUp 📅

Uma Web App colaborativa para combinar saídas e hangouts com amigos, sem a confusão dos grupos de chat.

## 🚀 Demo ao Vivo
[https://gravitic-star.vercel.app](https://gravitic-star.vercel.app)

## ✨ Funcionalidades
*   **Criação de Eventos**: Dá um nome ao teu plano e recebe um link único.
*   **Colaborativo**: Partilha o link e vê os teus amigos a entrarem em tempo real.
*   **Melhores Dias**: A app destaca automaticamente os dias em que todos podem.
*   **Mapa de Calor**: Visualiza rapidamente a disponibilidade do grupo.
*   **100% em Português**: Interface pensada para utilizadores PT.

## 🛠️ Tecnologias Usadas
*   **Frontend**: React (Vite)
*   **Backend / DB**: Firebase Realtime Database
*   **Deploy**: Vercel

## 💻 Como correr no teu PC

1.  **Clonar o repositório**
    ```bash
    git clone https://github.com/Ferreira1s/SyncUP.git
    cd SyncUP
    ```

2.  **Instalar dependências**
    ```bash
    npm install
    ```

3.  **Configurar Variáveis de Ambiente**
    Cria um ficheiro `.env` na raiz do projeto com as tuas chaves do Firebase:
    ```env
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_DATABASE_URL=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_STORAGE_BUCKET=...
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...
    ```

4.  **Correr o projeto**
    ```bash
    npm run dev
    ```

## 📄 Licença
MIT
