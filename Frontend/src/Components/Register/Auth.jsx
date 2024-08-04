import React from "react";
import { useLocation } from "react-router-dom";
import wellcarelogo from "../../Screenshot 2024-06-01 005512.png";
import "./Auth.css";
import Signin from "./Signin";
import Signup from "./Signup";

const Auth = () => {
  const location = useLocation();
  const isSignin = location.pathname === "/signin";

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-form-container">
          <div className="auth-form">
            <h1 className="auth-title">
              <img
                src={wellcarelogo}
                alt="Wellcare Logo"
                className="auth-logo"
              />
              <span style={{ color: "#0056b3" }}>Join Wellcare Community</span>
            </h1>
            <p className="auth-subtitle">
              Connect with Others, Share Stories, and Find Support
            </p>
            {isSignin ? <Signin /> : <Signup />}
          </div>
          <div className="auth-switch">
            {isSignin ? (
              <p style={{ color: "black" }}>
                Don't have an account? <a href="/signup">Sign up</a>
              </p>
            ) : (
              <p style={{ color: "#0056b3" }}>
                Already have an account? <a href="/signin">Sign in</a>
              </p>
            )}
          </div>
        </div>
        <div className="auth-welcome-container">
          <div className="auth-welcome-content">
            <h2>{isSignin ? "Welcome Back!" : "Welcome!"}</h2>
            <p>
              {isSignin
                ? "To keep connected with us, please log in with your personal info."
                : "Join our community and connect with others to share your journey."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
