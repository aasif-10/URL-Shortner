import "../style/UrlShort.css";
import {
  IconArrow,
  IconCheck,
  IconCopy,
  IconHistory,
  IconLink,
  IconOpen,
  IconPlus,
  IconTrash,
} from "../components/icons/Icons.jsx";
import { useUrl } from "../hooks/useUrl.js";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useNavigate } from "react-router-dom";

const UrlShort = () => {
  const {
    shortUrl,
    isLoading,
    handleCreateShortUrl,
    shortUrls,
    handleGetUrls,
    totalClicks,
    totalLinks,
    handleGetStats,
  } = useUrl();

  const { handleLogout } = useAuth();

  const [longUrl, setLongUrl] = useState(null);
  const [isCopied, setIsCopied] = useState(null);
  const [showAlias, setShowAlias] = useState(false);
  let navigate = useNavigate();
  const toast = null;

  const handleCopy = async (url) => {
    await navigator.clipboard.writeText(url);
    setIsCopied(url);
    setTimeout(() => setIsCopied(null), 2000);
  };

  useEffect(() => {
    async function getStats() {
      await handleGetStats();
    }

    getStats();
  }, [handleGetStats]);

  useEffect(() => {
    async function getUrls() {
      await handleGetUrls();
    }

    getUrls();
  }, [handleGetUrls]);

  return (
    <div className="us-page">
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="us-nav">
        <a href="/" className="us-logo">
          <span className="us-logo-dot" />
          <span className="us-logo-text">Snip</span>
        </a>
        <div className="us-nav-actions">
          <button
            onClick={async () => {
              await handleLogout();
              navigate("/auth/login");
            }}
            className="us-btn-ghost"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="us-hero">
        <p className="us-eyebrow">
          <span className="us-eyebrow-line" />
          URL Shortener
          <span className="us-eyebrow-line" />
        </p>
        <h1 className="us-heading">
          Long URLs, <span>made short.</span>
        </h1>
        <p className="us-sub">
          Paste any link below and get a clean, shareable short URL instantly.
        </p>
      </section>

      {/* ── Input Card ──────────────────────────────────── */}
      <div className="us-card">
        <div className="us-input-row">
          <div className="us-input-wrap">
            <span className="us-input-icon">
              <IconLink />
            </span>
            <input
              id="url-input"
              className="us-input"
              type="url"
              placeholder="https://your-very-long-url.com/goes/here"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => {
                setLongUrl(e.target.value);
              }}
            />
          </div>
          <button
            id="shorten-btn"
            className="us-btn-primary"
            disabled={isLoading}
            onClick={() => {
              handleCreateShortUrl(longUrl);
            }}
          >
            {isLoading ? (
              <span className="us-spinner" />
            ) : (
              <>
                Shorten <IconArrow />
              </>
            )}
          </button>
        </div>

        {/* custom alias toggle */}
        <div className="us-alias-toggle-wrap">
          <button
            onClick={() => {
              setShowAlias((prev) => !prev);
            }}
            className="us-alias-toggle"
          >
            <IconPlus />
            {showAlias ? "Hide" : "Custom alias"}
          </button>
        </div>

        {showAlias && (
          <div className="us-alias-row">
            <span className="us-alias-label">Alias</span>
            <span className="us-alias-prefix">lnk.to/</span>
            <input
              id="alias-input"
              className="us-alias-input"
              type="text"
              placeholder="my-custom-slug"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* ── Result Card ─────────────────────────────────── */}
      {shortUrl && (
        <div className="us-result">
          <div className="us-result-left">
            <span className="us-result-label">Your short link</span>
            <span className="us-result-url">{shortUrl}</span>
            <span className="us-result-original">{longUrl}</span>
          </div>
          <div className="us-result-actions">
            <button
              onClick={() => handleCopy(shortUrl)}
              id="copy-result-btn"
              className={`us-icon-btn${isCopied === shortUrl ? " copied" : ""}`}
              title="Copy"
            >
              {isCopied === shortUrl ? <IconCheck /> : <IconCopy />}
            </button>
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="us-icon-btn"
              title="Open"
            >
              <IconOpen />
            </a>
          </div>
        </div>
      )}

      {/* ── Stats Row ───────────────────────────────────── */}
      <div className="us-stats-row">
        <div className="us-stat-item">
          <span className="us-stat-value">{totalLinks.toLocaleString()}</span>
          <span className="us-stat-key">Total links</span>
        </div>
        <div className="us-stat-item">
          <span className="us-stat-value">{totalClicks.toLocaleString()}</span>
          <span className="us-stat-key">Total clicks</span>
        </div>
      </div>

      {/* ── History ─────────────────────────────────────── */}
      <section className="us-history">
        <div className="us-section-header">
          <span className="us-section-title">Recent links</span>
          <span className="us-section-count">{shortUrls.length}</span>
        </div>

        {shortUrls.length === 0 ? (
          <div className="us-empty">
            <span className="us-empty-icon">
              <IconHistory />
            </span>
            <p className="us-empty-text">
              No links yet.
              <br />
              Paste a URL above to create your first short link.
            </p>
          </div>
        ) : (
          <div className="us-table-wrap">
            <table className="us-table">
              <thead>
                <tr>
                  <th>Short URL</th>
                  <th>Original</th>
                  <th>Clicks</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shortUrls.map((item, i) => (
                  <tr key={item.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <td className="us-td-short">
                      <a href={item.shortUrl} target="_blank" rel="noreferrer">
                        {item.shortUrl}
                      </a>
                    </td>
                    <td className="us-td-original" title={item.longUrl}>
                      {item.longUrl}
                    </td>
                    <td className="us-td-clicks">
                      {item.clicks.toLocaleString()}
                    </td>
                    <td className="us-td-date">{item.createdAt}</td>
                    <td className="us-td-actions">
                      <div className="us-td-actions-wrap">
                        <button
                          onClick={() => handleCopy(item.shortUrl)}
                          className={`us-action-btn${isCopied === item.shortUrl ? " copied" : ""}`}
                          title="Copy"
                        >
                          {isCopied === item.shortUrl ? (
                            <IconCheck />
                          ) : (
                            <IconCopy />
                          )}
                        </button>
                        <a
                          href={item.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="us-action-btn"
                          title="Open"
                        >
                          <IconOpen />
                        </a>
                        <button className="us-action-btn danger" title="Delete">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="us-footer">
        <span className="us-footer-text">
          © 2026 Snip — All rights reserved
        </span>
        <div className="us-footer-links">
          <a href="#" className="us-footer-link">
            Privacy
          </a>
          <a href="#" className="us-footer-link">
            Terms
          </a>
          <a href="#" className="us-footer-link">
            API
          </a>
        </div>
      </footer>

      {/* ── Toast ───────────────────────────────────────── */}
      {toast && (
        <div className="us-toast">
          <span className="us-toast-dot" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default UrlShort;
