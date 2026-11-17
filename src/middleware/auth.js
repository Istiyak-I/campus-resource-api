const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const env = require("../config/env");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError(401, "Authentication required. Send Authorization: Bearer <token>.");
  }

  let payload;
  try {
    payload = jwt.verify(header.slice(7), env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Invalid or expired token.");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true }
  });

  if (!user) throw new HttpError(401, "User for this token no longer exists.");

  req.user = user;
  next();
});

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new HttpError(403, "Admin access required."));
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
