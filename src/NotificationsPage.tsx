import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  CircleUserRound,
  FileText,
  Filter,
  MessageCircle,
  Users,
} from "lucide-react"

import "./NotificationsPage.css"

export type NotificationCategory =
  | "Events"
  | "Community"
  | "Team Requests"
  | "Resources"
  | "My Classroom"
  | "Account"

export type NotificationItem = {
  id: string
  category: NotificationCategory
  sender: string
  message: string
  time: string
  destination: string
  unread: boolean
  isDemo: boolean
}

export const initialNotifications: NotificationItem[] = [
  {
    id: "demo-event-hackathon",
    category: "Events",
    sender: "Campus Events",
    message: "A new hackathon announcement is available to explore.",
    time: "5 min ago",
    destination: "events",
    unread: true,
    isDemo: true,
  },
  {
    id: "demo-community-comment",
    category: "Community",
    sender: "Community",
    message: "There is a new comment on a collaboration post.",
    time: "28 min ago",
    destination: "community",
    unread: true,
    isDemo: true,
  },
  {
    id: "demo-team-request",
    category: "Team Requests",
    sender: "Project Collaboration",
    message: "A student is interested in joining a project team.",
    time: "Yesterday",
    destination: "community",
    unread: true,
    isDemo: true,
  },
  {
    id: "demo-resource-reply",
    category: "Resources",
    sender: "Shared Resources",
    message: "A new study material reply is available to review.",
    time: "Yesterday",
    destination: "resources",
    unread: true,
    isDemo: true,
  },
  {
    id: "demo-account-profile",
    category: "Account",
    sender: "NGP Connect",
    message: "Your profile details are ready to review.",
    time: "2 days ago",
    destination: "profile",
    unread: false,
    isDemo: true,
  },
]

type FilterName = "All" | "Unread" | "Events" | "Community" | "Classroom"

type NotificationsPageProps = {
  notifications: NotificationItem[]
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>
  onNavigate: (page: string) => void
}

const filters: FilterName[] = [
  "All",
  "Unread",
  "Events",
  "Community",
  "Classroom",
]

function NotificationIcon({ category }: { category: NotificationCategory }) {
  const Icon =
    category === "Events"
      ? CalendarDays
      : category === "Community"
        ? MessageCircle
        : category === "Team Requests"
          ? Users
          : category === "Resources"
            ? FileText
            : category === "My Classroom"
              ? BookOpen
              : CircleUserRound

  return (
    <span className={`notification-category-icon notification-icon-${category.toLowerCase().replace(" ", "-")}`}>
      <Icon size={17} strokeWidth={1.9} />
    </span>
  )
}

export default function NotificationsPage({
  notifications,
  setNotifications,
  onNavigate,
}: NotificationsPageProps) {
  const [activeFilter, setActiveFilter] = useState<FilterName>("All")

  const unreadCount = notifications.filter((item) => item.unread).length
  const visibleNotifications = useMemo(
    () =>
      notifications.filter((item) => {
        if (activeFilter === "Unread") return item.unread
        if (activeFilter === "Classroom")
          return item.category === "My Classroom"
        if (activeFilter === "Events" || activeFilter === "Community")
          return item.category === activeFilter
        return true
      }),
    [activeFilter, notifications],
  )

  const markOneAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    )
  }

  const toggleRead = (id: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unread: !item.unread } : item,
      ),
    )
  }

  const openNotification = (item: NotificationItem) => {
    markOneAsRead(item.id)
    onNavigate(item.destination)
  }

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, unread: false })),
    )
  }

  return (
    <section className="ngp-notifications" aria-labelledby="notifications-title">
      <header className="notifications-heading">
        <div>
          <p className="ngp-eyebrow">YOUR CAMPUS UPDATES</p>
          <h1 id="notifications-title">Notifications</h1>
          <p>Stay up to date with activity across NGP Connect.</p>
        </div>
        <button
          type="button"
          className="notifications-mark-all"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={16} />
          Mark all as read
        </button>
      </header>

      <p className="notifications-demo-note">
        These are sample notifications for this browser prototype, not real
        activity from other student accounts. Google Classroom updates will
        appear only after a live notifications integration is connected.
      </p>

      <div className="notifications-panel">
        <div className="notifications-panel-heading">
          <div>
            <h2>Recent activity</h2>
            <span>
              {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
            </span>
          </div>
          <Bell size={18} aria-hidden="true" />
        </div>

        <div className="notifications-filters" aria-label="Filter notifications">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? "active" : ""}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === "All" && <Filter size={13} />}
              {filter}
              {filter === "Unread" && unreadCount > 0 && (
                <span className="notifications-filter-count">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {visibleNotifications.length > 0 ? (
          <div className="notification-list">
            {visibleNotifications.map((item) => (
              <article
                key={item.id}
                className={`notification-item ${item.unread ? "is-unread" : ""}`}
              >
                <NotificationIcon category={item.category} />
                <button
                  type="button"
                  className="notification-open"
                  onClick={() => openNotification(item)}
                  aria-label={`Open ${item.category} notification: ${item.message}`}
                >
                  <span className="notification-copy">
                    <span className="notification-item-topline">
                      <strong>{item.sender}</strong>
                      {item.isDemo && <span className="notification-demo-tag">DEMO</span>}
                    </span>
                    <span className="notification-message">{item.message}</span>
                    <span className="notification-time">{item.time}</span>
                  </span>
                  {item.unread && <span className="notification-unread-dot" aria-label="Unread" />}
                  <ChevronRight size={16} className="notification-chevron" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="notification-read-toggle"
                  onClick={() => toggleRead(item.id)}
                  aria-label={`${item.unread ? "Mark as read" : "Mark as unread"}: ${item.message}`}
                  title={item.unread ? "Mark as read" : "Mark as unread"}
                >
                  {item.unread ? <Check size={15} /> : <Bell size={14} />}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="notifications-empty">
            <span className="notifications-empty-icon">
              <Bell size={22} />
            </span>
            <h3>
              {activeFilter === "Classroom"
                ? "Classroom notifications aren't connected"
                : activeFilter === "Unread"
                  ? "You're all caught up"
                  : "No notifications yet"}
            </h3>
            <p>
              {activeFilter === "Classroom"
                ? "Google Classroom courses can be viewed in My Classroom, but live announcement and assignment notifications are not connected."
                : activeFilter === "Unread"
                  ? "There are no unread notifications in this prototype."
                  : "New activity will appear here when a notification source is connected."}
            </p>
          </div>
        )}

        <footer className="notifications-panel-footer">
          <span>Notification settings and cross-user updates are not connected in this prototype.</span>
        </footer>
      </div>
    </section>
  )
}
