const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { registerSchema, loginSchema } = require("../validators/auth");

function makeToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

exports.register = asyncHandler(async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    throw new HttpError(400, "Invalid registration data.", result.error.flatten());
  }

  const { name, email, password } = result.data;
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new HttpError(409, "An account with this email already exists.");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, passwordHash },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });

  res.status(201).json({ success: true, message: "Account created.", data: { user, token: makeToken(user) } });
});

exports.login = asyncHandler(async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw new HttpError(400, "Invalid login data.", result.error.flatten());
  }

  const user = await prisma.user.findUnique({ where: { email: result.data.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(result.data.password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ success: true, data: { user: safeUser, token: makeToken(safeUser) } });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
