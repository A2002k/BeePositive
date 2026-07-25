import {
  ArrowLeft,
  ArrowRight,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/auth/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send the reset email."
        );
      }

      setSuccess(
        data.message ||
          "If an account exists with this email, a password reset link has been sent."
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to send the reset email."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Find your way back to the hive."
      description="Enter the email linked to your BeePositive account and we will send you a secure password reset link."
    >
      <div className="auth-form-wrapper">
        <div className="auth-form-heading">
          <span>Forgot Password</span>

          <h2>Reset your password</h2>

          <p>
            The reset link will expire after
            15 minutes.
          </p>
        </div>

        {success ? (
          <div className="auth-success">
            <h3>Check your email</h3>

            <p>{success}</p>

            <p>
              Check your inbox and spam folder
              for the BeePositive reset email.
            </p>

            <Link
              to="/login"
              className="auth-secondary-link"
            >
              <ArrowLeft size={18} />
              Return to login
            </Link>
          </div>
        ) : (
          <>
            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="auth-field">
                <label htmlFor="forgot-email">
                  Email address
                </label>

                <div className="auth-input-wrapper">
                  <Mail size={19} />

                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="auth-spinner" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>

            <Link
              to="/login"
              className="auth-home-link"
            >
              <ArrowLeft size={17} />
              Return to login
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;