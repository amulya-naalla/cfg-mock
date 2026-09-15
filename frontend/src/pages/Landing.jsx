import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing">
      <h1>Visions India</h1>
      <p className="landing-mission">
        Tracking, localized content, and insight for every student we support.
      </p>
      <div className="landing-actions">
        <Link to="/educator" className="landing-button">
          Enter Educator View
        </Link>
        <Link to="/leadership" className="landing-button landing-button-primary">
          Enter Leadership View
        </Link>
      </div>
    </div>
  );
}
