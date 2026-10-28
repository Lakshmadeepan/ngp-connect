import { useEffect, useState } from "react"
import {
  ArrowRight,
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Presentation,
  Search,
  Settings,
  Users,
  UserRound,
  X,
} from "lucide-react"
import "./HomeDashboard.css"

import ClassroomPage from "./ClassroomPage"
import CollegeAssistantPage from "./CollegeAssistantPage"
import CommunityPage from "./CommunityPage"
import EventsPage from "./EventsPage"
import SettingsPage from "./SettingsPage"
import SharedResourcesPage from "./SharedResourcesPage"
import NotificationsPage, {
  initialNotifications,
  type NotificationItem,
} from "./NotificationsPage"

type HomeDashboardProps = {
  onLogout?: () => void
}

type ProfileDetails = {
  name: string
  email: string
  role: string
  department: string
  semester: string
  academicYear: string
  instagram: string
  github: string
  linkedin: string
  classroomConnected: boolean | null
}

const defaultProfile: ProfileDetails = {
  name: "Student",
  email: "student@drngpit.ac.in",
  role: "Student",
  department: "Computer Science",
  semester: "6",
  academicYear: "3",
  instagram: "",
  github: "",
  linkedin: "",
  classroomConnected: null,
}

const profileStorageKey = "ngp-profile-details"

function getProfileFromStorage(): ProfileDetails {
  if (typeof window === "undefined") {
    return defaultProfile
  }

  const savedProfile = localStorage.getItem(profileStorageKey)

  if (!savedProfile) {
    return defaultProfile
  }

  try {
    return { ...defaultProfile, ...JSON.parse(savedProfile) }
  } catch {
    return defaultProfile
  }
}

function getProfileInitials(name: string) {
  const trimmedName = name.trim()

  if (!trimmedName) {
    return "S"
  }

  return trimmedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "S"
}

const navigation = [
  { label: "Home", icon: Home, page: "home" },

  { label: "My Classroom", icon: Presentation, page: "classroom" },

  { label: "Shared Resources", icon: FolderOpen, page: "resources" },

  { label: "College AI", icon: BrainCircuit, page: "college-ai" },

  { label: "Community", icon: Users, page: "community" },

  { label: "Events", icon: CalendarDays, page: "events" },

  { label: "Notifications", icon: Bell, page: "notifications" },

  { label: "Settings", icon: Settings, page: "settings" },
]

const quickLinks = [
  {
    title: "My Classroom",

    description: "Classes & tasks",

    icon: Presentation,

    page: "classroom",
  },

  {
    title: "Shared Resources",

    description: "Notes & study guides",

    icon: FolderOpen,

    page: "resources",
  },

  {
    title: "College AI",

    description: "Your study assistant",

    icon: BrainCircuit,

    page: "college-ai",
  },

  {
    title: "Community",

    description: "Meet your community",

    icon: Users,

    page: "community",
  },
]

const bottomNavigation = [
  { label: "Home", icon: Home, page: "home" },

  { label: "Community", icon: Users, page: "community" },

  { label: "Create", icon: Plus, page: "create" },

  { label: "AI", icon: BrainCircuit, page: "college-ai" },

  { label: "Resources", icon: BookOpen, page: "resources" },
]

