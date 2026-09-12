import { useAuth } from "../../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  .ls-root {
    min-height: 100vh;
    background-color: #0c0c0c;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
    font-family: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
    animation: ls-fadeIn 0.35s ease both;
  }

  /* ── Logo ── */
  .ls-logo {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .ls-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #ffffff;
    animation: ls-pulse 1.6s ease-in-out infinite;
  }

  .ls-name {
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a0a0a0;
  }

  /* ── Track bar ── */
  .ls-track {
    width: 140px;
    height: 2px;
    background: #1a1a1a;
    border-radius: 99px;
    overflow: hidden;
    position: relative;
  }

  .ls-bar {
    position: absolute;
    inset: 0;
    width: 50%;
    background: linear-gradient(90deg, transparent, #3a3a3a, transparent);
    border-radius: 99px;
    animation: ls-slide 1.4s ease-in-out infinite;
  }

  /* ── Label ── */
  .ls-label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #404040;
  }

  /* ── Keyframes ── */
  @keyframes ls-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes ls-pulse {
    0%, 100% { transform: scale(1);    opacity: 1;   }
    50%       { transform: scale(1.55); opacity: 0.35; }
  }

  @keyframes ls-slide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(300%);  }
  }
`;

const LoadingScreen = () => (
    <>
        <style>{styles}</style>
        <div className="ls-root">
            <div className="ls-logo">
                <span className="ls-dot" />
                <span className="ls-name">Snip</span>
            </div>

            <div className="ls-track">
                <div className="ls-bar" />
            </div>

            <span className="ls-label">Loading</span>
        </div>
    </>
);

const Protected = () => {
    const { user, authIsLoading } = useAuth();

    if (authIsLoading) return <LoadingScreen />;
    if (!user) return <Navigate to="/auth/login" replace />;

    return <Outlet />;
};

export default Protected;
