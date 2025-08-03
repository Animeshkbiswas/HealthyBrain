# HealthyBrain

**HealthyBrain** is a full-stack mental health companion platform built with React and Node.js, further enhanced by fine-tuned Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG). It offers 3D avatars, AI-driven assessments, expert resources, a professional marketplace, and highly personalized support for users on their journey to mental wellness.

---

## Key Features

**1. Fine-Tuned LLM-Powered Conversations**  
HealthyBrain integrates a custom fine-tuned LLM for personalized mental health conversations, empathetic support, and tailored advice. The LLM is trained to recognize contextual nuances and user sentiment, ensuring dynamic, sensitive interactions.

**2. Retrieval-Augmented Generation (RAG) for Expert Responses**  
Key content modules leverage RAG, combining the LLM’s fluency with retrieval from a curated knowledge base of mental health articles, research, and platform resources. This guarantees up-to-date, evidence-based responses in areas such as self-assessments, coping strategies, and psychoeducation.

**3. 3D Interactive Avatar**  
A WebGL-powered avatar responds to user audio, animates, and lip-syncs using `@react-three/fiber` for a relatable user experience.

**4. Professional Marketplace**  
Connect users to licensed psychiatrists and therapists through a searchable directory; supports telehealth and profile viewing.

**5. AI-Driven Self-Assessments & Personalized Wellness Plans**  
Interactive questionnaires and AI-generated, downloadable wellness plans and reports.

**6. Voice-Based Interaction**  
Real-time head tracking and morph-target lip-sync, powered by audio input and LLM-understood context for dynamic conversational flows.

**7. Secure User Authentication**  
OAuth2 (Google) via Appwrite for account security.

**8. Modular Sidebar Navigation**  
Responsive sidebar for easy feature access.



## RAG (Retrieval-Augmented Generation) Workflow

- **User Query** →  
- **Backend receives query**  
- **Relevant documents retrieved from KB** (vector search, e.g., using Pinecone, Qdrant, or ChromaDB)
- **Query & docs provided to LLM**  
- **LLM generates grounded, context-rich response**  
- **Response returned to user (text + optional avatar animation/voice)**

---

## Installation

1. **Clone the repository and install dependencies**
    ```
    git clone https://github.com/Animeshkbiswas/HealthyBrain.git
    cd HealthyBrain
    npm install
    cd backend
    npm install
    ```

2. **Configure environment variables**
    - Create `.env` in `/backend` and add your credentials for:
        - Appwrite (endpoint, project ID, DB)
        - LLM provider (API keys, endpoint)
        - Vector DB for RAG (if self-hosted)

3. **Run development servers**
    ```
    # In project root
    npm start
    # In backend folder
    npm run dev
    ```

4. **Access at** `http://localhost:3000`

---

## Usage

- Start a conversation with the in-app chat: LLM and RAG are automatically engaged.
- Upload your own documents or notes to personalize the RAG knowledge base (optional, admin feature).
- Use self-assessments, access blogs and resources, and book professional appointments—all enhanced with AI-generated insights.

---

## Available Scripts

In the project root:

- `npm start` — React dev server  
- `npm test` — Test runner  
- `npm run build` — Production build

In `/backend`:

- `npm run dev` — Nodemon server  
- `npm start` — Production

---

## Deployment

- Build React app using `npm run build` and deploy to a static site host.
- Deploy backend to preferred Node.js host (e.g., Heroku, AWS).
- Configure environment variables for:
    - Appwrite
    - LLM provider
    - Vector DB for RAG

---

## Custom Fine-Tuning/LLM Usage

- **Model**: The backend can be configured to call your fine-tuned OpenAI GPT, Hugging Face, or any custom LLM APIs.
- **RAG**: Documents (markdown, PDFs, etc.) can be indexed automatically at startup or via admin upload, creating vector embeddings for RAG-powered answers.
- **Security**: LLM and RAG endpoints are protected and rate-limited via API keys from the environment.

---

## Contributing

Pull requests and discussions are welcome! Please ensure your code passes existing tests and linting.

---

## License

This project is licensed under the MIT license.

---

**HealthyBrain** — Blending immersive technology and advanced AI to empower better mental health for all.



## Architecture

