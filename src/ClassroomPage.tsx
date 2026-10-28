import { FormEvent, useCallback, useEffect, useRef, useState } from "react"

import {
  AlertCircle,
  ExternalLink,
  Info,
  LoaderCircle,
  LogOut,
  RefreshCw,
} from "lucide-react"

import {
  GOOGLE_CLASSROOM_COURSES_URL,
  GOOGLE_CLASSROOM_SCOPE,
  GOOGLE_IDENTITY_SCRIPT_URL,
} from "./googleClassroomConfig"

import "./ClassroomPage.css"

type GoogleTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
  scope?: string
}

interface GoogleTokenRequestOptions {
  hint?: string
  prompt?: string
}

type GoogleTokenClient = {
  requestAccessToken: (options?: GoogleTokenRequestOptions) => void
}

type GoogleOAuthError = {
  type: string
  message?: string
}

type GoogleIdentityServices = {
  accounts: {
    oauth2: {
      initTokenClient: (options: {
        client_id: string
        scope: string
        callback: (response: GoogleTokenResponse) => void
        error_callback: (error: GoogleOAuthError) => void
      }) => GoogleTokenClient
      revoke: (token: string, callback?: () => void) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityServices
  }
}

type Course = {
  id: string
  name: string
  section?: string
  description?: string
  room?: string
  alternateLink?: string
}

type CourseListResponse = {
  courses?: Course[]
  nextPageToken?: string
}

type GoogleApiErrorResponse = {
  error?: {
    message?: string
  }
}

type ConnectionState =
  | "loading-google"
  | "ready"
  | "authorizing"
  | "loading-courses"
  | "connected"
  | "empty"
  | "authorization-denied"
  | "api-error"

function GoogleClassroomLogo() {
  return (
    <svg
      className="classroom-google-logo"
      viewBox="0 0 48 48"
      role="img"
      aria-label="Google Classroom"
    >
      <path
        fill="#188038"
        d="M10 5h28a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z"
      />
      <path fill="#34a853" d="M10 5h28a4 4 0 0 1 4 4v4H6V9a4 4 0 0 1 4-4Z" />
      <circle cx="18" cy="18" r="4" fill="#fbbc04" />
      <circle cx="30" cy="18" r="4" fill="#4285f4" />
      <path
        fill="#fff"
        d="M10.5 34a7.5 7.5 0 0 1 15 0v3h-15v-3Zm12-1a7.5 7.5 0 0 1 15 0v4h-15v-4Z"
      />
      <path fill="#fbbc04" d="M6 13h5v25H6z" />
      <path fill="#4285f4" d="M37 13h5v25h-5z" />
      <path fill="#188038" d="M6 38h36v2a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-2Z" />
    </svg>
  )
}

function getApiErrorMessage(body: GoogleApiErrorResponse, status: number) {
  return (
    body.error?.message ||
    `Google Classroom returned an error (HTTP ${status}). Please try again.`
  )
}

export default function ClassroomPage() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ""
  const [email, setEmail] = useState("")
  const [state, setState] = useState<ConnectionState>(
    clientId ? "loading-google" : "ready",
  )
  const [courses, setCourses] = useState<Course[]>([])
  const [message, setMessage] = useState("")
  const [googleReady, setGoogleReady] = useState(false)
  const accessTokenRef = useRef<string | null>(null)
  const tokenClientRef = useRef<GoogleTokenClient | null>(null)
  const mountedRef = useRef(true)

  const clearToken = useCallback(() => {
    const token = accessTokenRef.current
    accessTokenRef.current = null
    setCourses([])
    let revokeFailed = false

    if (token && window.google?.accounts.oauth2) {
      try {
        window.google.accounts.oauth2.revoke(token)
      } catch {
        revokeFailed = true
      }
    }

    setState("ready")
    return revokeFailed
  }, [])

  const loadCourses = useCallback(async (token: string) => {
    setState("loading-courses")
    setMessage("")
    setCourses([])

    try {
      const allCourses: Course[] = []
      let pageToken: string | undefined

      do {
        const url = new URL(GOOGLE_CLASSROOM_COURSES_URL)
        url.searchParams.set("pageSize", "100")
        if (pageToken) url.searchParams.set("pageToken", pageToken)

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const body =
          (await response.json()) as CourseListResponse | GoogleApiErrorResponse

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            accessTokenRef.current = null
            setState("authorization-denied")
            setMessage(
              response.status === 401
                ? "Google authorization expired or was denied. Please connect again."
                : "Google denied access to courses. Confirm the Classroom courses.readonly scope is enabled and consented to, then connect again.",
            )
            return
          }

          setState("api-error")
          setMessage(
            getApiErrorMessage(body as GoogleApiErrorResponse, response.status),
          )
          return
        }

        const courseResponse = body as CourseListResponse
        allCourses.push(...(courseResponse.courses ?? []))
        pageToken = courseResponse.nextPageToken
      } while (pageToken)

      if (!mountedRef.current || accessTokenRef.current !== token) return

      setCourses(allCourses)
      setState(allCourses.length > 0 ? "connected" : "empty")
    } catch {
      if (!mountedRef.current || accessTokenRef.current !== token) return
      setState("api-error")
      setMessage(
        "Could not reach Google Classroom. Check your connection and try again.",
      )
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    if (!clientId) {
      setState("ready")
      setMessage(
        "Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your environment and restart Vite.",
      )
      return () => {
        mountedRef.current = false
      }
    }

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_IDENTITY_SCRIPT_URL}"]`,
    )

    const initializeGoogle = () => {
      if (!mountedRef.current) return

      const oauth = window.google?.accounts.oauth2
      if (!oauth) {
        setState("authorization-denied")
        setMessage(
          "Google Identity Services did not initialize. Reload the page and try again.",
        )
        return
      }

      tokenClientRef.current = oauth.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_CLASSROOM_SCOPE,
        callback: (response) => {
          if (!mountedRef.current) return

          if (response.error || !response.access_token) {
            setState("authorization-denied")
            setMessage(
              response.error_description ||
                "Google authorization was denied or could not be completed.",
            )
            return
          }

          if (
            response.scope &&
            !response.scope.split(/\s+/).includes(GOOGLE_CLASSROOM_SCOPE)
          ) {
            setState("authorization-denied")
            setMessage(
              "Google did not grant the Classroom courses.readonly permission. Please authorize the requested access and try again.",
            )
            return
          }

          accessTokenRef.current = response.access_token
          void loadCourses(response.access_token)
        },
        error_callback: (error) => {
          if (!mountedRef.current) return
          setState("authorization-denied")
          setMessage(
            error.message ||
              (error.type === "popup_closed"
                ? "Google authorization was closed before it completed."
                : "Google authorization could not be started. Check the OAuth client and authorized JavaScript origins."),
          )
        },
      })

      setGoogleReady(true)
      setState("ready")
      setMessage("")
    }

    const handleScriptError = () => {
      if (!mountedRef.current) return
      setState("authorization-denied")
      setMessage(
        "Google Identity Services could not be loaded. Check your network connection and try again.",
      )
    }

    if (window.google?.accounts.oauth2) {
      initializeGoogle()
    } else {
      if (!script) {
        script = document.createElement("script")
        script.src = GOOGLE_IDENTITY_SCRIPT_URL
        script.async = true
        script.defer = true
      }

      script.addEventListener("load", initializeGoogle, { once: true })
      script.addEventListener("error", handleScriptError, { once: true })
      if (!script.isConnected) document.head.appendChild(script)
    }

    return () => {
      mountedRef.current = false
      script?.removeEventListener("load", initializeGoogle)
      script?.removeEventListener("error", handleScriptError)
    }
  }, [clientId, loadCourses])

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage("")

    if (!clientId) {
      setState("ready")
      setMessage(
        "Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your environment and restart Vite.",
      )
      return
    }

    if (!googleReady || !tokenClientRef.current) {
      setMessage("Google sign-in is still loading. Please try again shortly.")
      return
    }

    setState("authorizing")
    try {
      tokenClientRef.current.requestAccessToken({
        hint: email.trim(),
        prompt: "",
      })
    } catch {
      setState("authorization-denied")
      setMessage(
        "Google sign-in could not be opened. Check the OAuth client configuration and authorized JavaScript origins.",
      )
    }
  }

  const handleDisconnect = () => {
    const revokeFailed = clearToken()
    setEmail("")
    setMessage(
      revokeFailed
        ? "The token was cleared from this page, but Google could not complete the revocation request."
        : "Google Classroom was disconnected from this page.",
    )
  }

  const retryCourses = () => {
    const token = accessTokenRef.current
    if (token) void loadCourses(token)
  }

  const isBusy =
    state === "loading-google" ||
    state === "authorizing" ||
    state === "loading-courses"
  const hasToken = accessTokenRef.current !== null
  const showConnectForm = !hasToken && state !== "loading-google"

  return (
    <section
      className="ngp-classroom-page"
      aria-labelledby="classroom-page-title"
    >
      <header className="classroom-page-heading">
        <p className="ngp-eyebrow">LEARNING TOOLS</p>
        <h1 id="classroom-page-title">My Classroom</h1>
        <p>
          Access your classes, assignments, and learning materials through NGP
          Connect.
        </p>
      </header>

      <section
        className="classroom-connection-card"
        aria-labelledby="classroom-connection-title"
      >
        <div className="classroom-card-heading">
          <div className="classroom-logo-tile">
            <GoogleClassroomLogo />
          </div>
          <div>
            <p className="classroom-kicker">GOOGLE CLASSROOM</p>
            <h2 id="classroom-connection-title">
              {hasToken ? "Your classroom courses" : "Connect your account"}
            </h2>
          </div>
        </div>

        {showConnectForm && (
          <form className="classroom-connect-form" onSubmit={handleContinue}>
            <label htmlFor="classroom-google-email">Google account email</label>
            <input
              id="classroom-google-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button
              className="classroom-continue-button"
              type="submit"
              disabled={isBusy || !googleReady}
            >
              Continue with Google
              <ExternalLink size={17} aria-hidden="true" />
            </button>
            <p className="classroom-helper">
              Sign in securely with your Google account to connect your
              classroom.
            </p>
          </form>
        )}

        {isBusy && (
          <p className="classroom-state-message" role="status">
            <LoaderCircle className="classroom-spinner" size={18} />
            {state === "loading-google"
              ? "Loading secure Google sign-in…"
              : state === "authorizing"
                ? "Waiting for Google authorization…"
                : "Loading courses from Google Classroom…"}
          </p>
        )}

        {state === "empty" && (
          <p className="classroom-state-message" role="status">
            No Google Classroom courses were returned for this account.
          </p>
        )}

        {state === "authorization-denied" && message && (
          <p
            className="classroom-state-message is-error"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={18} />
            {message}
          </p>
        )}

        {state === "ready" && message && (
          <p className="classroom-state-message is-error" role="alert">
            <AlertCircle size={18} />
            {message}
          </p>
        )}

        {state === "api-error" && (
          <div className="classroom-state-message is-error" role="alert">
            <AlertCircle size={18} />
            <span>{message}</span>
            {hasToken ? (
              <button
                className="classroom-retry-button"
                type="button"
                onClick={retryCourses}
              >
                <RefreshCw size={15} />
                Retry
              </button>
            ) : null}
          </div>
        )}

        {hasToken && (
          <div className="classroom-connected-tools">
            <button
              className="classroom-disconnect-button"
              type="button"
              onClick={handleDisconnect}
            >
              <LogOut size={16} aria-hidden="true" />
              Disconnect
            </button>
          </div>
        )}

        {state === "connected" && courses.length > 0 && (
          <div className="classroom-course-list" aria-live="polite">
            <p className="classroom-course-count">
              {courses.length} {courses.length === 1 ? "course" : "courses"}{" "}
              from Google Classroom
            </p>
            {courses.map((course) => (
              <article className="classroom-course-card" key={course.id}>
                <div className="classroom-course-symbol" aria-hidden="true">
                  {course.name.charAt(0).toUpperCase()}
                </div>
                <div className="classroom-course-copy">
                  <h3>{course.name}</h3>
                  {course.section && <p>{course.section}</p>}
                  {course.room && (
                    <p className="classroom-course-room">{course.room}</p>
                  )}
                  {course.description && (
                    <p className="classroom-course-description">
                      {course.description}
                    </p>
                  )}
                </div>
                {course.alternateLink && (
                  <a
                    className="classroom-course-link"
                    href={course.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${course.name} in Google Classroom`}
                  >
                    <ExternalLink size={17} />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <aside className="classroom-note">
        <Info size={19} aria-hidden="true" />
        <div>
          <strong>
            Your Google password is entered only on Google&apos;s sign-in page.
          </strong>
          <p>
            NGP Connect requests read-only access to your Google Classroom
            courses. Access tokens remain in page memory and are cleared when
            you disconnect or leave this page.
          </p>
        </div>
      </aside>
    </section>
  )
}
