import "../style/Auth.css";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeClosed,
  IconArrow,
  IconGithub,
  IconLinkedin,
  IconGlobe,
} from "../components/icons/Icons";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Component ──────────────────────────────────────────────── */
const Login = () => {
  const { authIsLoading, handleLogin, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passVisible, setPassVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(email, password);
      navigate("/");
    } catch (error) {
      showToast(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="auth-nav">
        <div className="nav-left">
          <a href="/" className="auth-logo">
            <span className="auth-logo-dot" />
            <span className="auth-logo-text">Snip</span>
          </a>
          <span className="nav-author-text">Built and maintained by Aasif Khan</span>
        </div>
        <div className="auth-nav-actions">
          <a href="https://github.com/aasif-10" target="_blank" rel="noreferrer" className="auth-icon-link" title="GitHub">
            <IconGithub />
          </a>
          <a href="https://www.linkedin.com/in/aasifkhan10/" target="_blank" rel="noreferrer" className="auth-icon-link" title="LinkedIn">
            <IconLinkedin />
          </a>
          <a href="#" target="_blank" rel="noreferrer" className="auth-icon-link" title="Portfolio">
            <IconGlobe />
          </a>
          <a href="/auth/register" className="auth-btn-ghost">
            Create account
          </a>
        </div>
      </nav>

      {/* ── Center ──────────────────────────────────────── */}
      <div className="auth-center">
        {/* Eyebrow */}
        <p className="auth-eyebrow">
          <span className="auth-eyebrow-line" />
          Welcome back
          <span className="auth-eyebrow-line" />
        </p>

        {/* Heading */}
        <h1 className="auth-heading">
          Sign in to <span>Snip.</span>
        </h1>
        <p className="auth-sub">
          Enter your credentials to access your short links and analytics.
        </p>

        {/* Form Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">
                Email
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <IconMail />
                </span>
                <input
                  id="login-email"
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
              <label htmlFor="login-password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <IconLock />
                </span>
                <input
                  id="login-password"
                  className="auth-input"
                  type={passVisible ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  title="Toggle visibility"
                  onClick={() => setPassVisible((prev) => !prev)}
                >
                  {passVisible ? <IconEyeClosed /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="auth-divider" />

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              className="auth-btn-primary"
              disabled={authIsLoading}
            >
              {authIsLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Sign in <IconArrow />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Switch */}
        <p className="auth-switch">
          Don&apos;t have an account? <a href="/auth/register">Create one</a>
        </p>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="auth-footer">
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

      {/* ── Toast ───────────────────────────────────────── */}
      {toast && (
        <div className="us-toast">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Login;
