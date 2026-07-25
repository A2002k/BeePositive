import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
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

  const validateForm = () => {
    if (!token) {
      return "The password reset token is missing.";
    }

    if (!formData.password) {
      return "Please enter your new password.";
    }

    if (formData.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (
      !/[A-Za-z]/.test(formData.password) ||
      !/\d/.test(formData.password)
    ) {
      return "Password must contain at least one letter and one number.";
    }

    if (!formData.confirmPassword) {
      return "Please confirm your new password.";
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/auth/reset-password/${token}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            password: formData.password,
            confirmPassword:
              formData.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to reset your password."
        );
      }

      setSuccess(
        data.message ||
          "Your password was updated successfully."
      );

      setFormData({
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Password updated successfully. You can now sign in.",
          },
        });
      }, 2000);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to reset your password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Secure password reset"
      title="Create a new password."
      description="Choose a secure password for your BeePositive account. The reset link can only be used once."
    >
      <div className="auth-form-wrapper">
        <div className="auth-form-heading">
          <span>Reset Password</span>

          <h2>Choose a new password</h2>

          <p>
            Use at least 6 characters,
            including one letter and one
            number.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-field">
            <label htmlFor="reset-password">
              New password
            </label>

            <div className="auth-input-wrapper">
              <LockKeyhole size={19} />

              <input
                id="reset-password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter a new password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="auth-password-button"
                onClick={() =>
                  setShowPassword(
                    (currentValue) =>
                      !currentValue
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

          <div className="auth-field">
            <label htmlFor="reset-confirm-password">
              Confirm new password
            </label>

            <div className="auth-input-wrapper">
              <LockKeyhole size={19} />

              <input
                id="reset-confirm-password"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  formData.confirmPassword
                }
                onChange={handleChange}
                placeholder="Confirm your new password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="auth-password-button"
                onClick={() =>
                  setShowConfirmPassword(
                    (currentValue) =>
                      !currentValue
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
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

          {success && (
            <div className="auth-success">
              {success}
              <br />
              Redirecting to login...
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={
              submitting || Boolean(success)
            }
          >
            {submitting ? (
              <>
                <span className="auth-spinner" />
                Updating password...
              </>
            ) : (
              <>
                Reset Password
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
      </div>
    </AuthLayout>
  );
}

export default ResetPassword;