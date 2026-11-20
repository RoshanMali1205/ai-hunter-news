import { Link } from "react-router-dom";
import { SOURCES } from "../data/sources";

const REPO_URL = "https://github.com/RoshanMali1205/ai-hunter-news";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="wordmark-monogram footer-monogram" aria-hidden="true">AH</span>
          <div>
            <p className="footer-name">AI Hunter-News</p>
            <p className="footer-tagline">
              The AI world, briefed for developers — from {SOURCES.length} trusted sources.
            </p>
          </div>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/topics">Topics</Link>
          <Link to="/repos">AI repos</Link>
          <Link to="/learn">Learn</Link>
          <Link to="/saved">Saved</Link>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>
          © {year} AI Hunter-News · Designed &amp; developed by{" "}
          <a className="footer-author" href={REPO_URL} target="_blank" rel="noopener noreferrer">Roshan Mali</a>
        </p>
        <p className="footer-note">Headlines and summaries link to their original publishers.</p>
      </div>
    </footer>
  );
}
