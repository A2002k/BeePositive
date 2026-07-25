import {
  Hexagon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./Auth.css";

function AuthLayout({
  children,
  eyebrow,
  title,
  description,
}) {
  return (
    <main className="auth-page">
      <div className="auth-background-glow auth-glow-one" />
      <div className="auth-background-glow auth-glow-two" />

      <div className="auth-honeycomb auth-honeycomb-one">
        <Hexagon />
      </div>

      <div className="auth-honeycomb auth-honeycomb-two">
        <Hexagon />
      </div>

      <div className="auth-honeycomb auth-honeycomb-three">
        <Hexagon />
      </div>

      <div className="auth-honeycomb auth-honeycomb-four">
        <Hexagon />
      </div>

      <section className="auth-shell">
        <div className="auth-showcase">
          <div className="auth-showcase-content">
            <Link to="/" className="auth-brand">
              <span className="auth-brand-icon">
                <Hexagon size={26} />
              </span>

              <span>
                Bee<span>Positive</span>
              </span>
            </Link>

            <div className="auth-showcase-text">
              <span className="auth-eyebrow">
                <Sparkles size={15} />
                {eyebrow}
              </span>

              <h1>{title}</h1>

              <p>{description}</p>
            </div>

            <div className="auth-trust-card">
              <span className="auth-trust-icon">
                <ShieldCheck size={22} />
              </span>

              <div>
                <strong>Secure BeePositive account</strong>

                <p>
                  Your account helps you manage orders,
                  delivery details and saved products.
                </p>
              </div>
            </div>
          </div>

          <div className="auth-showcase-decoration">
            <div className="auth-orbit auth-orbit-large">
              <span />
            </div>

            <div className="auth-orbit auth-orbit-small">
              <span />
            </div>

            <div className="auth-center-hexagon">
              <Hexagon />
              <span>BeePositive</span>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          {children}
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;