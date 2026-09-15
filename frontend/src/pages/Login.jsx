import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Capitalize the first letter of the role
  const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate network delay for a realistic feel
    setTimeout(() => {
      setIsSubmitting(false);
      // Route based on role
      if (role === "educator") {
        navigate("/educator");
      } else if (role === "leadership") {
        navigate("/leadership");
      } else if (role === "parent") {
        navigate("/parent");
      } else {
        navigate("/");
      }
    }, 800);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-logo">
          <div className="login-logo-icon">VI</div>
          Visions India
        </Link>
        
        <h2>{formattedRole} Login</h2>
        <p>Sign in to access your dashboard.</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="login-input" 
              placeholder={`your.name@${role === 'parent' ? 'email.com' : 'visionsindia.org'}`} 
              required 
            />
          </div>
          
          <div className="login-input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="login-input" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <Link to="/" className="login-back">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
