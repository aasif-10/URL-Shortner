import "../style/Auth.css";
import {
  IconUser,
  IconMail,
  IconLock,
  IconEye,
  IconEyeClosed,
  IconArrow,
} from "../components/icons/Icons";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { authIsLoading, handleRegister } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passVisible, setPassVisible] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister(name, email, password);
    navigate("/");
  };

  return (
    <div className="auth-page">
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="auth-nav">
        <a href="/" className="auth-logo">
          <span className="auth-logo-dot" />
          <span className="auth-logo-text">Snip</span>
        </a>
        <div className="auth-nav-actions">
          <a href="/auth/login" className="auth-btn-ghost">
            Sign in
          </a>
        </div>
      </nav>

      {/* ── Center ──────────────────────────────────────── */}
      <div className="auth-center">
        {/* Eyebrow */}
        <p className="auth-eyebrow">
          <span className="auth-eyebrow-line" />
          Get started
          <span className="auth-eyebrow-line" />
        </p>

        {/* Heading */}
        <h1 className="auth-heading">
          Create your <span>account.</span>
        </h1>
        <p className="auth-sub">
          Join Snip and start shortening links in seconds.
        </p>

        {/* Form Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            {/* Full name */}
            <div className="auth-field">
              <label htmlFor="register-full-name" className="auth-label">
                Full name
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <IconUser />
                </span>
                <input
                  id="register-full-name"
                  className="auth-input"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  spellCheck={false}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="register-email" className="auth-label">
                Email
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <IconMail />
                </span>
                <input
                  id="register-email"
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="register-password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <IconLock />
                </span>
                <input
                  id="register-password"
                  className="auth-input"
                  type={passVisible ? "password" : "text"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={() => {
                    setPassVisible((prev) => !prev);
                  }}
                  type="button"
                  className="auth-pw-toggle"
                  title="Toggle visibility"
                >
                  {passVisible ? <IconEye /> : <IconEyeClosed />}
                </button>
              </div>
            </div>

            <div className="auth-divider" />

            {/* Submit */}
            <button
              id="register-btn"
              type="submit"
              className="auth-btn-primary"
              disabled={authIsLoading}
            >
              {authIsLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Create account <IconArrow />
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="auth-terms">
            By creating an account you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>

        {/* Switch */}
        <p className="auth-switch">
          Already have an account? <a href="/auth/login">Sign in</a>
        </p>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="auth-footer">
        <span className="auth-footer-text">
          © 2026 Snip — All rights reserved
        </span>
        <div className="auth-footer-links">
          <a href="#" className="auth-footer-link">
            Privacy
          </a>
          <a href="#" className="auth-footer-link">
            Terms
          </a>
          <a href="#" className="auth-footer-link">
            API
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Register;
