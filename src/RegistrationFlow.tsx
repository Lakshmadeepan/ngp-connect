import { FormEvent, ReactNode, useState } from "react";
import "./registration.css";

type Stage = 1 | 2 | 3 | 4;
type IconName =
  | "user"
  | "email"
  | "lock"
  | "instagram"
  | "github"
  | "linkedin";

type AccountDetails = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type PersonalDetails = {
  department: string;
  semester: string;
  year: string;
};

type SocialProfiles = {
  instagram: string;
  github: string;
  linkedin: string;
};

const steps = ["Account Details", "Personal Details", "Social Profiles"];

function Brand() {
  return (
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
  );
}

function Icon({ name }: { name: IconName }) {
  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className="icon-fill" cx="17.3" cy="6.8" r="1" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg className="brand-icon github-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.7a9.5 9.5 0 0 0-3 18.52c.47.09.65-.2.65-.45v-1.86c-2.65.58-3.2-1.12-3.2-1.12-.44-1.1-1.06-1.4-1.06-1.4-.87-.59.07-.58.07-.58.96.07 1.47.99 1.47.99.85 1.46 2.24 1.04 2.79.8.08-.62.33-1.04.6-1.28-2.11-.24-4.34-1.06-4.34-4.7 0-1.04.37-1.89.98-2.55-.1-.24-.43-1.21.09-2.52 0 0 .8-.26 2.61.97A9.08 9.08 0 0 1 12 7.2c.81 0 1.62.11 2.38.32 1.81-1.23 2.6-.97 2.6-.97.53 1.31.2 2.28.1 2.52.61.66.98 1.51.98 2.55 0 3.65-2.23 4.45-4.35 4.69.34.3.65.87.65 1.76v2.7c0 .25.17.54.65.45A9.5 9.5 0 0 0 12 2.7Z" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg className="brand-icon linkedin-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2.5" />
        <path className="brand-cutout" d="M7 9.7h2.2V17H7V9.7Zm1.1-3.6a1.28 1.28 0 1 1 0 2.56 1.28 1.28 0 0 1 0-2.56Zm2.8 3.6H13v1c.47-.72 1.25-1.24 2.5-1.24 2.05 0 2.75 1.34 2.75 3.4V17H16v-3.65c0-1-.2-1.9-1.4-1.9-1.22 0-1.45.95-1.45 1.84V17H10.9V9.7Z" />
      </svg>
    );
  }

  const paths: Record<Exclude<IconName, "instagram" | "github" | "linkedin">, ReactNode> = {
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 20c.75-4 3.25-6 7.5-6s6.75 2 7.5 6" />
      </>
    ),
    email: (
      <>
        <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.3-5 9-5 9 5 9 5-3.3 5-9 5-9-5-9-5Z" />
      <circle cx="12" cy="12" r="2.5" />
      {!visible && <path d="m4 4 16 16" />}
    </svg>
  );
}

