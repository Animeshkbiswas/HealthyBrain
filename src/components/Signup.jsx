import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "../appwrite";
import "./Login.css";

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    account.get()
      .then(() => {
        navigate("/"); // Redirect to home if logged in
      })
      .catch(() => {
        // Not logged in, stay on signup page
      });
  }, [navigate]);

  const handleGoogleSignup = async () => {
    account.createOAuth2Session(
      "google",
      window.location.origin, // Success URL
      window.location.origin  // Failure URL
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Signup</h2>
        <button className="auth-btn" onClick={handleGoogleSignup}>Signup with Google</button>
      </div>
    </div>
  );
};

export default Signup; 