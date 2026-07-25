import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/sendPasswordResetEmail.js";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";

function formatUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function normalizePhone(phone) {
  return String(phone || "")
    .trim()
    .replace(/[\s()-]/g, "");
}

function isValidLebanesePhone(phone) {
  const normalizedPhone = normalizePhone(phone);

  const localMobilePattern =
    /^(?:03\d{6}|7[01689]\d{6}|81\d{6})$/;

  const localLandlinePattern =
    /^0[1245689]\d{6}$/;

  const internationalPattern =
    /^(?:\+961|00961)(?:3\d{6}|7[01689]\d{6}|81\d{6}|[1245689]\d{6})$/;

  return (
    localMobilePattern.test(normalizedPhone) ||
    localLandlinePattern.test(normalizedPhone) ||
    internationalPattern.test(normalizedPhone)
  );
}

export async function registerUser(req, res) {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    const normalizedPhone = normalizePhone(phone);

    if (!isValidLebanesePhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid Lebanese phone number.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

        if (password.length < 8) {
          return res.status(400).json({
            success: false,
            message:
              "Password must be at least 8 characters long.",
          });
        }

        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(password)) {
          return res.status(400).json({
            success: false,
            message:
              "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
          });
        }

    if (
      confirmPassword !== undefined &&
      password !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    const existingPhone = await User.findOne({
      phone: normalizedPhone,
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this phone number already exists.",
      });
    }
const user = await User.create({
  name: name.trim(),
  email: normalizedEmail,
  phone: normalizedPhone,
  password,
});

const verificationToken =
  user.createEmailVerificationToken();

await user.save({
  validateBeforeSave: false,
});

const frontendUrl =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

const verificationUrl =
  `${frontendUrl}/verify-email/${verificationToken}`;

try {
  await sendVerificationEmail({
    user,
    verificationUrl,
  });
} catch (error) {
  console.error(
    "Verification email error:",
    error
  );
}


return res.status(201).json({
  success: true,
  message:
    "Account created successfully. Please check your email to verify your account.",
});
  } catch (error) {
    console.error("Register user error:", error);

    if (error.code === 11000) {
      const duplicatedField = Object.keys(
        error.keyPattern || {}
      )[0];

      return res.status(409).json({
        success: false,
        message:
          duplicatedField === "phone"
            ? "An account with this phone number already exists."
            : "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      const validationMessage =
        Object.values(error.errors || {})[0]
          ?.message;

      return res.status(400).json({
        success: false,
        message:
          validationMessage ||
          "Please check your registration details.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create your account.",
    });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your email and password.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been disabled.",
      });
    }

    if (!user.isEmailVerified) {
  return res.status(403).json({
    success: false,
    message:
      "Please verify your email address before logging in.",
  });
}

    const passwordMatches =
      await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }

  
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true,
    });

    const genericResponse = {
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({
      validateBeforeSave: false,
    });

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail({
        user,
        resetUrl,
      });

      return res.status(200).json(genericResponse);
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({
        validateBeforeSave: false,
      });

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to send reset email.",
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to process your request.",
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const { password, confirmPassword } =
      req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message:
          "Password is required.",
      });
    }

   if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters long.",
    });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
    });
  }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now(),
      },
      isActive: true,
    }).select(
      "+password +passwordResetToken +passwordResetExpires"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This reset link is invalid or has expired.",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message:
        "Password updated successfully.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password.",
    });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is missing.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,

      emailVerificationExpires: {
        $gt: Date.now(),
      },

      isActive: true,
    }).select(
      "+emailVerificationToken +emailVerificationExpires"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This verification link is invalid or has expired.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message:
        "Your email address has been verified successfully.",
    });
  } catch (error) {
    console.error(
      "Verify email error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify your email address.",
    });
  }
}

export async function resendVerificationEmail(
  req,
  res
) {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your email address.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true,
    });

    const genericResponse = {
      success: true,
      message:
        "If an unverified account exists with this email, a new verification link has been sent.",
    };

    if (!user) {
      return res
        .status(200)
        .json(genericResponse);
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message:
          "This email address is already verified.",
      });
    }

    const verificationToken =
      user.createEmailVerificationToken();

    await user.save({
      validateBeforeSave: false,
    });

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const verificationUrl =
      `${frontendUrl}/verify-email/${verificationToken}`;

    try {
      await sendVerificationEmail({
        user,
        verificationUrl,
      });

      return res
        .status(200)
        .json(genericResponse);
    } catch (emailError) {
      user.emailVerificationToken =
        undefined;

      user.emailVerificationExpires =
        undefined;

      await user.save({
        validateBeforeSave: false,
      });

      console.error(
        "Resend verification email error:",
        emailError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send the verification email.",
      });
    }
  } catch (error) {
    console.error(
      "Resend verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to resend the verification email.",
    });
  }
}