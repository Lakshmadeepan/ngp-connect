import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Info,
  LogOut,
  Moon,
  Palette,
  ShieldCheck,
  SunMedium,
  UserRound,
  Users,
} from "lucide-react"

import "./SettingsPage.css"

type SettingsPageProps = {
  onLogout?: () => void
  onNavigate: (page: string) => void
  theme: "light" | "dark"
  onThemeChange: (theme: "light" | "dark") => void
}

type NotificationPreferences = {
  classroom: boolean
  events: boolean
  community: boolean
}

type SettingsOptionKey =
  | "account"
  | "notifications"
  | "privacy"
  | "appearance"
  | "about"

const preferenceOptions: {
  key: keyof NotificationPreferences
  label: string
  description: string
  icon: typeof BookOpen
}[] = [
  {
    key: "classroom",
    label: "Classroom updates",
    description: "Course and learning activity updates",
    icon: BookOpen,
  },
  {
    key: "events",
    label: "Event reminders",
    description: "Campus events and activity updates",
    icon: CalendarDays,
  },
  {
    key: "community",
    label: "Community notifications",
    description: "Community posts and discussions",
    icon: Users,
  },
]

const settingsOptions = [
  {
    key: "account",
    title: "Account Information",
    description: "Manage your profile details.",
    icon: UserRound,
  },
  {
    key: "notifications",
    title: "Notifications",
    description: "Control classroom, event, and community alerts.",
    icon: Bell,
  },
  {
    key: "privacy",
    title: "Privacy & Security",
    description: "Review account security and connected Google account information.",
    icon: ShieldCheck,
  },
  {
    key: "appearance",
    title: "Appearance",
    description: "Choose Dark Mode or Light Mode.",
    icon: Palette,
  },
  {
    key: "about",
    title: "About NGP Connect",
    description: "View application information.",
    icon: Info,
  },
] as const

function SettingsOptionButton({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string
  description: string
  icon: typeof UserRound
  onClick: () => void
}) {
  return (
    <button
      className="settings-option-button"
      type="button"
      onClick={onClick}
      aria-label={`${title}: ${description}`}
    >
      <span className="settings-option-icon" aria-hidden="true">
        <Icon size={19} />
      </span>
      <span className="settings-option-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <ChevronRight className="settings-option-chevron" size={18} />
    </button>
  )
}

