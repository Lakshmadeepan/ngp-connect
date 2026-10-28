import { FormEvent, useMemo, useState } from "react"
import {
  ArrowDownUp,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Clock3,
  FileText,
  Filter,
  Lightbulb,
  MessageSquareText,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react"

import "./CommunityPage.css"

type PostType =
  | "Team Recruitment"
  | "Material Request"
  | "Project Collaboration"
  | "Technical Question"
  | "Opportunity"

type FilterType = "All Posts" | PostType
type PostStatus = "Open" | "Team Filled" | "Resolved"

type CommunityComment = {
  id: string
  author: string
  text: string
}

type CommunityPost = {
  id: string
  type: PostType
  author: string
  department: string
  minutesAgo: number
  title: string
  description: string
  tags: string[]
  status?: PostStatus
  rolesNeeded?: string
  teammateCount?: number
  requiredSkills?: string
  deadline?: string
  subject?: string
  semester?: string
  resourceType?: string
  eventName?: string
  opportunityLink?: string
  isOwnPost?: boolean
  comments?: CommunityComment[]
}

type FormValues = {
  type: PostType | ""
  title: string
  description: string
  department: string
  semester: string
  tags: string
  rolesNeeded: string
  teammateCount: string
  requiredSkills: string
  deadline: string
  subject: string
  resourceType: string
  eventName: string
  opportunityLink: string
}

const defaultForm: FormValues = {
  type: "",
  title: "",
  description: "",
  department: "",
  semester: "",
  tags: "",
  rolesNeeded: "",
  teammateCount: "",
  requiredSkills: "",
  deadline: "",
  subject: "",
  resourceType: "",
  eventName: "",
  opportunityLink: "",
}

const seedPosts: CommunityPost[] = [
  {
    id: "demo-hackathon-team",
    type: "Team Recruitment",
    author: "Aarav Sharma",
    department: "CSE",
    minutesAgo: 24,
    title: "Looking for teammates for J-Hackathon",
    description:
      "Putting together a small team to build a campus-focused prototype. Looking for people who enjoy shipping thoughtful ideas quickly and collaborating across disciplines.",
    tags: ["React", "UI/UX", "CSE", "Semester 3"],
    status: "Open",
    rolesNeeded: "Frontend developer and UI/UX designer",
    teammateCount: 2,
    requiredSkills: "React, Figma, collaborative prototyping",
    deadline: "This Friday",
  },
  {
    id: "demo-material-request",
    type: "Material Request",
    author: "Diya Patel",
    department: "ECE",
    minutesAgo: 67,
    title: "Need Semester 3 Data Structures notes",
    description:
      "Does anyone have clear revision notes or a topic-wise guide for stacks, queues, trees, and graph traversal? Class notes or a study outline would both help.",
    tags: ["Data Structures", "Semester 3", "Notes", "CSE"],
    status: "Open",
    subject: "Data Structures",
    semester: "Semester 3",
    resourceType: "Notes or study guide",
  },
  {
    id: "demo-campus-app",
    type: "Project Collaboration",
    author: "Nikhil Rao",
    department: "IT",
    minutesAgo: 143,
    title: "Looking for collaborators for a campus navigation app",
    description:
      "Exploring a simple way for new students to find labs, offices, and accessible routes around campus. Looking for collaborators interested in mapping, frontend, or user research.",
    tags: ["React", "Maps", "Accessibility", "Cross-department"],
    status: "Open",
  },
  {
    id: "demo-hackathon-question",
    type: "Technical Question",
    author: "Meera Krishnan",
    department: "CSE",
    minutesAgo: 216,
    title: "How should I prepare for my first hackathon?",
    description:
      "I’m joining my first 24-hour hackathon next month. What should I plan beforehand, and how do teams decide what is realistic to build?",
    tags: ["Hackathon", "Teamwork", "Beginner", "Semester 5"],
    comments: [],
  },
  {
    id: "demo-coding-competition",
    type: "Opportunity",
    author: "Student Innovation Cell",
    department: "Campus-wide",
    minutesAgo: 390,
    title: "Sharing an upcoming student coding competition",
    description:
      "A student coding competition is coming up soon. Share this with classmates who enjoy solving problems, building prototypes, or learning with a team.",
    tags: ["Competition", "Coding", "Open to all departments"],
    status: "Open",
    eventName: "Student Coding Competition",
    deadline: "Registration deadline to be confirmed",
  },
]

const filters: FilterType[] = [
  "All Posts",
  "Team Recruitment",
  "Material Request",
  "Project Collaboration",
  "Technical Question",
  "Opportunity",
]

const quickActions: {
  label: string
  type: PostType
  description: string
  icon: typeof Users
}[] = [
  {
    label: "Find Teammates",
    type: "Team Recruitment",
    description: "Build your project team",
    icon: Users,
  },
  {
    label: "Request Materials",
    type: "Material Request",
    description: "Ask for notes or resources",
    icon: FileText,
  },
  {
    label: "Share an Idea",
    type: "Project Collaboration",
    description: "Find project collaborators",
    icon: Lightbulb,
  },
  {
    label: "Opportunities",
    type: "Opportunity",
    description: "Share an event or opening",
    icon: Sparkles,
  },
]

const postIcons: Record<PostType, typeof Users> = {
  "Team Recruitment": Users,
  "Material Request": FileText,
  "Project Collaboration": Lightbulb,
  "Technical Question": CircleHelp,
  Opportunity: Sparkles,
}

const departmentOptions = [
  "CSE",
  "ECE",
  "EEE",
  "IT",
  "MECH",
  "CIVIL",
  "Other",
]

function postedTime(minutes: number) {
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

function categoryFilterLabel(type: FilterType) {
  if (type === "All Posts") return type
  if (type === "Material Request") return "Material Requests"
  if (type === "Project Collaboration") return "Project Ideas"
  if (type === "Technical Question") return "Technical Questions"
  if (type === "Team Recruitment") return type
  return "Opportunities"
}

function emptyPost(type: PostType): FormValues {
  return { ...defaultForm, type }
}

export default function CommunityPage() {
  const [posts, setPosts] = useState(seedPosts)
  const [activeFilter, setActiveFilter] = useState<FilterType>("All Posts")
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("All departments")
  const [skillFilter, setSkillFilter] = useState("All skills")
  const [sort, setSort] = useState<"Latest" | "Relevant">("Latest")
  const [formValues, setFormValues] = useState<FormValues | null>(null)
  const [formFeedback, setFormFeedback] = useState("")
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState("")
  const [savedPostIds, setSavedPostIds] = useState<string[]>([])
  const [expandedRequirements, setExpandedRequirements] = useState<string[]>([])

  const departments = useMemo(
    () => Array.from(new Set(posts.map((post) => post.department))).sort(),
    [posts],
  )
  const skills = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).sort(),
    [posts],
  )

  const visiblePosts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matching = posts.filter((post) => {
      const matchesFilter =
        activeFilter === "All Posts" || post.type === activeFilter
      const matchesDepartment =
        departmentFilter === "All departments" ||
        post.department === departmentFilter
      const matchesSkill =
        skillFilter === "All skills" || post.tags.includes(skillFilter)
      const searchable = [
        post.author,
        post.department,
        post.type,
        post.title,
        post.description,
        ...post.tags,
      ]
        .join(" ")
        .toLowerCase()

      return (
        matchesFilter &&
        matchesDepartment &&
        matchesSkill &&
        (!query || searchable.includes(query))
      )
    })

    return matching.sort((a, b) => {
      if (sort === "Latest") return a.minutesAgo - b.minutesAgo
      const relevanceScore = (post: CommunityPost) => {
        const queryScore = query
          ? [post.title, post.description, ...post.tags].reduce(
              (score, text) => score + (text.toLowerCase().includes(query) ? 1 : 0),
              0,
            )
          : 0
        const categoryScore =
          activeFilter !== "All Posts" && post.type === activeFilter ? 1 : 0
        return queryScore * 2 + categoryScore
      }
      return relevanceScore(b) - relevanceScore(a) || a.minutesAgo - b.minutesAgo
    })
  }, [activeFilter, departmentFilter, posts, search, skillFilter, sort])

  const openCreateForm = (type?: PostType) => {
    setFormValues(type ? emptyPost(type) : { ...defaultForm })
    setFormFeedback("")
  }

  const updateForm = (field: keyof FormValues, value: string) => {
    setFormValues((current) => (current ? { ...current, [field]: value } : current))
    setFormFeedback("")
  }

  const submitPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formValues?.type) {
      setFormFeedback("Choose a post type before publishing.")
      return
    }
    if (!formValues.title.trim()) {
      setFormFeedback("Add a title so students can understand your post.")
      return
    }
    if (!formValues.description.trim()) {
      setFormFeedback("Add a short description with the details students need.")
      return
    }
    if (!formValues.department.trim()) {
      setFormFeedback("Choose your department.")
      return
    }

    const tags = formValues.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    if (tags.length === 0) {
      setFormFeedback("Add at least one skill or topic tag, separated by commas.")
      return
    }

    if (
      formValues.type === "Team Recruitment" &&
      (!formValues.rolesNeeded.trim() ||
        !formValues.requiredSkills.trim() ||
        !formValues.deadline ||
        !formValues.teammateCount ||
        Number(formValues.teammateCount) < 1)
    ) {
      setFormFeedback(
        "Add the roles, number of teammates, required skills, and deadline for your recruitment post.",
      )
      return
    }

    if (
      formValues.type === "Material Request" &&
      (!formValues.subject.trim() ||
        !formValues.semester.trim() ||
        !formValues.resourceType)
    ) {
      setFormFeedback(
        "Add the subject, semester, and resource type for your request.",
      )
      return
    }

    if (
      formValues.type === "Opportunity" &&
      (!formValues.eventName.trim() || !formValues.deadline)
    ) {
      setFormFeedback("Add the event name and registration deadline.")
      return
    }

    let opportunityLink: string | undefined
    if (formValues.type === "Opportunity" && formValues.opportunityLink.trim()) {
      try {
        const parsed = new URL(formValues.opportunityLink.trim())
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          setFormFeedback("Use a valid http or https opportunity link.")
          return
        }
        opportunityLink = parsed.toString()
      } catch {
        setFormFeedback("Enter a valid opportunity URL or leave the link blank.")
        return
      }
    }

    const newPost: CommunityPost = {
      id: `local-${Date.now()}`,
      type: formValues.type,
      author: "You",
      department: formValues.department,
      minutesAgo: 0,
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      tags,
      isOwnPost: true,
      status:
        formValues.type === "Team Recruitment" ||
        formValues.type === "Material Request" ||
        formValues.type === "Project Collaboration" ||
        formValues.type === "Opportunity"
          ? "Open"
          : undefined,
      ...(formValues.semester.trim() && {
        semester: formValues.semester.trim(),
      }),
      ...(formValues.type === "Team Recruitment" && {
        rolesNeeded: formValues.rolesNeeded.trim(),
        teammateCount: Number(formValues.teammateCount),
        requiredSkills: formValues.requiredSkills.trim(),
        deadline: formValues.deadline,
      }),
      ...(formValues.type === "Material Request" && {
        subject: formValues.subject.trim(),
        resourceType: formValues.resourceType,
      }),
      ...(formValues.type === "Opportunity" && {
        eventName: formValues.eventName.trim(),
        deadline: formValues.deadline,
        opportunityLink,
      }),
    }

    setPosts((current) => [newPost, ...current])
    setActiveFilter("All Posts")
    setDepartmentFilter("All departments")
    setSkillFilter("All skills")
    setSearch("")
    setFormValues(null)
  }

  const toggleDetails = (postId: string) => {
    setExpandedRequirements((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    )
  }

  const toggleComments = (postId: string) => {
    setOpenCommentsFor((current) => (current === postId ? null : postId))
    setCommentDraft("")
  }

  const toggleSaved = (postId: string) => {
    setSavedPostIds((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    )
  }

  const submitComment = (
    event: FormEvent<HTMLFormElement>,
    postId: string,
  ) => {
    event.preventDefault()
    const text = commentDraft.trim()
    if (!text) return

    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post
        return {
          ...post,
          comments: [
            ...(post.comments ?? []),
            {
              id: `comment-${Date.now()}`,
              author: "You",
              text,
            },
          ],
        }
      }),
    )
    setCommentDraft("")
  }

  const updateOwnStatus = (post: CommunityPost) => {
    setPosts((current) =>
      current.map((item) => {
        if (item.id !== post.id) return item
        const nextStatus: PostStatus =
          item.type === "Material Request"
            ? item.status === "Resolved"
              ? "Open"
              : "Resolved"
            : item.status === "Team Filled"
              ? "Open"
              : "Team Filled"
        return { ...item, status: nextStatus }
      }),
    )
  }

  return (
    <section className="ngp-community" aria-labelledby="community-title">
      <header className="community-header">
        <div>
          <p className="ngp-eyebrow">STUDENT COLLABORATION</p>
          <h1 id="community-title">Community</h1>
          <p>Connect with students. Build something together.</p>
        </div>
        <button
          className="community-create-button"
          type="button"
          onClick={() => openCreateForm()}
        >
          <Plus size={17} />
          Create Post
        </button>
      </header>

      <p className="community-demo-notice">
        <InfoIcon />
        Demonstration content only. Posts and responses you create are visible
        only in this browser session; they are not shared with other students.
      </p>

      <section className="community-quick-actions" aria-label="Quick actions">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              className="community-quick-card"
              key={action.label}
              type="button"
              onClick={() => openCreateForm(action.type)}
            >
              <span className="community-quick-icon">
                <Icon size={20} />
              </span>
              <span className="community-quick-copy">
                <strong>{action.label}</strong>
                <span>{action.description}</span>
              </span>
              <ChevronDown className="community-quick-arrow" size={15} />
            </button>
          )
        })}
      </section>

      <div className="community-content-grid">
        <main className="community-feed-column">
          <section className="community-search-panel" aria-label="Find posts">
            <label className="community-search-box">
              <Search size={17} aria-hidden="true" />
              <input
                aria-label="Search ideas, skills, materials, opportunities, and departments"
                type="search"
                placeholder="Search ideas, skills, materials, opportunities..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label className="community-select-wrap">
              <span className="sr-only">Filter by department</span>
              <select
                aria-label="Filter by department"
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
              >
                <option>All departments</option>
                {departments.map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
            <label className="community-select-wrap">
              <span className="sr-only">Filter by skill or topic</span>
              <select
                aria-label="Filter by skill or topic"
                value={skillFilter}
                onChange={(event) => setSkillFilter(event.target.value)}
              >
                <option>All skills</option>
                {skills.map((skill) => (
                  <option key={skill}>{skill}</option>
                ))}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
          </section>

          <div className="community-feed-toolbar">
            <div className="community-feed-heading">
              <h2>Collaboration board</h2>
              <span>{visiblePosts.length} posts</span>
            </div>
            <label className="community-sort">
              <ArrowDownUp size={14} aria-hidden="true" />
              <span className="sr-only">Sort posts</span>
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as "Latest" | "Relevant")
                }
              >
                <option>Latest</option>
                <option>Relevant</option>
              </select>
              <ChevronDown size={13} aria-hidden="true" />
            </label>
          </div>

          <nav className="community-filters" aria-label="Filter community posts">
            {filters.map((filter) => (
              <button
                className={activeFilter === filter ? "active" : ""}
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter === filter}
              >
                {categoryFilterLabel(filter)}
              </button>
            ))}
          </nav>

          <div className="community-post-list" aria-live="polite">
            {visiblePosts.map((post) => {
              const Icon = postIcons[post.type]
              const isExpanded = expandedRequirements.includes(post.id)
              const canManageStatus =
                post.isOwnPost &&
                (post.type === "Team Recruitment" ||
                  post.type === "Material Request")

              return (
                <article className="community-post" key={post.id}>
                  <div className="community-post-top">
                    <div className="community-author">
                      <span className="community-avatar" aria-hidden="true">
                        {post.author
                          .split(" ")
                          .map((name) => name[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span className="community-author-copy">
                        <strong>{post.author}</strong>
                        <span>{post.department} · {postedTime(post.minutesAgo)}</span>
                      </span>
                    </div>
                    <span className={`community-category category-${post.type.toLowerCase().replace(/ /g, "-")}`}>
                      <Icon size={13} aria-hidden="true" />
                      {post.type}
                    </span>
                  </div>

                  <div className="community-post-body">
                    <div className="community-post-title-row">
                      <h3>{post.title}</h3>
                      {post.status && (
                        <span className={`community-status status-${post.status.toLowerCase().replace(/ /g, "-")}`}>
                          {post.status === "Open" && <span />}
                          {post.status}
                        </span>
                      )}
                    </div>
                    <p className="community-post-description">{post.description}</p>
                    <div className="community-tags">
                      {post.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSkillFilter(tag)}
                          aria-label={`Filter by ${tag}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {isExpanded && (
                      <div className="community-post-details">
                        {post.type === "Team Recruitment" && (
                          <>
                            <p><strong>Roles needed:</strong> {post.rolesNeeded || "Details to be discussed with the team."}</p>
                            <p><strong>Teammates:</strong> {post.teammateCount ?? 1}</p>
                            <p><strong>Required skills:</strong> {post.requiredSkills || post.tags.join(", ")}</p>
                            <p><strong>Deadline:</strong> {post.deadline || "To be discussed"}</p>
                          </>
                        )}
                        {post.type === "Material Request" && (
                          <>
                            <p><strong>Subject:</strong> {post.subject || post.title}</p>
                            <p><strong>Semester:</strong> {post.semester || "Not specified"}</p>
                            <p><strong>Resource type:</strong> {post.resourceType || "Notes or study guide"}</p>
                          </>
                        )}
                        {post.type === "Opportunity" && (
                          <>
                            <p><strong>Event:</strong> {post.eventName || post.title}</p>
                            <p><strong>Deadline:</strong> {post.deadline || "See event details"}</p>
                            {post.opportunityLink ? (
                              <a href={post.opportunityLink} target="_blank" rel="noopener noreferrer">
                                Open opportunity <ArrowUpRight size={13} />
                              </a>
                            ) : (
                              <p>No opportunity link was provided in this demo post.</p>
                            )}
                          </>
                        )}
                        {post.type === "Project Collaboration" && (
                          <p>
                            <strong>Collaboration:</strong> Use the comments to
                            discuss the idea. Replies are visible only in this
                            browser session.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="community-post-actions">
                    <button
                      type="button"
                      className={`community-icon-action ${openCommentsFor === post.id ? "active" : ""}`}
                      onClick={() => toggleComments(post.id)}
                      aria-expanded={openCommentsFor === post.id}
                      aria-label={`${openCommentsFor === post.id ? "Hide" : "Open"} comments for ${post.title}`}
                      title={openCommentsFor === post.id ? "Hide comments" : "Comments"}
                    >
                      <MessageSquareText size={15} />
                      <span>{post.comments?.length ?? 0}</span>
                    </button>
                    <button
                      type="button"
                      className={`community-icon-action community-save-action ${savedPostIds.includes(post.id) ? "active" : ""}`}
                      onClick={() => toggleSaved(post.id)}
                      aria-pressed={savedPostIds.includes(post.id)}
                      aria-label={`${savedPostIds.includes(post.id) ? "Remove saved post" : "Save post"}: ${post.title}`}
                      title={savedPostIds.includes(post.id) ? "Remove saved post" : "Save post"}
                    >
                      {savedPostIds.includes(post.id) ? (
                        <BookmarkCheck size={15} />
                      ) : (
                        <Bookmark size={15} />
                      )}
                    </button>
                    {post.type === "Team Recruitment" && (
                      <button type="button" className="community-action-secondary" onClick={() => toggleDetails(post.id)}>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        {isExpanded ? "Hide Requirements" : "View Requirements"}
                      </button>
                    )}
                    {post.type === "Opportunity" && (
                      <button type="button" className="community-action-secondary" onClick={() => toggleDetails(post.id)}>
                        {isExpanded ? <ChevronUp size={15} /> : <CalendarDays size={15} />}
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                    )}
                    {canManageStatus && post.type === "Material Request" && (
                      <button type="button" className="community-action-secondary" onClick={() => updateOwnStatus(post)}>
                        {post.status === "Resolved" ? "Reopen Request" : "Mark Resolved"}
                      </button>
                    )}
                    {canManageStatus && post.type === "Team Recruitment" && (
                      <button type="button" className="community-action-secondary" onClick={() => updateOwnStatus(post)}>
                        {post.status === "Team Filled" ? "Reopen Recruitment" : "Mark Team Filled"}
                      </button>
                    )}
                    <span className="community-local-only">Local prototype</span>
                  </div>

                  {openCommentsFor === post.id && (
                    <section
                      className="community-comments"
                      aria-label={`Comments for ${post.title}`}
                    >
                      <div className="community-comments-heading">
                        <div>
                          <h4>
                            {post.type === "Technical Question"
                              ? "Answers & discussion"
                              : post.type === "Material Request"
                                ? "Resource replies"
                                : "Comments"}
                          </h4>
                          <span>
                            {post.comments?.length ?? 0}{" "}
                            {(post.comments?.length ?? 0) === 1
                              ? "reply"
                              : "replies"}
                          </span>
                        </div>
                        <p>Only visible in this browser session</p>
                      </div>
                      {post.comments && post.comments.length > 0 ? (
                        <div className="community-comment-list">
                          {post.comments.map((comment) => (
                            <article
                              className="community-comment"
                              key={comment.id}
                            >
                              <span
                                className="community-comment-avatar"
                                aria-hidden="true"
                              >
                                {comment.author === "You" ? "Y" : "S"}
                              </span>
                              <div>
                                <strong>{comment.author}</strong>
                                <p>{comment.text}</p>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p className="community-no-comments">
                          No replies yet. Add the first helpful comment.
                        </p>
                      )}
                      <form
                        className="community-comment-form"
                        onSubmit={(event) => submitComment(event, post.id)}
                      >
                        <label className="sr-only" htmlFor={`comment-${post.id}`}>
                          {post.type === "Technical Question"
                            ? "Write an answer"
                            : post.type === "Material Request"
                              ? "Share a resource"
                              : "Write a comment"}
                        </label>
                        <textarea
                          id={`comment-${post.id}`}
                          value={commentDraft}
                          onChange={(event) => setCommentDraft(event.target.value)}
                          rows={2}
                          maxLength={500}
                          required
                          placeholder={
                            post.type === "Technical Question"
                              ? "Share an answer or useful tip…"
                              : post.type === "Material Request"
                                ? "Share resource details or a link…"
                                : "Add a useful comment…"
                          }
                        />
                        <button
                          type="submit"
                          className="community-comment-submit"
                          disabled={!commentDraft.trim()}
                        >
                          <Send size={14} />
                          Post comment
                        </button>
                      </form>
                    </section>
                  )}
                </article>
              )
            })}
            {visiblePosts.length === 0 && (
              <div className="community-empty">
                <Filter size={23} />
                <h3>No matching posts</h3>
                <p>Try another search or clear one of your filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("")
                    setActiveFilter("All Posts")
                    setDepartmentFilter("All departments")
                    setSkillFilter("All skills")
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </main>

        <aside className="community-sidebar">
          <section className="community-side-card">
            <div className="community-side-title">
              <Sparkles size={17} />
              <h2>Ways to collaborate</h2>
            </div>
            <ul>
              <li><span>01</span><p>Find teammates across departments</p></li>
              <li><span>02</span><p>Share materials and practical knowledge</p></li>
              <li><span>03</span><p>Turn early ideas into projects</p></li>
              <li><span>04</span><p>Discover competitions and opportunities</p></li>
            </ul>
          </section>
          <section className="community-side-card community-guideline-card">
            <div className="community-side-title">
              <CircleHelp size={17} />
              <h2>Community guidelines</h2>
            </div>
            <p>Be specific about the skills, topics, and support you need. Keep collaboration respectful and focused on learning.</p>
            <button type="button" onClick={() => openCreateForm()}>
              Start a post <ArrowUpRight size={14} />
            </button>
          </section>
          <p className="community-demo-footnote">
            <Clock3 size={13} /> Sample content is illustrative and not live campus activity.
          </p>
        </aside>
      </div>

      {formValues && (
        <div className="community-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setFormValues(null)
        }}>
          <section
            className="community-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-form-title"
          >
            <header className="community-modal-header">
              <div>
                <p className="ngp-eyebrow">COMMUNITY BOARD</p>
                <h2 id="community-form-title">Create a post</h2>
                <p>Share a clear request, project, question, or opportunity.</p>
              </div>
              <button type="button" aria-label="Close form" className="community-modal-close" onClick={() => setFormValues(null)}>
                <X size={19} />
              </button>
            </header>
            <form className="community-post-form" onSubmit={submitPost}>
              <label className="community-form-field">
                <span>Post type <b>*</b></span>
                <select
                  value={formValues.type}
                  required
                  onChange={(event) => updateForm("type", event.target.value as PostType | "")}
                >
                  <option value="">Choose a category</option>
                  {filters.slice(1).map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="community-form-field">
                <span>Title <b>*</b></span>
                <input value={formValues.title} onChange={(event) => updateForm("title", event.target.value)} maxLength={100} required placeholder="Give your post a clear title" />
              </label>
              <label className="community-form-field">
                <span>Detailed description <b>*</b></span>
                <textarea value={formValues.description} onChange={(event) => updateForm("description", event.target.value)} rows={4} maxLength={1200} required placeholder="Explain what you need, what you are building, or what others should know." />
              </label>
              <div className="community-form-row">
                <label className="community-form-field">
                  <span>Department <b>*</b></span>
                  <select value={formValues.department} onChange={(event) => updateForm("department", event.target.value)} required>
                    <option value="">Select department</option>
                    {departmentOptions.map((department) => <option key={department}>{department}</option>)}
                  </select>
                </label>
                <label className="community-form-field">
                  <span>Semester{formValues.type === "Material Request" ? " *" : ""}</span>
                  <select value={formValues.semester} onChange={(event) => updateForm("semester", event.target.value)} required={formValues.type === "Material Request"}>
                    <option value="">Select semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester}>Semester {semester}</option>)}
                  </select>
                </label>
              </div>
              <label className="community-form-field">
                <span>Skills or topic tags <b>*</b></span>
                <input value={formValues.tags} onChange={(event) => updateForm("tags", event.target.value)} required placeholder="Separate tags with commas, e.g. React, UI/UX" />
                <small>These help other students find your post.</small>
              </label>

              {formValues.type === "Team Recruitment" && (
                <section className="community-specific-fields">
                  <h3><Users size={16} /> Team requirements</h3>
                  <label className="community-form-field">
                    <span>Roles needed <b>*</b></span>
                    <input value={formValues.rolesNeeded} onChange={(event) => updateForm("rolesNeeded", event.target.value)} required placeholder="e.g. Frontend developer, designer" />
                  </label>
                  <div className="community-form-row">
                    <label className="community-form-field">
                      <span>Number of teammates <b>*</b></span>
                      <input type="number" min={1} max={20} value={formValues.teammateCount} onChange={(event) => updateForm("teammateCount", event.target.value)} required placeholder="2" />
                    </label>
                    <label className="community-form-field">
                      <span>Deadline <b>*</b></span>
                      <input type="date" value={formValues.deadline} onChange={(event) => updateForm("deadline", event.target.value)} required />
                    </label>
                  </div>
                  <label className="community-form-field">
                    <span>Required skills <b>*</b></span>
                    <input value={formValues.requiredSkills} onChange={(event) => updateForm("requiredSkills", event.target.value)} required placeholder="e.g. React, Figma, prototyping" />
                  </label>
                </section>
              )}

              {formValues.type === "Material Request" && (
                <section className="community-specific-fields">
                  <h3><FileText size={16} /> Resource request</h3>
                  <label className="community-form-field">
                    <span>Subject <b>*</b></span>
                    <input value={formValues.subject} onChange={(event) => updateForm("subject", event.target.value)} required placeholder="e.g. Data Structures" />
                  </label>
                  <label className="community-form-field">
                    <span>Resource type <b>*</b></span>
                    <select value={formValues.resourceType} onChange={(event) => updateForm("resourceType", event.target.value)} required>
                      <option value="">Select resource type</option>
                      <option>Lecture notes</option>
                      <option>Study guide</option>
                      <option>Practice questions</option>
                      <option>Reference material</option>
                      <option>Other</option>
                    </select>
                  </label>
                </section>
              )}

              {formValues.type === "Opportunity" && (
                <section className="community-specific-fields">
                  <h3><CalendarDays size={16} /> Opportunity details</h3>
                  <label className="community-form-field">
                    <span>Event name <b>*</b></span>
                    <input value={formValues.eventName} onChange={(event) => updateForm("eventName", event.target.value)} required placeholder="Competition, hackathon, or event name" />
                  </label>
                  <div className="community-form-row">
                    <label className="community-form-field">
                      <span>Deadline <b>*</b></span>
                      <input type="date" value={formValues.deadline} onChange={(event) => updateForm("deadline", event.target.value)} required />
                    </label>
                    <label className="community-form-field">
                      <span>Relevant link</span>
                      <input type="url" value={formValues.opportunityLink} onChange={(event) => updateForm("opportunityLink", event.target.value)} placeholder="https://…" />
                    </label>
                  </div>
                </section>
              )}

              {formFeedback && <p className="community-form-feedback" role="alert">{formFeedback}</p>}
              <p className="community-form-notice">This post will only appear in this browser session. It will not be shared with student accounts.</p>
              <div className="community-form-actions">
                <button type="button" className="community-cancel-button" onClick={() => setFormValues(null)}>Cancel</button>
                <button type="submit" className="community-submit-button"><Send size={15} /> Publish Post</button>
              </div>
            </form>
          </section>
        </div>
      )}

    </section>
  )
}

function InfoIcon() {
  return (
    <span className="community-demo-info-icon" aria-hidden="true">
      <Sparkles size={14} />
    </span>
  )
}
