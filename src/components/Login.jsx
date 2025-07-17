import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { account } from "../appwrite";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    account.get()
      .then(() => {
        navigate("/"); // Redirect to home if logged in
      })
      .catch(() => {
        // Not logged in, stay on login page
      });
  }, [navigate]);

  const handleGoogleLogin = async () => {
    account.createOAuth2Session(
      "google",
      window.location.origin, // Success URL
      window.location.origin  // Failure URL
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <div style={{ color: '#aab4e6', marginBottom: '1.2rem', fontSize: '1.05rem', textAlign: 'center' }}>
          Sign in to continue to your mental health companion
        </div>
        <button className="auth-btn" onClick={handleGoogleLogin}>Login with Google</button>
        <Link to="/signup" className="auth-link">Don't have an account? Sign up</Link>
      </div>
    </div>
  );
};

export default Login; 