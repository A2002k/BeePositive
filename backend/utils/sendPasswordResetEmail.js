import nodemailer from "nodemailer";

export async function sendPasswordResetEmail({
  user,
  resetUrl,
}) {
  const emailUser =
    process.env.EMAIL_USER?.trim();

  const emailPassword =
    process.env.EMAIL_PASSWORD
      ?.replace(/\s/g, "")
      .trim();

  if (!emailUser) {
    throw new Error(
      "EMAIL_USER is missing from the backend .env file."
    );
  }

  if (!emailPassword) {
    throw new Error(
      "EMAIL_PASSWORD is missing from the backend .env file."
    );
  }

  if (!user?.email) {
    throw new Error(
      "User email is missing."
    );
  }

  if (!resetUrl) {
    throw new Error(
      "Password reset URL is missing."
    );
  }

  const transporter =
    nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

  const result =
    await transporter.sendMail({
      from: `"BeePositive" <${emailUser}>`,

      to: user.email,

      subject:
        "Reset your BeePositive password",

      html: `
        <div style="
          max-width:620px;
          margin:0 auto;
          font-family:Arial,sans-serif;
          background:#100b06;
          color:#ffffff;
          border:1px solid #f59e0b;
          border-radius:16px;
          overflow:hidden;
        ">
          <div style="
            padding:28px;
            text-align:center;
            background:#17110c;
          ">
            <h1 style="
              margin:0;
              color:#f59e0b;
            ">
              BeePositive
            </h1>

            <p style="
              margin:8px 0 0;
              color:#dddddd;
            ">
              Password reset request
            </p>
          </div>

          <div style="padding:30px;">
            <h2>
              Hello ${user.name || "there"},
            </h2>

            <p style="
              color:#d6d3d1;
              line-height:1.7;
            ">
              We received a request to reset
              your BeePositive account password.
            </p>

            <div style="
              margin:28px 0;
              text-align:center;
            ">
              <a
                href="${resetUrl}"
                style="
                  display:inline-block;
                  padding:14px 24px;
                  color:#17110c;
                  background:#f59e0b;
                  border-radius:10px;
                  text-decoration:none;
                  font-weight:700;
                "
              >
                Reset Password
              </a>
            </div>

            <p style="
              color:#d6d3d1;
              line-height:1.7;
            ">
              This reset link will expire in
              15 minutes and can only be used once.
            </p>

            <p style="
              color:#d6d3d1;
              line-height:1.7;
              word-break:break-all;
            ">
              If the button does not work, copy
              and paste this link into your browser:
              <br><br>
              <a
                href="${resetUrl}"
                style="color:#f59e0b;"
              >
                ${resetUrl}
              </a>
            </p>

            <p style="
              margin-top:26px;
              color:#a8a29e;
              line-height:1.7;
            ">
              If you did not request a password
              reset, you can safely ignore this
              email. Your password will remain
              unchanged.
            </p>
          </div>
        </div>
      `,
    });

  console.log(
    "Password reset email sent:",
    result.messageId
  );

  return result;
}