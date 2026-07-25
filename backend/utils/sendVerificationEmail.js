import nodemailer from "nodemailer";

export async function sendVerificationEmail({
  user,
  verificationUrl,
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

  if (!verificationUrl) {
    throw new Error(
      "Verification URL is missing."
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
        "Verify your BeePositive email address",

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
              Verify your email address
            </p>
          </div>

          <div style="padding:30px;">
            <h2>
              Welcome, ${user.name || "there"}!
            </h2>

            <p style="
              color:#d6d3d1;
              line-height:1.7;
            ">
              Thank you for creating a
              BeePositive account.
            </p>

            <p style="
              color:#d6d3d1;
              line-height:1.7;
            ">
              Please verify your email address
              by clicking the button below.
            </p>

            <div style="
              margin:28px 0;
              text-align:center;
            ">
              <a
                href="${verificationUrl}"
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
                Verify Email
              </a>
            </div>

            <p style="
              color:#d6d3d1;
              line-height:1.7;
            ">
              This verification link will expire
              after 24 hours and can only be used once.
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
                href="${verificationUrl}"
                style="color:#f59e0b;"
              >
                ${verificationUrl}
              </a>
            </p>

            <p style="
              margin-top:26px;
              color:#a8a29e;
              line-height:1.7;
            ">
              If you did not create this account,
              you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

  console.log(
    "Verification email sent successfully:",
    result.messageId
  );

  return result;
}