export default function HomeDashboard({ onLogout }: HomeDashboardProps) {
  const [activePage, setActivePage] = useState("home")

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [searchOpen, setSearchOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")

  const [notificationOpen, setNotificationOpen] = useState(false)

  const [profileOpen, setProfileOpen] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)

  const [profile, setProfile] = useState<ProfileDetails>(() => getProfileFromStorage())

  const [profileDraft, setProfileDraft] = useState<ProfileDetails>(() => getProfileFromStorage())

  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light"
    }

    const storedTheme = localStorage.getItem("ngp-theme")
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  })

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem("ngp-theme", theme)
  }, [theme])

  useEffect(() => {
    setProfileDraft(profile)
  }, [profile])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(profileStorageKey, JSON.stringify(profile))
    }
  }, [profile])

  const activeLabel =
    navigation.find((item) => item.page === activePage)?.label ??
    (activePage === "profile" ? "Profile" : "Home")

  const unreadNotificationCount = notifications.filter(
    (item) => item.unread,
  ).length

  const searchResults = searchQuery.trim()
    ? navigation.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : navigation.filter((item) => item.page !== "settings").slice(0, 4)

  const navigate = (page: string) => {
    setActivePage(page)

    setSidebarOpen(false)

    setSearchOpen(false)

    setCreateOpen(false)

    setNotificationOpen(false)

    setProfileOpen(false)
  }

  const handleProfileSave = () => {
    setProfile(profileDraft)
    setIsEditingProfile(false)
  }

  const handleProfileCancel = () => {
    setProfileDraft(profile)
    setIsEditingProfile(false)
  }

  const profileInitials = getProfileInitials(profile.name)

  const socialLinks = [
    { label: "Instagram", value: profile.instagram },
    { label: "GitHub", value: profile.github },
    { label: "LinkedIn", value: profile.linkedin },
  ].filter((item) => item.value.trim())

  const handleBottomNavigation = (page: string) => {
    if (page === "create") {
      setCreateOpen(true)

      return
    }

    navigate(page)
  }

  return (
    <div className="ngp-dashboard">
      {sidebarOpen && (
        <button
          className="ngp-sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`ngp-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="ngp-brand">
          <div className="ngp-brand-mark" aria-hidden="true">
            <GraduationCap size={24} />
          </div>
          <div className="ngp-brand-copy">
            <h2>NGP CONNECT</h2>
            <span>Learn. Connect. Participate.</span>
          </div>
          <button
            className="ngp-close-sidebar"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <p className="ngp-menu-label">MAIN MENU</p>
        <nav className="ngp-navigation" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.page}
                className={`ngp-nav-item ${
                  activePage === item.page ? "active" : ""
                }`}
                onClick={() => navigate(item.page)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
                {activePage === item.page && (
                  <span className="ngp-active-indicator" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="ngp-sidebar-bottom">
          {onLogout && (
            <button
              className="ngp-nav-item ngp-logout"
              onClick={() => {
                setSidebarOpen(false)

                onLogout()
              }}
            >
              <LogOut size={19} />
              <span>Sign Out</span>
            </button>
          )}
          <button
            className={`ngp-sidebar-profile ${
              activePage === "profile" ? "active" : ""
            }`}
            onClick={() => navigate("profile")}
          >
            <span className="ngp-sidebar-profile-icon">
              <UserRound size={19} />
            </span>
            <span className="ngp-sidebar-profile-copy">
              <strong>{profile.name}</strong>
              <span>View profile details</span>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </aside>

      <main className="ngp-main">
        <header
          className={`ngp-topbar ${activePage !== "home" ? "ngp-topbar-subpage" : ""}`}
        >
          <div className="ngp-topbar-left">
            <button
              className="ngp-mobile-menu"
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="ngp-header-brand-mark" aria-hidden="true">
              <GraduationCap size={22} />
            </div>
            <span className="ngp-header-brand-name">
              {activePage === "home" ? "NGP CONNECT" : activeLabel}
            </span>
          </div>

          <div className="ngp-topbar-actions">
            <button
              className={`ngp-header-action ${searchOpen ? "selected" : ""}`}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            <div className="ngp-action-wrap">
              <button
                className={`ngp-header-action ${
                  notificationOpen ? "selected" : ""
                }`}
                aria-label={
                  unreadNotificationCount > 0
                    ? `Notifications, ${unreadNotificationCount} unread`
                    : "Notifications"
                }
                aria-expanded={notificationOpen}
                onClick={() => {
                  setNotificationOpen((open) => !open)

                  setProfileOpen(false)
                }}
              >
                <Bell size={20} />
                {unreadNotificationCount > 0 && (
                  <span className="ngp-notification-badge">
                    {unreadNotificationCount > 9
                      ? "9+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>
              {notificationOpen && (
                <div className="ngp-popover ngp-notification-popover">
                  <strong>
                    {unreadNotificationCount > 0
                      ? `${unreadNotificationCount} unread ${
                          unreadNotificationCount === 1
                            ? "notification"
                            : "notifications"
                        }`
                      : "You're all caught up"}
                  </strong>
                  <p>Open notifications to review campus activity.</p>
                  <button type="button" onClick={() => navigate("notifications")}>
                    <Bell size={15} /> View notifications
                  </button>
                </div>
              )}
            </div>
            <div className="ngp-action-wrap">
              <button
                className="ngp-profile-button"
                aria-label={`${profile.name} profile`}
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen((open) => !open)

                  setNotificationOpen(false)
                }}
              >
                <span className="ngp-avatar">{profileInitials}</span>
                <span className="ngp-profile-info">
                  <strong>{profile.name}</strong>
                  <span>NGP Connect</span>
                </span>
              </button>
              {profileOpen && (
                <div className="ngp-popover ngp-profile-popover">
                  <strong>{profile.name}</strong>
                  <span>{profile.email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      navigate("profile")
                    }}
                  >
                    <UserRound size={15} /> View profile
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false)

                        onLogout()
                      }}
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {searchOpen && (
            <form
              className="ngp-search-panel"
              role="search"
              onSubmit={(event) => event.preventDefault()}
            >
              <Search size={18} />
              <input
                type="search"
                autoFocus
                placeholder="Search your campus..."
                aria-label="Search your campus"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <div className="ngp-search-results" aria-live="polite">
                <span className="ngp-search-results-label">
                  {searchQuery.trim() ? "RESULTS" : "QUICK LINKS"}
                </span>
                {searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    const Icon = item.icon

                    return (
                      <button
                        type="button"
                        key={item.page}
                        onClick={() => navigate(item.page)}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                        <ChevronRight size={15} />
                      </button>
                    )
                  })
                ) : (
                  <p>No matching sections. Try a different search.</p>
                )}
              </div>
            </form>
          )}
        </header>

        <div className="ngp-dashboard-content">
          {activePage !== "home" ? (
            activePage === "classroom" ? (
              <ClassroomPage />
            ) : activePage === "resources" ? (
              <SharedResourcesPage />
            ) : activePage === "college-ai" ? (
              <CollegeAssistantPage />
            ) : activePage === "community" ? (
              <CommunityPage />
            ) : activePage === "events" ? (
              <EventsPage />
            ) : activePage === "notifications" ? (
              <NotificationsPage
                notifications={notifications}
                setNotifications={setNotifications}
                onNavigate={navigate}
              />
            ) : activePage === "settings" ? (
              <SettingsPage
                onLogout={onLogout}
                onNavigate={navigate}
                theme={theme}
                onThemeChange={setTheme}
              />
            ) : activePage === "profile" ? (
              <section className="ngp-profile-page">
                <p className="ngp-eyebrow">YOUR ACCOUNT</p>
                <h1>Profile</h1>
                <div className="ngp-profile-card">
                  <div className="ngp-profile-card-avatar">{profileInitials}</div>
                  <div className="ngp-profile-card-copy">
                    <h2>{profile.name}</h2>
                    <p>{profile.email}</p>
                    <span>{profile.role}</span>
                  </div>
                  <button
                    type="button"
                    className="ngp-profile-edit-button"
                    onClick={() => setIsEditingProfile((current) => !current)}
                  >
                    {isEditingProfile ? "Close" : "Edit Profile"}
                  </button>
                </div>

                <section className="ngp-profile-details">
                  <div className="ngp-profile-header-row">
                    <h2>Personal Information</h2>
                    {isEditingProfile && (
                      <span className="ngp-profile-edit-status">Editing</span>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <div className="ngp-profile-form-grid">
                      <label className="ngp-form-field">
                        <span>Full name</span>
                        <input
                          type="text"
                          value={profileDraft.name}
                          onChange={(event) =>
                            setProfileDraft((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="ngp-form-field">
                        <span>College email</span>
                        <input
                          type="email"
                          value={profileDraft.email}
                          onChange={(event) =>
                            setProfileDraft((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="ngp-form-field">
                        <span>Department</span>
                        <input
                          type="text"
                          value={profileDraft.department}
                          onChange={(event) =>
                            setProfileDraft((current) => ({
                              ...current,
                              department: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="ngp-form-field">
                        <span>Semester</span>
                        <input
                          type="text"
                          value={profileDraft.semester}
                          onChange={(event) =>
                            setProfileDraft((current) => ({
                              ...current,
                              semester: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="ngp-form-field">
                        <span>Academic year</span>
                        <input
                          type="text"
                          value={profileDraft.academicYear}
                          onChange={(event) =>
                            setProfileDraft((current) => ({
                              ...current,
                              academicYear: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="ngp-form-field">
                        <span>Instagram</span>
                        <input
                          type="text"
                          value={profileDraft.instagram}
                          onChange={(event) =>
                            setProfileDraft((current) => ({
                              ...current,
                              instagram: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="ngp-form-field">
                        <span>GitHub</span>
                        <input
                          type="url"
                          value={profileDraft.github}
                          onChange={(event) =>
                            setProfileDraft((current) => ({
                              ...current,
                              github: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="ngp-form-field">
                        <span>LinkedIn</span>
                        <input
                          type="url"
                          value={profileDraft.linkedin}
                          onChange={(event) =>
                            setProfileDraft((current) => ({
                              ...current,
                              linkedin: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <dl className="ngp-profile-list">
                      <div>
                        <dt>Name</dt>
                        <dd>{profile.name}</dd>
                      </div>
                      <div>
                        <dt>College Email</dt>
                        <dd>{profile.email}</dd>
                      </div>
                      <div>
                        <dt>Department</dt>
                        <dd>{profile.department || "Not available"}</dd>
                      </div>
                      <div>
                        <dt>Semester</dt>
                        <dd>{profile.semester || "Not available"}</dd>
                      </div>
                      <div>
                        <dt>Academic Year</dt>
                        <dd>{profile.academicYear || "Not available"}</dd>
                      </div>
                    </dl>
                  )}

                  {socialLinks.length > 0 && (
                    <div className="ngp-profile-links">
                      <h3>Social Links</h3>
                      <div className="ngp-profile-link-list">
                        {socialLinks.map(({ label, value }) => (
                          <a
                            key={label}
                            className="ngp-profile-link-item"
                            href={value}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${label} profile`}
                          >
                            {label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.classroomConnected !== null && (
                    <div className="ngp-profile-status">
                      <div className="ngp-profile-status-copy">
                        <strong>Google Classroom</strong>
                        <span>
                          {profile.classroomConnected
                            ? "Your classroom is connected in this app."
                            : "Google Classroom is not currently connected."}
                        </span>
                      </div>
                      <span
                        className={`ngp-status-badge ${
                          profile.classroomConnected ? "connected" : "disconnected"
                        }`}
                      >
                        {profile.classroomConnected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  )}

                  <p className="ngp-profile-note">
                    {isEditingProfile
                      ? "Changes are stored locally in this browser for this frontend demo."
                      : "Profile information is shown from the data currently available in this app."}
                  </p>
                </section>

                <div className="ngp-profile-actions">
                  {isEditingProfile ? (
                    <>
                      <button
                        type="button"
                        className="ngp-primary-button"
                        onClick={handleProfileSave}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="ngp-secondary-button"
                        onClick={handleProfileCancel}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="ngp-primary-button"
                        onClick={() => navigate("home")}
                      >
                        Back to Home <ChevronRight size={17} />
                      </button>
                      {onLogout && (
                        <button
                          type="button"
                          className="ngp-secondary-button"
                          onClick={onLogout}
                        >
                          Sign Out
                        </button>
                      )}
                    </>
                  )}
                </div>
              </section>
            ) : (
              <section className="ngp-placeholder">
                <div className="ngp-placeholder-icon">
                  <HelpCircle size={25} />
                </div>
                <p className="ngp-eyebrow">YOUR CAMPUS, CONNECTED</p>
                <h1>{activeLabel}</h1>
                <p>
                  Explore {activeLabel.toLowerCase()} and stay connected with
                  your campus community.
                </p>
                <button
                  className="ngp-primary-button"
                  onClick={() => navigate("home")}
                >
                  Back to Home <ChevronRight size={17} />
                </button>
              </section>
            )
          ) : (
            <>
              <section className="ngp-greeting">
                <p className="ngp-eyebrow">GOOD MORNING</p>
                <h1>Welcome back, Student!</h1>
                <p>Your campus, your community, your space.</p>
              </section>

              <section className="ngp-welcome-banner">
                <div className="ngp-welcome-copy">
                  <h2>
                    Your Campus.
                    <br />
                    Connected.
                  </h2>
                  <p>Learn. Connect. Participate.</p>
                  <button
                    className="ngp-banner-button"
                    onClick={() => navigate("community")}
                  >
                    Explore Community <ArrowRight size={16} />
                  </button>
                </div>
              </section>

              <section className="ngp-section">
                <div className="ngp-section-heading">
                  <div>
                    <h2>Quick Access</h2>
                    <p>Everything you need, all in one place.</p>
                  </div>
                </div>
                <div className="ngp-quick-grid">
                  {quickLinks.map((item) => {
                    const Icon = item.icon

                    return (
                      <button
                        className="ngp-quick-card"
                        key={item.page}
                        onClick={() => navigate(item.page)}
                      >
                        <span className="ngp-quick-icon">
                          <Icon size={20} strokeWidth={1.8} />
                        </span>
                        <span className="ngp-quick-copy">
                          <strong>{item.title}</strong>
                          <span>{item.description}</span>
                        </span>
                        <ChevronRight
                          className="ngp-quick-arrow"
                          size={15}
                          aria-hidden="true"
                        />
                      </button>
                    )
                  })}
                </div>
              </section>

              <div className="ngp-lower-grid">
                <section className="ngp-panel">
                  <div className="ngp-section-heading">
                    <div>
                      <h2>Upcoming Events</h2>
                      <p>Make the most of campus life.</p>
                    </div>
                    <button
                      className="ngp-text-button"
                      onClick={() => navigate("events")}
                    >
                      See all <ChevronRight size={15} />
                    </button>
                  </div>
                  <div className="ngp-event-list">
                    <article className="ngp-event">
                      <div className="ngp-event-date">
                        <span>NOV</span>
                        <strong>04</strong>
                      </div>
                      <div className="ngp-event-info">
                        <h3>Campus Tech Symposium</h3>
                        <p>
                          <Clock3 size={13} /> 10:00 AM – 1:00 PM
                        </p>
                        <p>
                          <MapPin size={13} /> Main Auditorium
                        </p>
                      </div>
                      <ChevronRight className="ngp-event-arrow" size={17} />
                    </article>
                    <article className="ngp-event">
                      <div className="ngp-event-date">
                        <span>NOV</span>
                        <strong>08</strong>
                      </div>
                      <div className="ngp-event-info">
                        <h3>Student Project Showcase</h3>
                        <p>
                          <Clock3 size={13} /> 2:00 PM – 4:00 PM
                        </p>
                        <p>
                          <MapPin size={13} /> Innovation Hub
                        </p>
                      </div>
                      <ChevronRight className="ngp-event-arrow" size={17} />
                    </article>
                    <article className="ngp-event">
                      <div className="ngp-event-date">
                        <span>NOV</span>
                        <strong>12</strong>
                      </div>
                      <div className="ngp-event-info">
                        <h3>Creative Coding Workshop</h3>
                        <p>
                          <Clock3 size={13} /> 11:00 AM – 12:30 PM
                        </p>
                        <p>
                          <MapPin size={13} /> Computer Lab 2
                        </p>
                      </div>
                      <ChevronRight className="ngp-event-arrow" size={17} />
                    </article>
                  </div>
                </section>

                <section className="ngp-panel">
                  <div className="ngp-section-heading">
                    <div>
                      <h2>Latest Updates</h2>
                      <p>Fresh from your campus community.</p>
                    </div>
                    <button
                      className="ngp-text-button"
                      onClick={() => navigate("community")}
                    >
                      See all <ChevronRight size={15} />
                    </button>
                  </div>
                  <article className="ngp-update">
                    <span className="ngp-update-icon">
                      <Users size={18} />
                    </span>
                    <div>
                      <h3>Welcome to NGP Connect</h3>
                      <p>Meet classmates and find your campus community.</p>
                      <span className="ngp-update-category">COMMUNITY</span>
                    </div>
                  </article>
                  <div className="ngp-update-divider" />
                  <article className="ngp-update">
                    <span className="ngp-update-icon resource">
                      <FileText size={18} />
                    </span>
                    <div>
                      <h3>New study resources are here</h3>
                      <p>Explore helpful notes shared by fellow students.</p>
                      <span className="ngp-update-category">RESOURCES</span>
                    </div>
                  </article>
                  <div className="ngp-update-divider" />
                  <article className="ngp-update">
                    <span className="ngp-update-icon event">
                      <CalendarDays size={18} />
                    </span>
                    <div>
                      <h3>Save the date: Tech Symposium</h3>
                      <p>Join students for a day of ideas and innovation.</p>
                      <span className="ngp-update-category">CAMPUS LIFE</span>
                    </div>
                  </article>
                </section>
              </div>

              <footer className="ngp-footer">
                <span>© {new Date().getFullYear()} NGP Connect</span>
                <span>Learn. Connect. Participate.</span>
              </footer>
            </>
          )}
        </div>
      </main>

      <nav className="ngp-bottom-nav" aria-label="Mobile navigation">
        {bottomNavigation.map((item) => {
          const Icon = item.icon

          const isActive =
            item.page === "create" ? createOpen : item.page === activePage

          return (
            <button
              className={`ngp-bottom-item ${isActive ? "active" : ""} ${
                item.page === "create" ? "create-item" : ""
              }`}
              key={item.page}
              aria-label={item.label}
              aria-current={item.page === activePage ? "page" : undefined}
              onClick={() => handleBottomNavigation(item.page)}
            >
              <span className="ngp-bottom-icon">
                <Icon size={item.page === "create" ? 25 : 20} />
              </span>
              <span className="ngp-bottom-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {createOpen && (
        <div
          className="ngp-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCreateOpen(false)
          }}
        >
          <section
            className="ngp-create-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ngp-create-title"
          >
            <div className="ngp-sheet-heading">
              <div>
                <p className="ngp-eyebrow">MAKE SOMETHING HAPPEN</p>
                <h2 id="ngp-create-title">Create</h2>
              </div>
              <button
                className="ngp-sheet-close"
                aria-label="Close create menu"
                onClick={() => setCreateOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <button
              className="ngp-create-option"
              onClick={() => navigate("community")}
            >
              <span className="ngp-create-option-icon">
                <MessageCircle size={19} />
              </span>
              <span>
                <strong>Community post</strong>
                <small>Share an update with your campus</small>
              </span>
              <ChevronRight size={17} />
            </button>
            <button
              className="ngp-create-option"
              onClick={() => navigate("resources")}
            >
              <span className="ngp-create-option-icon">
                <FileText size={19} />
              </span>
              <span>
                <strong>Share a resource</strong>
                <small>Help others learn and grow</small>
              </span>
              <ChevronRight size={17} />
            </button>
            <button
              className="ngp-create-option"
              onClick={() => navigate("events")}
            >
              <span className="ngp-create-option-icon">
                <CalendarDays size={19} />
              </span>
              <span>
                <strong>Campus event</strong>
                <small>Bring your community together</small>
              </span>
              <ChevronRight size={17} />
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