function Progress({
  stage,
  completed,
}: {
  stage: Stage;
  completed: Set<Stage>;
}) {
  return (
    <ol className="progress" aria-label={`Registration step ${stage} of 3`}>
      {steps.map((label, index) => {
        const step = (index + 1) as Stage;
        const done = completed.has(step);
        return (
          <li
            className={`${step === stage ? "active" : ""} ${done ? "complete" : ""}`}
            key={label}
            aria-current={step === stage ? "step" : undefined}
          >
            <div className="step-row">
              <span className="step-line" />
              <span className="step-dot">{done ? "✓" : step}</span>
              <span className="step-line" />
            </div>
            <span className="step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

type FieldProps = {
  id: string;
  label: string;
  placeholder: string;
  icon: IconName;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "text" | "email" | "password" | "url";
  invalid?: boolean;
};

function Field({
  id,
  label,
  placeholder,
  icon,
  value,
  onChange,
  required = false,
  type = "text",
  invalid = false,
}: FieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className={`input-wrap ${invalid ? "invalid" : ""}`}>
        <Icon name={icon} />
        <input
          id={id}
          value={value}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
          aria-invalid={invalid}
          required={required}
        />
        {isPassword && (
          <button
            className="eye-button"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon visible={showPassword} />
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  placeholder,
  options,
  onChange,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
  invalid: boolean;
}) {
  return (
    <div className="field select-field">
      <label htmlFor={id}>
        {label}
        <span className="required">*</span>
      </label>
      <div className={`input-wrap ${invalid ? "invalid" : ""}`}>
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          required
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
        <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 9.5 5 5 5-5" />
        </svg>
      </div>
    </div>
  );
}

function FooterLink({ onSignIn }: { onSignIn: () => void }) {
  return (
    <p className="account-link">
      Already have an account?{" "}
      <a
        href="#sign-in"
        onClick={(event) => {
          event.preventDefault();
          onSignIn();
        }}
      >
        Sign In
      </a>
    </p>
  );
}

function RegistrationFlow({ onSignIn }: { onSignIn: () => void }) {
  const [stage, setStage] = useState<Stage>(1);
  const [completed, setCompleted] = useState<Set<Stage>>(new Set());
  const [attempted, setAttempted] = useState(false);
  const [account, setAccount] = useState<AccountDetails>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [personal, setPersonal] = useState<PersonalDetails>({
    department: "",
    semester: "",
    year: "",
  });
  const [socials, setSocials] = useState<SocialProfiles>({
    instagram: "",
    github: "",
    linkedin: "",
  });

  const accountValid =
    account.username.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email) &&
    account.password.length >= 6 &&
    account.password === account.confirmPassword;
  const personalValid = Boolean(
    personal.department && personal.semester && personal.year,
  );

  const updateAccount = (key: keyof AccountDetails, value: string) =>
    setAccount((current) => ({ ...current, [key]: value }));
  const updatePersonal = (key: keyof PersonalDetails, value: string) =>
    setPersonal((current) => ({ ...current, [key]: value }));
  const updateSocial = (key: keyof SocialProfiles, value: string) =>
    setSocials((current) => ({ ...current, [key]: value }));

  const continueFromAccount = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (!accountValid) return;
    setCompleted((current) => new Set([...current, 1]));
    setAttempted(false);
    setStage(2);
  };


const continueFromPersonal = (event: FormEvent) => {
  event.preventDefault();
  setAttempted(true);
  if (!personalValid) return;

  setCompleted((current) => new Set([...current, 1, 2]));
  setAttempted(false);
  setStage(3);
};

const completeRegistration = (event: FormEvent) => {
  event.preventDefault();

  setCompleted((current) => new Set([...current, 1, 2, 3]));
  setAttempted(false);
  setStage(4);
};

  return (
    <main className="page registration-view">
      <section className="registration-card" aria-label="NGP Connect registration">
        <div className="graduation-banner">
          <img
            src="/assets/ngp-login-reference.png"
            alt="Graduate in a cap and gown adjusting her mortarboard"
          />
        </div>
        <Brand />
        {stage !== 4 && (
  <Progress stage={stage} completed={completed} />
)}

        {stage === 1 && (
          <>
            <header className="form-heading">
              <h1>Create your account</h1>
              <p>Start by setting up your NGP Connect account.</p>
            </header>
            <form onSubmit={continueFromAccount} noValidate>
              <Field
                id="username"
                label="Username"
                placeholder="Enter your username"
                icon="user"
                value={account.username}
                onChange={(value) => updateAccount("username", value)}
                invalid={attempted && !account.username.trim()}
                required
              />
              <Field
                id="email"
                label="College Email"
                placeholder="Enter your college email"
                icon="email"
                type="email"
                value={account.email}
                onChange={(value) => updateAccount("email", value)}
                invalid={attempted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)}
                required
              />
              <Field
                id="password"
                label="Create Password"
                placeholder="Create a password"
                icon="lock"
                type="password"
                value={account.password}
                onChange={(value) => updateAccount("password", value)}
                invalid={attempted && account.password.length < 6}
                required
              />
              <Field
                id="confirm-password"
                label="Confirm Password"
                placeholder="Confirm your password"
                icon="lock"
                type="password"
                value={account.confirmPassword}
                onChange={(value) => updateAccount("confirmPassword", value)}
                invalid={
                  attempted &&
                  (!account.confirmPassword ||
                    account.confirmPassword !== account.password)
                }
                required
              />
              <button className="primary-button" type="submit">
                Continue
              </button>
            </form>
            <FooterLink onSignIn={onSignIn} />
          </>
        )}

        {stage === 2 && (
          <>
            <header className="form-heading">
              <h1>Personal details</h1>
              <p>Tell us about your academic information.</p>
            </header>
            <form onSubmit={continueFromPersonal} noValidate>
              <SelectField
                id="department"
                label="Department"
                value={personal.department}
                placeholder="Select your department"
                options={[
                  "Computer Science",
                  "Information Technology",
                  "Electronics & Communication",
                  "Mechanical Engineering",
                  "Civil Engineering",
                  "Biomedical Engineering",
                ]}
                onChange={(value) => updatePersonal("department", value)}
                invalid={attempted && !personal.department}
              />
              <SelectField
                id="semester"
                label="Semester"
                value={personal.semester}
                placeholder="Select your semester"
                options={["1", "2", "3", "4", "5", "6", "7", "8"]}
                onChange={(value) => updatePersonal("semester", value)}
                invalid={attempted && !personal.semester}
              />
              <SelectField
                id="year"
                label="Year"
                value={personal.year}
                placeholder="Select your year"
                options={["1", "2", "3", "4"]}
                onChange={(value) => updatePersonal("year", value)}
                invalid={attempted && !personal.year}
              />
              <div className="button-row">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setAttempted(false);
                    setStage(1);
                  }}
                >
                  Back
                </button>
                <button className="primary-button" type="submit">
                  Continue
                </button>
              </div>
            </form>
            <FooterLink onSignIn={onSignIn} />
          </>
        )}

        {stage === 3 && (
          <>
            <header className="form-heading">
              <h1>Social profiles</h1>
              <p>Connect your profiles with your campus community.</p>
            </header>
            <form onSubmit={completeRegistration}>
              <Field
                id="instagram"
                label="Instagram ID"
                placeholder="Enter your Instagram ID"
                icon="instagram"
                value={socials.instagram}
                onChange={(value) => updateSocial("instagram", value)}
              />
              <Field
                id="github"
                label="GitHub Link"
                placeholder="Paste your GitHub profile URL"
                icon="github"
                type="url"
                value={socials.github}
                onChange={(value) => updateSocial("github", value)}
              />
              <Field
                id="linkedin"
                label="LinkedIn Profile Link"
                placeholder="Paste your LinkedIn profile URL"
                icon="linkedin"
                type="url"
                value={socials.linkedin}
                onChange={(value) => updateSocial("linkedin", value)}
              />
              <div className="button-row">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setStage(2)}
                >
                  Back
                </button>
                <button className="primary-button" type="submit">
                  Create Account
                </button>
              </div>
            </form>
            <FooterLink onSignIn={onSignIn} />
          </>
        )}
        
        {stage === 4 && (
          <div className="success-screen">
            <div className="success-icon">
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  d="M19 32 L28 41 L46 23"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1>Account Created Successfully!</h1>

            <p className="success-description">
              Welcome to NGP Connect.
              Your campus community is waiting for you.
            </p>

            <p className="success-tagline">
              Learn. Connect. Participate.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={onSignIn}
            >
              Continue to Sign In
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default RegistrationFlow;
