import { FormEvent, useState } from "react"
import {
  Bot,
  Eraser,
  MessageCircle,
  Send,
} from "lucide-react"

import "./CollegeAssistantPage.css"

type AssistantMessage = {
  id: number
  role: "assistant" | "user"
  text: string
}

const welcomeText = "Hi! I'm your NGP Connect assistant. How can I help you today?"

const welcomeMessage: AssistantMessage = {
  id: 0,
  role: "assistant",
  text: welcomeText,
}

function getCollegeResponse(question: string): AssistantMessage {
  const normalized = question.toLowerCase()
  let text =
    "The College Assistant service is not connected yet, so I can't generate an answer to that question."

  if (normalized.includes("google classroom") || normalized.includes("classroom")) {
    text =
      "Google Classroom access is available from My Classroom. Course information is shown only after Google authorization is configured and approved; entering an email alone does not connect an account."
  } else if (normalized.includes("resource") || normalized.includes("study")) {
    text =
      "Shared Resources is available in the dashboard navigation, but a connected resource library is not configured in this project yet."
  } else if (
    normalized.includes("event") ||
    normalized.includes("opportunit")
  ) {
    text =
      "The Events section is available in the dashboard, but a live college events or opportunities source is not connected. I can't confirm current listings or dates."
  } else if (
    normalized.includes("teammate") ||
    normalized.includes("project") ||
    normalized.includes("community")
  ) {
    text =
      "Community is available in the dashboard navigation. Its current content is a local prototype with demonstration posts; it is not shared across student accounts."
  } else if (
    normalized.includes("navigate") ||
    normalized.includes("ngp connect")
  ) {
    text =
      "Use the dashboard sidebar to open Home, My Classroom, Shared Resources, College AI, Community, Events, Settings, and other available sections. On mobile, open the menu or use the bottom navigation."
  }

  return {
    id: Date.now() + 1,
    role: "assistant",
    text,
  }
}

function RobotMascot() {
  return (
    <div className="college-ai-mascot" aria-hidden="true">
      <div className="college-ai-mascot-glow" />
      <div className="college-ai-robot">
        <span className="college-ai-robot-antenna" />
        <span className="college-ai-robot-ear college-ai-robot-ear-left" />
        <span className="college-ai-robot-ear college-ai-robot-ear-right" />
        <div className="college-ai-robot-face">
          <span className="college-ai-robot-eye" />
          <span className="college-ai-robot-eye" />
          <span className="college-ai-robot-smile" />
        </div>
        <div className="college-ai-robot-neck" />
        <div className="college-ai-robot-body">
          <Bot size={25} strokeWidth={1.8} />
        </div>
      </div>
      <span className="college-ai-mascot-sparkle college-ai-mascot-sparkle-one" />
      <span className="college-ai-mascot-sparkle college-ai-mascot-sparkle-two" />
    </div>
  )
}

export default function CollegeAssistantPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([welcomeMessage])
  const [draft, setDraft] = useState("")

  const sendMessage = (text: string) => {
    const question = text.trim()
    if (!question) return

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: question },
      getCollegeResponse(question),
    ])
    setDraft("")
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    sendMessage(draft)
  }

  const clearChat = () => {
    setMessages([welcomeMessage])
    setDraft("")
  }

  return (
    <section className="college-ai-page" aria-labelledby="college-ai-title">
      <header className="college-ai-heading">
        <div>
          <h1 id="college-ai-title">Your College Assistant</h1>
          <p>Your campus information, all in one conversation.</p>
        </div>
      </header>

      <div className="college-ai-layout">
        <section className="college-ai-welcome-card">
          <RobotMascot />
          <div className="college-ai-welcome-copy">
            <p className="college-ai-welcome-label">HERE TO HELP YOU GET AROUND</p>
            <h2>Hi! I'm your NGP Connect assistant. How can I help you today?</h2>
            <p className="college-ai-welcome-description">
              Ask about NGP Connect features and available campus information.
              Live AI answers are not connected yet.
            </p>
          </div>
        </section>

        <section
          className="college-ai-chat-card"
          aria-label="College Assistant chat"
        >
          <div className="college-ai-chat-top">
            <div className="college-ai-chat-title">
              <span className="college-ai-chat-icon">
                <MessageCircle size={17} />
              </span>
              <div>
                <h2>Assistant chat</h2>
                <p>NGP Connect information</p>
              </div>
            </div>
            <button
              type="button"
              className="college-ai-clear-icon"
              onClick={clearChat}
              aria-label="Clear chat"
              title="Clear chat"
              disabled={messages.length === 1}
            >
              <Eraser size={17} />
            </button>
          </div>

          <div className="college-ai-messages" aria-live="polite">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`college-ai-message college-ai-message-${message.role}`}
              >
                {message.role === "assistant" && (
                  <span className="college-ai-message-avatar" aria-hidden="true">
                    <Bot size={17} />
                  </span>
                )}
                <div className="college-ai-message-content">
                  <p>{message.text}</p>
                </div>
              </article>
            ))}
          </div>

          <form className="college-ai-composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="college-ai-input">
              Ask about NGP Connect or campus information
            </label>
            <input
              id="college-ai-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about NGP Connect..."
              maxLength={500}
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Send message">
              <Send size={17} />
              <span>Send</span>
            </button>
          </form>
          <p className="college-ai-disclaimer">
            No live AI service is connected. Don't share passwords or sensitive
            personal information in this demo chat.
          </p>
        </section>
      </div>
    </section>
  )
}
