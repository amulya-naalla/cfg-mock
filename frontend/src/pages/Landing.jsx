import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="lm-page">
      {/* 1. Navbar */}
      <nav className="lm-navbar">
        <Link to="/" className="lm-logo">
          <div className="lm-logo-icon">VI</div>
          Visions India
        </Link>
        <div className="lm-nav-links">
          <a href="#" className="lm-nav-link">Our Mission</a>
          <a href="#" className="lm-nav-link">Impact</a>
          <a href="#" className="lm-nav-link">Districts</a>
        </div>
        <div className="lm-nav-actions">
          <div className="lm-nav-dropdown">
            <button className="lm-btn-solid">Access Portals ▾</button>
            <div className="lm-dropdown-content">
              <Link to="/student">Student Portal</Link>
              <Link to="/educator">Educator Portal</Link>
              <Link to="/leadership">Leadership Dashboard</Link>
              <Link to="/parent">Parent Portal</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="lm-hero">
        <div className="lm-hero-text">
          <span className="lm-hero-badge">✧ Over 600 active students</span>
          <h1 className="lm-serif">Empowering 650+ Students Across Tamil Nadu</h1>
          <p>
            Visions India delivers personalized, tech-enabled after-school education that closes learning gaps, nurtures curiosity, and provides robust health and digital literacy tools to regional children.
          </p>
        </div>
        <div className="lm-hero-img-wrap">
          <img src="/images/hero.jpg" alt="Students looking at tablet" />
        </div>
      </header>

      {/* 3. Core Mission Programs */}
      <section className="lm-section">
        <div className="lm-section-header">
          <span className="lm-hero-badge" style={{ color: "var(--lm-rust)" }}>WHAT WE DO</span>
          <h2 className="lm-serif">Core Mission Programs</h2>
          <p>We run structured after-school interventions focused on academic excellence, personal wellness, and community support.</p>
        </div>
        <div className="lm-grid-3">
          <div className="lm-mission-card">
            <div className="lm-mission-icon teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <h3 className="lm-serif">Personalized Learning</h3>
            <p>Tailor-made math and language curricula, powered by real-time mobile tracking and localized bilingual workflows.</p>
          </div>
          <div className="lm-mission-card">
            <div className="lm-mission-icon rust">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h3 className="lm-serif">Health Awareness</h3>
            <p>Comprehensive hygiene education, routine medical checks, and essential wellness guidelines built directly into regular sessions.</p>
          </div>
          <div className="lm-mission-card">
            <div className="lm-mission-icon pink">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className="lm-serif">Scholarship Program</h3>
            <p>Facilitated financial aid pipelines assisting high-performing regional students to ensure higher secondary education opportunities.</p>
          </div>
        </div>
      </section>

      {/* 4. Stats Banner */}
      <section className="lm-stats-banner">
        <div className="lm-stats-inner">
          <div className="lm-stat">
            <h3 className="lm-serif">650+</h3>
            <p>Active Students</p>
          </div>
          <div className="lm-stat">
            <h3 className="lm-serif">3</h3>
            <p>Tamil Nadu Districts</p>
          </div>
          <div className="lm-stat">
            <h3 className="lm-serif">45+</h3>
            <p>Certified Educators</p>
          </div>
          <div className="lm-stat">
            <h3 className="lm-serif">12</h3>
            <p>Specialized Programs</p>
          </div>
        </div>
      </section>

      {/* 5. How We Deliver Impact */}
      <section className="lm-section">
        <div className="lm-section-header">
          <span className="lm-hero-badge" style={{ color: "var(--lm-rust)" }}>SYSTEMATIC IMPLEMENTATION</span>
          <h2 className="lm-serif">How We Deliver Impact</h2>
        </div>
        <div className="lm-workflow">
          <div className="lm-step">
            <div className="lm-step-num lm-serif">01</div>
            <div className="lm-step-content">
              <h4 className="lm-serif">Track Students</h4>
              <p>Educators log offline assessment data on locally-safe devices through lightweight mobile interfaces.</p>
            </div>
          </div>
          <div className="lm-step">
            <div className="lm-step-num lm-serif">02</div>
            <div className="lm-step-content">
              <h4 className="lm-serif">Flag Learning Gaps</h4>
              <p>Our automated dashboard flags any children falling behind standard grade-level practices.</p>
            </div>
          </div>
          <div className="lm-step">
            <div className="lm-step-num lm-serif">03</div>
            <div className="lm-step-content">
              <h4 className="lm-serif">Deliver Localized Content</h4>
              <p>Educators pull bilingual learning video content and run demographic educational models.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonial */}
      <section className="lm-testimonial">
        <div className="lm-testimonial-inner">
          <div className="lm-testimonial-text">
            <p className="lm-quote lm-serif">
              "The real-time insights allow me to immediately identify when Arjun or Ravi struggles with basic multiplication, and pull bilingual guides before they lose confidence. We aren't just teaching; we are customizing care."
            </p>
            <div className="lm-author">
              <strong>Ananya Nayar</strong>
              <span>Lead Educator, Cluster A, Kanchipuram</span>
            </div>
          </div>
          <div className="lm-testimonial-img">
            <img src="/images/testimonial.jpg" alt="Inspiring educator" />
          </div>
        </div>
      </section>

      {/* 7. Districts We Serve */}
      <section className="lm-section">
        <span className="lm-hero-badge" style={{ color: "var(--lm-teal)" }}>OUR FOOTPRINT</span>
        <h2 className="lm-serif" style={{ fontSize: "2rem", color: "var(--lm-navy)", marginBottom: "1rem" }}>Districts We Serve</h2>
        <p style={{ color: "var(--ink-secondary)", maxWidth: "500px", marginBottom: "3rem" }}>
          Targeted operations in deep rural and urban fringes where supplementary learning makes the biggest difference.
        </p>
        <div className="lm-grid-3">
          <div className="lm-district-card">
            <div className="lm-district-header">
              <h3 className="lm-serif">Kanchipuram</h3>
              <span className="lm-district-badge">Primary</span>
            </div>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", lineHeight: "1.5" }}>Hub of active IT tech region running after-school programs managing 450+ children across 4 clusters. Sample is currently on mock data.</p>
          </div>
          <div className="lm-district-card">
            <div className="lm-district-header">
              <h3 className="lm-serif">Tiruvallur</h3>
              <span className="lm-district-badge">Primary</span>
            </div>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", lineHeight: "1.5" }}>Deep rural focus entirely ongoing math and life science partition offline health/water supply awareness digital literacy training.</p>
          </div>
          <div className="lm-district-card">
            <div className="lm-district-header">
              <h3 className="lm-serif">Chengalpattu</h3>
              <span className="lm-district-badge">Primary</span>
            </div>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", lineHeight: "1.5" }}>Newly opened facilities at local NGO serving movement modern outpost strengthening technology corridors.</p>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="lm-footer">
        <div className="lm-footer-inner">
          <div className="lm-footer-brand">
            <div className="lm-logo" style={{ color: "white" }}>
              <div className="lm-logo-icon">VI</div>
              Visions India
            </div>
            <p>Empowering a community of district after-school learning. Robust software local data, and sustainable modern support.</p>
          </div>
          <div className="lm-footer-links">
            <div className="lm-link-col">
              <h4>Programs</h4>
              <a href="#">Learning Tools</a>
              <a href="#">Health Checks</a>
              <a href="#">Scholarships</a>
            </div>
            <div className="lm-link-col">
              <h4>Contact</h4>
              <a href="#">info@visionsindia.org</a>
              <a href="#">+91 912 555 1234</a>
              <a href="#">Tamil Nadu, India</a>
            </div>
          </div>
        </div>
        <div className="lm-footer-bottom">
          <span>&copy; {new Date().getFullYear()} Visions India. All rights reserved. Mocked by Antigravity IDE.</span>
          <span>
            <a href="#" style={{ marginRight: "1rem", textDecoration: "none" }}>Privacy Policy</a>
            <a href="#" style={{ textDecoration: "none" }}>Terms of Use</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
