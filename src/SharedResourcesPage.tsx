import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  BookOpen,
  Download,
  FileArchive,
  FileText,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  Search,
  Upload,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import "./SharedResourcesPage.css"

const categories = [
  { name: "Lecture Notes", icon: BookOpen },
  { name: "Lab Manuals", icon: FlaskConical },
  { name: "Previous Question Papers", icon: FileText },
  { name: "Assignments", icon: FileArchive },
  { name: "Reference Materials", icon: GraduationCap },
] as const

type ResourceCategory = (typeof categories)[number]["name"]

type Resource = {
  id: string
  title: string
  fileName: string
  fileType: string
  category: ResourceCategory
  subject: string
  department: string
  semester: string
  uploader: string
  uploadedAt: string
  fileUrl: string
  file: File
}

const allowedExtensions = new Set([
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "txt",
  "jpg",
  "jpeg",
  "png",
])
const maxFileSize = 20 * 1024 * 1024

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? ""
}

function formatFileType(file: File) {
  const extension = getExtension(file.name)
  return extension ? extension.toUpperCase() : "FILE"
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export default function SharedResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedCategory, setSelectedCategory] =
    useState<ResourceCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<ResourceCategory | "">("")
  const [subject, setSubject] = useState("")
  const [department, setDepartment] = useState("")
  const [semester, setSemester] = useState("")
  const [formError, setFormError] = useState("")
  const [sessionNotice, setSessionNotice] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlsRef = useRef(new Set<string>())

  useEffect(
    () => () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current.clear()
    },
    [],
  )

  const filteredResources = resources.filter((resource) => {
    const matchesCategory =
      selectedCategory === null || resource.category === selectedCategory
    const query = searchQuery.trim().toLowerCase()
    const matchesQuery =
      !query ||
      [
        resource.title,
        resource.fileType,
        resource.category,
        resource.subject,
        resource.department,
        resource.semester,
        resource.uploader,
      ].some((value) => value.toLowerCase().includes(query))

    return matchesCategory && matchesQuery
  })

  const selectFile = (file: File | null) => {
    setSelectedFile(file)
    setFormError("")

    if (file) {
      setTitle(file.name.replace(/\.[^.]+$/, ""))
    }
  }

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")

    if (!selectedFile) {
      setFormError("Choose a file to add.")
      return
    }

    if (!allowedExtensions.has(getExtension(selectedFile.name))) {
      setFormError(
        "Choose a PDF, Word document, PowerPoint, text file, or image.",
      )
      return
    }

    if (selectedFile.size > maxFileSize) {
      setFormError("The selected file must be 20 MB or smaller.")
      return
    }

    if (!title.trim() || !category) {
      setFormError("Enter a resource title and choose a category.")
      return
    }

    const fileUrl = URL.createObjectURL(selectedFile)
    objectUrlsRef.current.add(fileUrl)

    const resource: Resource = {
      id: `${Date.now()}-${selectedFile.name}`,
      title: title.trim(),
      fileName: selectedFile.name,
      fileType: formatFileType(selectedFile),
      category,
      subject: subject.trim(),
      department: department.trim(),
      semester: semester.trim(),
      uploader: "Student",
      uploadedAt: new Date().toISOString(),
      fileUrl,
      file: selectedFile,
    }

    setResources((current) => [resource, ...current])
    setSelectedCategory(null)
    setSearchQuery("")
    setSessionNotice(
      "Added for this browser session only. This file has not been uploaded to a shared library.",
    )
    setUploadOpen(false)
    setSelectedFile(null)
    setTitle("")
    setCategory("")
    setSubject("")
    setDepartment("")
    setSemester("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <section className="shared-resources-page">
      <header className="shared-resources-heading">
        <div>
          <p className="ngp-eyebrow">LEARN & SHARE</p>
          <h1>Shared Resources</h1>
          <p>
            Discover and share learning materials with your campus community.
          </p>
        </div>
        <button
          className="shared-upload-button"
          aria-expanded={uploadOpen}
          aria-controls="shared-resource-upload"
          onClick={() => {
            setUploadOpen((open) => !open)
            setFormError("")
          }}
          type="button"
        >
          {uploadOpen ? <X size={17} /> : <Upload size={17} />}
          {uploadOpen ? "Close form" : "Upload Resource"}
        </button>
      </header>

      <div className="shared-resource-notice" role="note">
        <FolderOpen size={17} aria-hidden="true" />
        <p>
          Resource sharing is not connected to a backend. Files you add are
          available only in this browser session and are not shared or saved
          permanently.
        </p>
      </div>

      {uploadOpen && (
        <section
          className="shared-upload-panel"
          id="shared-resource-upload"
          aria-labelledby="shared-upload-title"
        >
          <div className="shared-upload-panel-heading">
            <div>
              <h2 id="shared-upload-title">Add a resource for this session</h2>
              <p>
                Select a local file and add optional details. Nothing is sent to
                a server.
              </p>
            </div>
          </div>
          <form className="shared-upload-form" onSubmit={handleUpload}>
            <label className="shared-file-field" htmlFor="shared-resource-file">
              <span>Resource file</span>
              <input
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                id="shared-resource-file"
                onChange={(event) =>
                  selectFile(event.currentTarget.files?.[0] ?? null)
                }
                ref={fileInputRef}
                required
                type="file"
              />
              <small>PDF, Word, PowerPoint, text, or image · up to 20 MB</small>
            </label>
            <label htmlFor="shared-resource-title">
              Resource title
              <input
                autoComplete="off"
                id="shared-resource-title"
                maxLength={120}
                onChange={(event) => setTitle(event.target.value)}
                required
                value={title}
              />
            </label>
            <label htmlFor="shared-resource-category">
              Category
              <select
                id="shared-resource-category"
                onChange={(event) =>
                  setCategory(event.target.value as ResourceCategory | "")
                }
                required
                value={category}
              >
                <option value="">Choose a category</option>
                {categories.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="shared-resource-subject">
              Subject <span>(optional)</span>
              <input
                id="shared-resource-subject"
                maxLength={80}
                onChange={(event) => setSubject(event.target.value)}
                value={subject}
              />
            </label>
            <label htmlFor="shared-resource-department">
              Department <span>(optional)</span>
              <input
                id="shared-resource-department"
                maxLength={80}
                onChange={(event) => setDepartment(event.target.value)}
                value={department}
              />
            </label>
            <label htmlFor="shared-resource-semester">
              Semester <span>(optional)</span>
              <input
                id="shared-resource-semester"
                maxLength={40}
                onChange={(event) => setSemester(event.target.value)}
                value={semester}
              />
            </label>
            {formError && (
              <p className="shared-upload-error" role="alert">
                {formError}
              </p>
            )}
            <button className="shared-upload-submit" type="submit">
              Add to this session
            </button>
          </form>
        </section>
      )}

      {sessionNotice && (
        <p className="shared-session-notice" role="status">
          {sessionNotice}
        </p>
      )}

      <section className="shared-category-section" aria-labelledby="category-title">
        <div className="shared-section-heading">
          <div>
            <h2 id="category-title">Browse by category</h2>
            <p>Select a category to narrow the resource list.</p>
          </div>
          {selectedCategory && (
            <button
              className="shared-clear-filter"
              onClick={() => setSelectedCategory(null)}
              type="button"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="shared-category-grid">
          {categories.map(({ name, icon: Icon }) => {
            const count = resources.filter(
              (resource) => resource.category === name,
            ).length

            return (
              <button
                aria-pressed={selectedCategory === name}
                className={`shared-category-card ${
                  selectedCategory === name ? "is-selected" : ""
                }`}
                key={name}
                onClick={() =>
                  setSelectedCategory((current) =>
                    current === name ? null : name,
                  )
                }
                type="button"
              >
                <span className="shared-category-icon" aria-hidden="true">
                  <Icon size={19} />
                </span>
                <span className="shared-category-name">{name}</span>
                <span className="shared-category-count">
                  {count} {count === 1 ? "resource" : "resources"}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="shared-recent-section" aria-labelledby="recent-title">
        <div className="shared-section-heading shared-recent-heading">
          <div>
            <h2 id="recent-title">Recent Resources</h2>
            <p>
              {selectedCategory
                ? `Showing ${selectedCategory.toLowerCase()}`
                : "Learning materials available in this session."}
            </p>
          </div>
          <label className="shared-resource-search">
            <Search size={17} aria-hidden="true" />
            <span className="visually-hidden">Search study materials</span>
            <input
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search study materials..."
              type="search"
              value={searchQuery}
            />
          </label>
        </div>

        {filteredResources.length > 0 ? (
          <div className="shared-resource-list">
            {filteredResources.map((resource) => (
              <article className="shared-resource-card" key={resource.id}>
                <div className="shared-resource-file-icon" aria-hidden="true">
                  <FileText size={21} />
                </div>
                <div className="shared-resource-details">
                  <div className="shared-resource-title-row">
                    <h3>{resource.title}</h3>
                    <span className="shared-file-type">{resource.fileType}</span>
                  </div>
                  <p className="shared-resource-category">{resource.category}</p>
                  <dl className="shared-resource-metadata">
                    {resource.subject && (
                      <div>
                        <dt>Subject</dt>
                        <dd>{resource.subject}</dd>
                      </div>
                    )}
                    {resource.department && (
                      <div>
                        <dt>Department</dt>
                        <dd>{resource.department}</dd>
                      </div>
                    )}
                    {resource.semester && (
                      <div>
                        <dt>Semester</dt>
                        <dd>{resource.semester}</dd>
                      </div>
                    )}
                    <div>
                      <dt>Uploaded by</dt>
                      <dd>{resource.uploader}</dd>
                    </div>
                    <div>
                      <dt>Date</dt>
                      <dd>{formatDate(resource.uploadedAt)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="shared-resource-actions">
                  <a
                    href={resource.fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View
                  </a>
                  <a download={resource.fileName} href={resource.fileUrl}>
                    <Download size={15} aria-hidden="true" />
                    Download
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="shared-empty-state" role="status">
            <span className="shared-empty-icon" aria-hidden="true">
              <FolderOpen size={24} />
            </span>
            {resources.length === 0 ? (
              <>
                <h3>No shared resources yet</h3>
                <p>
                  The resource library is not connected to a backend. Add a
                  local file to preview it during this session.
                </p>
              </>
            ) : (
              <>
                <h3>No matching resources</h3>
                <p>Try another search term or clear the selected category.</p>
              </>
            )}
          </div>
        )}
      </section>
    </section>
  )
}