export default function SettingsPage({
  onLogout,
  onNavigate,
  theme,
  onThemeChange,
}: SettingsPageProps) {
  const [activeSetting, setActiveSetting] = useState<SettingsOptionKey | null>(null)
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem("ngp-notification-preferences")

    if (!saved) {
      return { classroom: true, events: true, community: true }
    }

    try {
      return { ...{ classroom: true, events: true, community: true }, ...JSON.parse(saved) }
    } catch {
      return { classroom: true, events: true, community: true }
    }
  })

  useEffect(() => {
    localStorage.setItem("ngp-notification-preferences", JSON.stringify(preferences))
  }, [preferences])

  const handleSignOut = () => {
    if (onLogout && window.confirm("Are you sure you want to sign out?")) {
      onLogout()
    }
  }

  const detailTitleMap: Record<SettingsOptionKey, string> = {
    account: "Account Information",
    notifications: "Notifications",
    privacy: "Privacy & Security",
    appearance: "Appearance",
    about: "About NGP Connect",
  }

  const detailDescriptionMap: Record<SettingsOptionKey, string> = {
    account: "Review the profile details currently available in this session.",
    notifications: "Choose which updates you want to receive in your portal experience.",
    privacy: "Review the account and connected services information available here.",
    appearance: "Choose the visual theme for your dashboard and portal experience.",
    about: "Learn more about the NGP Connect platform and its purpose.",
  }

  const currentDetailKey = activeSetting

  const renderSettingsDetail = () => {
    if (!currentDetailKey) {
      return null
    }

    if (currentDetailKey === "account") {
      return (
        <div className="settings-detail-panel">
          <dl className="settings-detail-list">
            <div>
              <dt>Name</dt>
              <dd>Student</dd>
            </div>
            <div>
              <dt>College Email</dt>
              <dd>Not available in this demo</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>Not available</dd>
            </div>
            <div>
              <dt>Semester</dt>
              <dd>Not available</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>Not available</dd>
            </div>
          </dl>
          <p className="settings-note">
            Registration details are not retained as account data in this frontend.
          </p>
        </div>
      )
    }

    if (currentDetailKey === "notifications") {
      return (
        <div className="settings-detail-panel">
          <div className="settings-preference-list">
            {preferenceOptions.map(({ key, label, description, icon: Icon }) => (
              <label className="settings-preference" key={key}>
                <span className="settings-preference-icon" aria-hidden="true">
                  <Icon size={17} />
                </span>
                <span className="settings-preference-copy">
                  <span className="settings-preference-label">{label}</span>
                  <span className="settings-preference-description">{description}</span>
                </span>
                <input
                  aria-label={label}
                  checked={preferences[key]}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      [key]: event.target.checked,
                    }))
                  }
                  role="switch"
                  type="checkbox"
                />
                <span className="settings-switch-track" aria-hidden="true" />
              </label>
            ))}
          </div>
          <p className="settings-note">
            These preferences are saved locally in this browser and are not sent to a backend.
          </p>
        </div>
      )
    }

    if (currentDetailKey === "privacy") {
      return (
        <div className="settings-detail-panel">
          <div className="settings-info-block">
            <div>
              <strong>NGP Connect account</strong>
              <p>
                Sign-in is a demo frontend. Account authentication, password management,
                and account recovery are not connected to a real backend.
              </p>
            </div>
            <div>
              <strong>Google Classroom</strong>
              <p>
                Classroom access is managed separately inside My Classroom. Settings does
                not access or change Google authorization credentials.
              </p>
              <button
                className="settings-link-button"
                onClick={() => onNavigate("classroom")}
                type="button"
              >
                Open My Classroom <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (currentDetailKey === "appearance") {
      return (
        <div className="settings-detail-panel">
          <div className="theme-picker" role="radiogroup" aria-label="Theme selection">
            <button
              type="button"
              className={`theme-option ${theme === "light" ? "selected" : ""}`}
              onClick={() => onThemeChange("light")}
              aria-pressed={theme === "light"}
            >
              <span className="theme-option-icon theme-option-light" aria-hidden="true">
                <SunMedium size={18} />
              </span>
              <span className="theme-option-copy">
                <strong>Light Mode</strong>
                <span>Use a bright interface for regular daytime work.</span>
              </span>
            </button>
            <button
              type="button"
              className={`theme-option ${theme === "dark" ? "selected" : ""}`}
              onClick={() => onThemeChange("dark")}
              aria-pressed={theme === "dark"}
            >
              <span className="theme-option-icon theme-option-dark" aria-hidden="true">
                <Moon size={18} />
              </span>
              <span className="theme-option-copy">
                <strong>Dark Mode</strong>
                <span>Use a dark dashboard with high-contrast reading surfaces.</span>
              </span>
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="settings-detail-panel">
        <div className="about-app-card">
          <div className="about-app-brand" aria-hidden="true">
            <span>N</span>
          </div>
          <div>
            <h3>NGP Connect</h3>
            <p>
              NGP Connect is a connected student portal designed to support learning,
              campus communication, and student collaboration in one place.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="settings-page">
      <header className="settings-page-heading">
        <p className="ngp-eyebrow">PERSONALIZE YOUR EXPERIENCE</p>
        <h1>Settings</h1>
        <p>Manage your preferences and review your account information.</p>
      </header>

      {!currentDetailKey ? (
        <>
          <div className="settings-option-list" role="list" aria-label="Settings categories">
            {settingsOptions.map(({ key, title, description, icon: Icon }) => (
              <SettingsOptionButton
                key={key}
                title={title}
                description={description}
                icon={Icon}
                onClick={() => setActiveSetting(key)}
              />
            ))}
          </div>

          <section className="settings-signout" aria-labelledby="settings-signout-title">
            <div className="settings-signout-copy">
              <span className="settings-signout-icon" aria-hidden="true">
                <LogOut size={18} />
              </span>
              <div>
                <h2 id="settings-signout-title">Sign out</h2>
                <p>Return to the NGP Connect sign-in screen on this device.</p>
              </div>
            </div>
            <button
              className="settings-signout-button"
              disabled={!onLogout}
              onClick={handleSignOut}
              type="button"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </section>
        </>
      ) : (
        <div className="settings-subpage">
          <button
            className="settings-back-button"
            type="button"
            onClick={() => setActiveSetting(null)}
          >
            <ArrowLeft size={16} /> Back to Settings
          </button>

          <div className="settings-detail-header">
            <p className="ngp-eyebrow">SETTINGS</p>
            <h2>{detailTitleMap[currentDetailKey]}</h2>
            <p>{detailDescriptionMap[currentDetailKey]}</p>
          </div>

          {renderSettingsDetail()}
        </div>
      )}
    </section>
  )
}
