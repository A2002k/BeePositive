import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [resending, setResending] =
  useState(false);

const [verificationSuccess, setVerificationSuccess] =
  useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!formData.email.trim()) {
    setError("Please enter your email address.");
    return;
  }

  if (!formData.password) {
    setError("Please enter your password.");
    return;
  }

  try {
    setSubmitting(true);
    setError("");

    const loginResult = await login({
      email: formData.email.trim(),
      password: formData.password,
    });

    const destination =
      loginResult.user?.role === "admin"
        ? "/admin/dashboard"
        : location.state?.from || "/profile";

    navigate(destination, {
      replace: true,
    });
  } catch (requestError) {
    setError(
      requestError.message ||
        "Unable to log in."
    );
  } finally {
    setSubmitting(false);
  }
};

const handleResendVerification =
  async () => {
    const normalizedEmail =
      formData.email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Enter your email address first."
      );
      return;
    }

    try {
      setResending(true);
      setError("");
      setVerificationSuccess("");

      const response = await fetch(
        `${API_URL}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
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
            "Unable to resend verification email."
        );
      }

      setVerificationSuccess(
        data.message
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Return to your hive."
      description="Sign in to follow your orders, manage your profile and continue discovering natural BeePositive products."
    >
      <div className="auth-form-wrapper">
        <div className="auth-form-heading">
          <span>Customer Login</span>

          <h2>Welcome back</h2>

          <p>
            Enter your account details to continue.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-field">
            <label htmlFor="login-email">
              Email address
            </label>

            <div className="auth-input-wrapper">
              <Mail size={19} />

              <input
                id="login-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="login-password">
                Password
              </label>

              <Link
                to="/forgot-password"
                className="auth-text-button"
              >
                Forgot password?
              </Link>
            </div>

            <div className="auth-input-wrapper">
              <LockKeyhole size={19} />

              <input
                id="login-password"
                name="password"
                type={
                  showPassword ? "text" : "password"
                }
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="auth-password-button"
                onClick={() =>
                  setShowPassword(
                    (currentValue) => !currentValue
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {error
        .toLowerCase()
        .includes("verify") && (
        <button
          type="button"
          className="auth-text-button"
          onClick={handleResendVerification}
          disabled={resending}
        >
          {resending
            ? "Sending..."
            : "Resend verification email"}
        </button>
      )}

      {verificationSuccess && (
        <div className="auth-success">
          {verificationSuccess}
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
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={19} />
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span />
          <p>New to BeePositive?</p>
          <span />
        </div>

        <Link
          to="/register"
          className="auth-secondary-link"
        >
          Create your BeePositive account
        </Link>

        <Link to="/" className="auth-home-link">
          Return to home
        </Link>
      </div>
    </AuthLayout>
  );
}

export default Login;