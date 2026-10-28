import { ChangeEvent, FormEvent, useMemo, useState } from "react"
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  ImagePlus,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  Share2,
  ThumbsUp,
  Upload,
  X,
} from "lucide-react"

import "./EventsPage.css"

type EventCategory =
  | "Hackathon"
  | "Workshop"
  | "Competition"
  | "Seminar"
  | "Internship"

type EventComment = {
  id: string
  author: string
  text: string
}

type EventPost = {
  id: string
  author: string
  affiliation: string
  postedAt: string
  title: string
  description: string
  category: EventCategory
  date: string
  venue: string
  deadline?: string
  registrationUrl?: string
  posterUrl?: string
  isDemo?: boolean
  likes: number
  comments: EventComment[]
}

type EventFormValues = {
  title: string
  description: string
  category: EventCategory | ""
  date: string
  venue: string
  deadline: string
  registrationUrl: string
}

const categories: EventCategory[] = [
  "Hackathon",
  "Workshop",
  "Competition",
  "Seminar",
  "Internship",
]

const blankForm: EventFormValues = {
  title: "",
  description: "",
  category: "",
  date: "",
  venue: "",
  deadline: "",
  registrationUrl: "",
}

const initialEvents: EventPost[] = [
  {
    id: "demo-hack-night",
    author: "Student Innovation Club",
    affiliation: "Student Club · Campus-wide",
    postedAt: "Demo post · 2 hours ago",
    title: "Build Weekend: Campus Ideas Hackathon",
    description:
      "A sample event post showing how student organizers can share a build challenge, find collaborators, and provide event details. This is demonstration content, not an official campus announcement.",
    category: "Hackathon",
    date: "2026-11-14T09:00",
    venue: "Demo venue · Innovation Space",
    deadline: "2026-11-10",
    registrationUrl: "",
    isDemo: true,
    likes: 18,
    comments: [],
  },
  {
    id: "demo-design-workshop",
    author: "Design Circle",
    affiliation: "Student Club · Design",
    postedAt: "Demo post · Yesterday",
    title: "Product Design & Prototyping Workshop",
    description:
      "A sample workshop listing for students interested in turning a project idea into an interactive prototype. The time and venue below are placeholders for this prototype.",
    category: "Workshop",
    date: "2026-11-20T14:00",
    venue: "Demo venue · Design Studio",
    deadline: "2026-11-18",
    registrationUrl: "",
    isDemo: true,
    likes: 12,
    comments: [],
  },
  {
    id: "demo-tech-talk",
    author: "Computing Society",
    affiliation: "Student Club · CSE",
    postedAt: "Demo post · 3 days ago",
    title: "Inside Modern Cloud Engineering",
    description:
      "Example seminar post with a short event summary. This is not an endorsed or confirmed college event; it demonstrates the Events page layout.",
    category: "Seminar",
    date: "2026-11-26T11:30",
    venue: "Demo venue · Lecture Hall",
    isDemo: true,
    likes: 9,
    comments: [],
  },
]

function formatEventDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function formatDeadline(value?: string) {
  if (!value) return ""
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function EventsPage() {
  const [events, setEvents] = useState(initialEvents)
  const [activeCategory, setActiveCategory] = useState("All events")
  const [search, setSearch] = useState("")
  const [likedEventIds, setLikedEventIds] = useState<string[]>([])
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [postFeedback, setPostFeedback] = useState<Record<string, string>>({})
  const [form, setForm] = useState<EventFormValues>(blankForm)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState("")
  const [formError, setFormError] = useState("")
  const [createOpen, setCreateOpen] = useState(false)

  const visibleEvents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return events.filter((event) => {
      const matchesCategory =
        activeCategory === "All events" || event.category === activeCategory
      const searchable = [
        event.title,
        event.description,
        event.author,
        event.affiliation,
        event.category,
        event.venue,
      ]
        .join(" ")
        .toLowerCase()
      return matchesCategory && (!query || searchable.includes(query))
    })
  }, [activeCategory, events, search])

  const updateForm = (field: keyof EventFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFormError("")
  }

  const changePoster = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setFormError("Choose an image file for the event poster.")
      event.target.value = ""
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Choose an image smaller than 5 MB.")
      event.target.value = ""
      return
    }
    setPosterFile(file)
    setPosterPreview(URL.createObjectURL(file))
    setFormError("")
  }

  const closeCreate = () => {
    setCreateOpen(false)
    setForm(blankForm)
    setPosterFile(null)
    setPosterPreview("")
    setFormError("")
  }

  const publishEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.category ||
      !form.date ||
      !form.venue.trim()
    ) {
      setFormError("Complete the required event details before publishing.")
      return
    }

    let registrationUrl: string | undefined
    if (form.registrationUrl.trim()) {
      try {
        const parsed = new URL(form.registrationUrl.trim())
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          throw new Error("Unsupported URL protocol.")
        }
        registrationUrl = parsed.toString()
      } catch {
        setFormError("Enter a valid registration link beginning with http:// or https://.")
        return
      }
    }

    if (form.deadline && new Date(`${form.deadline}T23:59:59`) > new Date(form.date)) {
      setFormError("Registration deadline must be before the event date.")
      return
    }

    const newEvent: EventPost = {
      id: `local-${Date.now()}`,
      author: "You",
      affiliation: "Student · NGP Connect",
      postedAt: "Just now · Local draft",
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      date: form.date,
      venue: form.venue.trim(),
      deadline: form.deadline || undefined,
      registrationUrl,
      posterUrl: posterPreview || undefined,
      likes: 0,
      comments: [],
    }
    setEvents((current) => [newEvent, ...current])
    setActiveCategory("All events")
    setSearch("")
    closeCreate()
  }

  const toggleLike = (eventId: string) => {
    const wasLiked = likedEventIds.includes(eventId)
    setLikedEventIds((current) =>
      wasLiked
        ? current.filter((id) => id !== eventId)
        : [...current, eventId],
    )
    setEvents((current) =>
      current.map((item) =>
        item.id === eventId
          ? { ...item, likes: Math.max(0, item.likes + (wasLiked ? -1 : 1)) }
          : item,
      ),
    )
  }

  const submitComment = (event: FormEvent<HTMLFormElement>, postId: string) => {
    event.preventDefault()
    const text = (commentDrafts[postId] ?? "").trim()
    if (!text) return
    setEvents((current) =>
      current.map((item) =>
        item.id === postId
          ? {
              ...item,
              comments: [
                ...item.comments,
                { id: `comment-${Date.now()}`, author: "You", text },
              ],
            }
          : item,
      ),
    )
    setCommentDrafts((current) => ({ ...current, [postId]: "" }))
  }

  const shareEvent = async (event: EventPost) => {
    const shareText = `${event.title} — ${formatEventDate(event.date)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text: shareText })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        setPostFeedback((current) => ({ ...current, [event.id]: "Event details copied." }))
      } else {
        setPostFeedback((current) => ({
          ...current,
          [event.id]: "Sharing is unavailable in this browser.",
        }))
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      setPostFeedback((current) => ({
        ...current,
        [event.id]: "Could not share event details from this browser.",
      }))
    }
  }

  return (
    <section className="ngp-events" aria-labelledby="events-title">
      <header className="events-heading">
        <div>
          <p className="ngp-eyebrow">CAMPUS & CAREER</p>
          <h1 id="events-title" className="events-sr-only">Events</h1>
          <p>Discover opportunities to learn, connect, and take part.</p>
        </div>
        <button
          type="button"
          className="events-create-button"
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={17} />
          Create Event Post
        </button>
      </header>

      <p className="events-demo-notice">
        Demo feed: sample posts and posts you create are stored only in this page session. They are not official or shared with other students.
      </p>

      <div className="events-feed-layout">
        <div className="events-feed-column">
          <section className="events-filter-card" aria-label="Search and filter events">
            <label className="events-search">
              <Search size={16} aria-hidden="true" />
              <span className="events-sr-only">Search events</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events, clubs, categories..."
              />
            </label>
            <div className="events-category-filters" aria-label="Event categories">
              {["All events", ...categories].map((category) => (
                <button
                  key={category}
                  type="button"
                  className={activeCategory === category ? "active" : ""}
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          <div className="events-feed" aria-live="polite">
            {visibleEvents.map((event) => {
              const liked = likedEventIds.includes(event.id)
              const commentsOpen = openCommentsFor === event.id
              return (
                <article className="event-post-card" key={event.id}>
                  <header className="event-post-header">
                    <span className="event-author-avatar" aria-hidden="true">
                      {event.author.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="event-author-copy">
                      <strong>{event.author}</strong>
                      <span>{event.affiliation}</span>
                      <span>{event.postedAt}</span>
                    </div>
                    {event.isDemo && <span className="event-demo-badge">DEMO</span>}
                  </header>

                  <div className={`event-poster event-poster-${event.category.toLowerCase()}`}>
                    {event.posterUrl ? (
                      <img src={event.posterUrl} alt={`Poster for ${event.title}`} />
                    ) : (
                      <div className="event-poster-art">
                        <span className="event-poster-kicker">{event.category} · NGP CONNECT</span>
                        <strong>{event.title}</strong>
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                    )}
                  </div>

                  <div className="event-post-content">
                    <div className="event-post-title-row">
                      <span className={`event-category-tag event-category-${event.category.toLowerCase()}`}>
                        {event.category}
                      </span>
                      {event.isDemo && <span className="event-demo-detail">Illustrative details</span>}
                    </div>
                    <h2>{event.title}</h2>
                    <p className="event-description">{event.description}</p>

                    <div className="event-details">
                      <span><CalendarDays size={15} /><strong>{formatEventDate(event.date)}</strong></span>
                      <span><MapPin size={15} />{event.venue}</span>
                      {event.deadline && (
                        <span><Clock3 size={15} />Registration deadline: {formatDeadline(event.deadline)}</span>
                      )}
                    </div>

                    <div className="event-post-actions">
                      <button type="button" className={liked ? "active" : ""} aria-pressed={liked} onClick={() => toggleLike(event.id)}>
                        <ThumbsUp size={16} /> Like <span>{event.likes}</span>
                      </button>
                      <button
                        type="button"
                        className={commentsOpen ? "active" : ""}
                        aria-expanded={commentsOpen}
                        onClick={() => setOpenCommentsFor(commentsOpen ? null : event.id)}
                      >
                        <MessageCircle size={16} /> Comment <span>{event.comments.length}</span>
                      </button>
                      <button type="button" onClick={() => void shareEvent(event)}>
                        <Share2 size={16} /> Share
                      </button>
                      {event.registrationUrl ? (
                        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                          Register <ExternalLink size={14} />
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="event-register-disabled"
                          onClick={() =>
                            setPostFeedback((current) => ({
                              ...current,
                              [event.id]: "A registration link has not been provided for this post.",
                            }))
                          }
                        >
                          Register
                        </button>
                      )}
                    </div>
                    {postFeedback[event.id] && (
                      <p className="event-post-feedback" role="status">{postFeedback[event.id]}</p>
                    )}
                    {commentsOpen && (
                      <section className="event-comments" aria-label={`Comments for ${event.title}`}>
                        <p className="event-local-note">Comments are visible only in this page session.</p>
                        {event.comments.length > 0 ? event.comments.map((comment) => (
                          <div className="event-comment" key={comment.id}>
                            <span className="event-comment-avatar" aria-hidden="true">Y</span>
                            <p><strong>{comment.author}</strong>{comment.text}</p>
                          </div>
                        )) : <p className="event-no-comments">No comments yet.</p>}
                        <form className="event-comment-form" onSubmit={(submitEvent) => submitComment(submitEvent, event.id)}>
                          <label className="events-sr-only" htmlFor={`event-comment-${event.id}`}>Write a comment</label>
                          <input
                            id={`event-comment-${event.id}`}
                            value={commentDrafts[event.id] ?? ""}
                            maxLength={500}
                            onChange={(changeEvent) => setCommentDrafts((current) => ({ ...current, [event.id]: changeEvent.target.value }))}
                            placeholder="Add a helpful comment..."
                          />
                          <button type="submit" aria-label="Post comment" disabled={!(commentDrafts[event.id] ?? "").trim()}>
                            <Send size={15} />
                          </button>
                        </form>
                      </section>
                    )}
                  </div>
                </article>
              )
            })}
            {visibleEvents.length === 0 && (
              <div className="events-empty">
                <CalendarDays size={24} />
                <h2>No matching events</h2>
                <p>Try another search or choose a different category.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {createOpen && (
        <div className="events-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeCreate()
        }}>
          <section className="events-modal" role="dialog" aria-modal="true" aria-labelledby="events-modal-title">
            <header className="events-modal-header">
              <div>
                <p className="ngp-eyebrow">LOCAL PAGE SESSION</p>
                <h2 id="events-modal-title">Create Event Post</h2>
              </div>
              <button type="button" className="events-modal-close" aria-label="Close form" onClick={closeCreate}>
                <X size={19} />
              </button>
            </header>
            <form className="events-form" onSubmit={publishEvent}>
              <label className="events-form-field">
                <span>Event title <b>*</b></span>
                <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} maxLength={120} required />
              </label>
              <label className="events-form-field">
                <span>Description <b>*</b></span>
                <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} rows={4} maxLength={1200} required />
              </label>
              <div className="events-form-row">
                <label className="events-form-field">
                  <span>Category <b>*</b></span>
                  <select value={form.category} onChange={(event) => updateForm("category", event.target.value)} required>
                    <option value="">Choose category</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <label className="events-form-field">
                  <span>Event date and time <b>*</b></span>
                  <input type="datetime-local" value={form.date} onChange={(event) => updateForm("date", event.target.value)} required />
                </label>
              </div>
              <div className="events-form-row">
                <label className="events-form-field">
                  <span>Venue <b>*</b></span>
                  <input value={form.venue} onChange={(event) => updateForm("venue", event.target.value)} maxLength={120} required />
                </label>
                <label className="events-form-field">
                  <span>Registration deadline</span>
                  <input type="date" value={form.deadline} onChange={(event) => updateForm("deadline", event.target.value)} />
                </label>
              </div>
              <label className="events-form-field">
                <span>Registration link</span>
                <input type="url" value={form.registrationUrl} onChange={(event) => updateForm("registrationUrl", event.target.value)} placeholder="https://..." />
              </label>
              <label className="events-poster-upload">
                <ImagePlus size={18} />
                <span>{posterFile ? posterFile.name : "Add an event poster (optional, up to 5 MB)"}</span>
                <Upload size={15} />
                <input type="file" accept="image/*" onChange={changePoster} />
              </label>
              {posterPreview && <img className="events-upload-preview" src={posterPreview} alt="Selected event poster preview" />}
              {formError && <p className="events-form-error" role="alert">{formError}</p>}
              <p className="events-form-notice">Posts are stored only in this browser page session and are not shared with other users.</p>
              <div className="events-form-actions">
                <button type="button" className="events-cancel-button" onClick={closeCreate}>Cancel</button>
                <button type="submit" className="events-publish-button"><Plus size={15} /> Publish Post</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
