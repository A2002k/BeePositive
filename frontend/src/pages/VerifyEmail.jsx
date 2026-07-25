import {
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function VerifyEmail() {
  const { token } = useParams();

  const verificationStarted =
    useRef(false);

  const [loading, setLoading] =
    useState(true);

  const [success, setSuccess] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    async function verify() {
      try {
        const response = await fetch(
          `${API_URL}/auth/verify-email/${token}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Verification failed."
          );
        }

        setSuccess(true);
        setMessage(
          data.message ||
            "Your email address has been verified successfully."
        );
      } catch (error) {
        setSuccess(false);
        setMessage(
          error.message ||
            "Unable to verify email."
        );
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  return (
    <AuthLayout
      eyebrow="Email Verification"
      title="Verify your email"
      description="One moment while we verify your BeePositive account."
    >
      <div className="auth-form-wrapper">
        {loading ? (
          <>
            <span className="auth-spinner" />

            <h2>
              Verifying your email...
            </h2>
          </>
        ) : success ? (
          <>
            <CheckCircle
              size={70}
              color="#22c55e"
            />

            <h2>Email Verified!</h2>

            <p>{message}</p>

            <Link
              to="/login"
              className="auth-submit-button"
            >
              Continue to Login
            </Link>
          </>
        ) : (
          <>
            <XCircle
              size={70}
              color="#ef4444"
            />

            <h2>
              Verification Failed
            </h2>

            <p>{message}</p>

            <Link
              to="/login"
              className="auth-submit-button"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default VerifyEmail;