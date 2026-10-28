import { useState } from "react"
import RegistrationFlow from "./RegistrationFlow"
import HomeDashboard from "./HomeDashboard"

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.3-5 9-5 9 5 9 5-3.3 5-9 5-9-5-9-5Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden && <path d="m4 4 16 16" />}
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285f4"
        d="M21.6 12.23c0-.72-.06-1.25-.2-1.8H12v3.4h5.52a4.72 4.72 0 0 1-2.05 3.1v2.2h3.32c1.95-1.79 3.07-4.43 3.07-7.56l-.26.66Z"
      />
      <path
        fill="#34a853"
        d="M12 22c2.79 0 5.13-.92 6.84-2.5l-3.32-2.58a6.2 6.2 0 0 1-9.23-3.26H2.86v2.66A10.33 10.33 0 0 0 12 22Z"
      />
      <path
        fill="#fbbc05"
        d="M6.29 13.66A6.2 6.2 0 0 1 5.96 12c0-.58.1-1.14.3-1.66V7.68H2.85A10 10 0 0 0 1.76 12c0 1.55.37 3.02 1.1 4.32l3.43-2.66Z"
      />
      <path
        fill="#ea4335"
        d="M12 5.82c1.52 0 2.88.52 3.96 1.55l2.96-2.96A10 10 0 0 0 2.86 7.68l3.42 2.66A6.18 6.18 0 0 1 12 5.82Z"
      />
    </svg>
  )
}

function SignInPage({
  onSignUp,
  onSignIn,
}: {
  onSignUp: () => void
  onSignIn: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="page">
      <section className="login-card" aria-label="NGP Connect sign in">
        <div className="graduation-banner">
          <img
            src="/assets/ngp-login-reference.png"
            alt="Graduate in a cap and gown adjusting her mortarboard"
          />
        </div>

        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span>P</span>
            <i />
          </div>
          <div>
            <div className="brand-name">
              <strong>NGP</strong> CONNECT
            </div>
            <p>
              One Platform. <span>All Connected.</span>
            </p>
          </div>
        </div>

        <header className="intro">
          <p className="eyebrow">STUDENT PORTAL</p>
          <h1>Welcome back!</h1>
          <p className="subtitle">Sign in to continue to your account.</p>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSignIn()
          }}
        >
          <label htmlFor="email">College Email</label>
          <div className="input-wrap">
            <MailIcon />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your college email"
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <LockIcon />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            <button
              className="eye-button"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon hidden={!showPassword} />
            </button>
          </div>

          <div className="form-meta">
            <span>
              Use your official <strong>@drngpit.ac.in</strong> account
            </span>
            <a href="#forgot-password">Forgot Password?</a>
          </div>

          <button className="primary-button" type="submit">
            Sign In
          </button>

          <div className="divider">
            <span />
            <b>OR</b>
            <span />
          </div>

          <button className="google-button" type="button">
            <GoogleIcon />
            Continue with Google
          </button>
        </form>

        <p className="signup">
          Don&apos;t have an account?{" "}
          <a
            href="#sign-up"
            onClick={(event) => {
              event.preventDefault()
              onSignUp()
            }}
          >
            Sign Up
          </a>
        </p>
      </section>
    </main>
  )
}

export default function App() {
  const [page, setPage] = useState<"sign-in" | "sign-up" | "dashboard">(
    "sign-in",
  )

  if (page === "sign-up") {
    return (
      <RegistrationFlow onSignIn={() => setPage("sign-in")} />
    )
  }

  if (page === "dashboard") {
    return <HomeDashboard onLogout={() => setPage("sign-in")} />
  }

  return (
    <SignInPage
      onSignUp={() => setPage("sign-up")}
      onSignIn={() => setPage("dashboard")}
    />
  )
}
