import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

function normalizePhone(phone) {
  return String(phone || "")
    .trim()
    .replace(/[\s()-]/g, "");
}

function isValidLebanesePhone(phone) {
  const normalizedPhone =
    normalizePhone(phone);

  const localMobilePattern =
    /^(?:03\d{6}|7[01689]\d{6}|81\d{6})$/;

  const localLandlinePattern =
    /^0[1245689]\d{6}$/;

  const internationalPattern =
    /^(?:\+961|00961)(?:3\d{6}|7[01689]\d{6}|81\d{6}|[1245689]\d{6})$/;

  return (
    localMobilePattern.test(
      normalizedPhone
    ) ||
    localLandlinePattern.test(
      normalizedPhone
    ) ||
    internationalPattern.test(
      normalizedPhone
    )
  );
}

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
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

  const [error, setError] =
    useState("");

  const [phoneTouched, setPhoneTouched] =
    useState(false);

  const passwordChecks = useMemo(
  () => ({
    minimumLength: formData.password.length >= 8,
    containsLowercase: /[a-z]/.test(formData.password),
    containsUppercase: /[A-Z]/.test(formData.password),
    containsNumber: /\d/.test(formData.password),
  }),
  [formData.password]
);

  const normalizedPhone = useMemo(
    () => normalizePhone(formData.phone),
    [formData.phone]
  );

  const phoneError = useMemo(() => {
    if (!phoneTouched) {
      return "";
    }

    if (!normalizedPhone) {
      return "Phone number is required.";
    }

    if (
      !isValidLebanesePhone(
        normalizedPhone
      )
    ) {
      return "Please enter a valid Lebanese phone number.";
    }

    return "";
  }, [
    phoneTouched,
    normalizedPhone,
  ]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (name === "phone") {
      setPhoneTouched(true);
    }

    if (error) {
      setError("");
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!normalizedPhone) {
      return "Please enter your phone number.";
    }

    if (
      !isValidLebanesePhone(
        normalizedPhone
      )
    ) {
      return "Please enter a valid Lebanese phone number.";
    }

    if (
      formData.password.length < 8
    ) {
      return "Password must contain at least 8 characters.";
    }

    if (!passwordChecks.containsLowercase) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!passwordChecks.containsUppercase) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!passwordChecks.containsNumber) {
      return "Password must contain at least one number.";
    }
    if (
      formData.password !==
      formData.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setPhoneTouched(true);

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await register({
            name: formData.name.trim(),
            email: formData.email
              .trim()
              .toLowerCase(),
            phone: normalizedPhone,
            password: formData.password,
            confirmPassword:
              formData.confirmPassword,
          });

          navigate("/login", {
            replace: true,
            state: {
              message:
                "Account created. Please verify your email before logging in.",
            },
          });

    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to create your account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Join the hive"
      title="Create something naturally better."
      description="Create your BeePositive account to enjoy faster checkout, order tracking and a more personal shopping experience."
    >
      <div className="auth-form-wrapper auth-register-wrapper">
        <div className="auth-form-heading">
          <span>Create Account</span>

          <h2>Join BeePositive</h2>

          <p>
            Enter your details to create
            your account.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="auth-field">
            <label htmlFor="register-name">
              Full name
            </label>

            <div className="auth-input-wrapper">
              <UserRound size={19} />

              <input
                id="register-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Anthony Karam"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="auth-form-grid">
            <div className="auth-field">
              <label htmlFor="register-email">
                Email address
              </label>

              <div className="auth-input-wrapper">
                <Mail size={19} />

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-phone">
                Phone number
              </label>

              <div
                className={`auth-input-wrapper ${
                  phoneError
                    ? "auth-input-invalid"
                    : ""
                }`}
              >
                <Phone size={19} />

                <input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handlePhoneBlur}
                  placeholder="+961 70 123 456"
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={
                    Boolean(phoneError)
                  }
                  aria-describedby="register-phone-message"
                  required
                />
              </div>

              <div
                id="register-phone-message"
                className={`auth-field-message ${
                  phoneError
                    ? "error"
                    : normalizedPhone &&
                        isValidLebanesePhone(
                          normalizedPhone
                        )
                      ? "valid"
                      : ""
                }`}
              >
                {phoneError ? (
                  phoneError
                ) : normalizedPhone &&
                  isValidLebanesePhone(
                    normalizedPhone
                  ) ? (
                  <>
                    <Check size={14} />
                    Valid phone number
                  </>
                ) : (
                  "Example: 03 123 456 or +961 70 123 456"
                )}
              </div>
            </div>
          </div>

          <div className="auth-form-grid">
            <div className="auth-field">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="auth-input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="register-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
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
              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <div className="auth-input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="register-confirm-password"
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
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
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
          </div>

          {formData.password && (
            <div className="password-requirements">
              <div
                className={
                  passwordChecks.minimumLength
                    ? "password-check valid"
                    : "password-check"
                }
              >
                <Check size={14} />
                At least 8 characters
              </div>

              <div
                className={
                  passwordChecks.containsLowercase
                    ? "password-check valid"
                    : "password-check"
                }
              >
                <Check size={14} />
                Contains at least one lowercase letter
              </div>

               <div
                className={
                  passwordChecks.containsUppercase
                    ? "password-check valid"
                    : "password-check"
                }
              >
                <Check size={14} />
                Contains at least one uppercase letter
              </div>

              <div
                className={
                  passwordChecks.containsNumber
                    ? "password-check valid"
                    : "password-check"
                }
              >
                <Check size={14} />
                Contains a number
              </div>
            </div>
          )}

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
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={19} />
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span />
          <p>
            Already have an account?
          </p>
          <span />
        </div>

        <Link
          to="/login"
          className="auth-secondary-link"
        >
          Sign in to your account
        </Link>

        <Link
          to="/"
          className="auth-home-link"
        >
          Return to home
        </Link>
      </div>
    </AuthLayout>
  );
}

export default Register;