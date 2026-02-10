import bcrypt from "bcrypt";
import { prisma } from "../database/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendVerifyEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
} from "../services/mailService.js";

const signUp = async (req, res) => {
  const { email, password } = req.body;

  // Check whether this user existed in the DB or not
  const userExisted = await prisma.user.findUnique({
    where: { email },
  });

  if (userExisted) {
    return res.status(400).json({ error: "This user has already existed" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  const verifyUserToken = crypto.randomBytes(32).toString("hex");

  // Insert user to pending user table
  await prisma.pendingUser.create({
    data: {
      email,
      password: hashPassword,
      token: verifyUserToken,
      expiresAt: new Date(Date.now() + 60 * 1000), // 1 min
    },
  });

  // Send verify user email
  await sendVerifyEmail(email, verifyUserToken).catch((err) =>
    console.error("Send verify user email failed", err),
  );

  return res.status(200).json({
    data: { message: "Please check your email to verify your account" },
  });

  // const user = await prisma.user.create({
  //   data: {
  //     email,
  //     password: hashPassword,
  //     name,
  //   },
  // });

  // sendWelcomeEmail(user.email, user.name).catch((err) => {
  //   console.error("Send email failed: ", err);
  // });

  // return res.status(201).json({
  //   status: "success",
  //   data: {
  //     user: {
  //       id: user.id,
  //       email,
  //       name,
  //     },
  //   },
  // });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  // Check whether this user existed in the DB or not
  const userExisted = await prisma.user.findUnique({
    where: { email },
  });

  if (!userExisted) {
    return res.status(400).json({ error: "Email or password is invalid" });
  }

  const isValidPassword = await bcrypt.compare(password, userExisted.password);

  if (!isValidPassword) {
    return res.status(400).json({ error: "Email or password is invalid" });
  }

  const token = jwt.sign(
    {
      id: userExisted.id,
      email: userExisted.email,
      name: userExisted.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: 60 * 60 * 24 },
  );

  return res.status(200).json({
    data: {
      email: userExisted.email,
      accessToken: token,
    },
  });
};

const verify = async (req, res) => {
  const { token } = req.query;

  const pendingUser = await prisma.pendingUser.findUnique({
    where: {
      token,
    },
  });

  if (!pendingUser || pendingUser.expiresAt < Date.now()) {
    return res
      .status(400)
      .json({ data: { message: "Invalid or expired token" } });
  }

  await prisma.$transaction([
    prisma.user.create({
      data: {
        email: pendingUser.email,
        password: pendingUser.password,
      },
    }),
    prisma.pendingUser.delete({ where: { id: pendingUser.id } }),
  ]);

  await sendWelcomeEmail(pendingUser.email, pendingUser.email);

  res.json({
    message: "Your account has been verified successfully",
    data: {
      email: pendingUser.email,
    },
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const userExisted = await prisma.user.findUnique({ where: { email } });

  if (!userExisted) {
    return res
      .status(400)
      .json({ data: { message: `User not existed with email: ${email}` } });
  }

  // Genarate token
  const token = crypto.randomBytes(32).toString("hex");

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: userExisted.id,
      expiresAt: new Date(Date.now() + 60 * 1000), // 1 min
    },
  });

  const resetLink = `${process.env.FE_URL}/reset-password?token=${token}`;

  // Send email
  await sendResetPasswordEmail(userExisted.email, resetLink);

  res.status(200).json({
    data: {
      message: `We have already sent a reset password link to ${userExisted.email} `,
    },
  });
};

const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      data: { message: "New passowrd or confirm password is required" },
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      data: { message: "New confirm and confirm password does not match" },
    });
  }

  const pendingResetRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (
    !pendingResetRecord ||
    pendingResetRecord.used ||
    pendingResetRecord.expiresAt < Date.now()
  ) {
    return res
      .status(400)
      .json({ data: { message: "Invalid or expired token" } });
  }

  const salt = await bcrypt.genSalt(10);
  const newHashPassword = await bcrypt.hash(newPassword, salt);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: pendingResetRecord.userId },
      data: {
        password: newHashPassword,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: pendingResetRecord.id },
      data: {
        used: true,
      },
    }),
  ]);

  return res
    .status(200)
    .json({ data: { message: "Your password has been updated" } });
};

export { signUp, signIn, verify, forgotPassword, resetPassword };
