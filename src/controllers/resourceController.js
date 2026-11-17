const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { resourceSchema, updateResourceSchema } = require("../validators/resource");

const includeRelations = {
  uploader: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  _count: { select: { reviews: true } }
};

exports.list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const subject = typeof req.query.subject === "string" ? req.query.subject.trim() : "";
  const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
  const semester = req.query.semester ? Number.parseInt(req.query.semester, 10) : undefined;

  if (semester !== undefined && (!Number.isInteger(semester) || semester < 1 || semester > 12)) {
    throw new HttpError(400, "semester must be an integer between 1 and 12.");
  }

  const where = {
    ...(search ? { OR: [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } }
    ] } : {}),
    ...(subject ? { subject: { contains: subject, mode: "insensitive" } } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(semester ? { semester } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.resource.findMany({
      where, include: includeRelations,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit, take: limit
    }),
    prisma.resource.count({ where })
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const resource = await prisma.resource.findUnique({
    where: { id: req.params.id },
    include: { ...includeRelations, reviews: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } } }
  });
  if (!resource) throw new HttpError(404, "Resource not found.");
  res.json({ success: true, data: resource });
});

exports.create = asyncHandler(async (req, res) => {
  const result = resourceSchema.safeParse(req.body);
  if (!result.success) throw new HttpError(400, "Invalid resource data.", result.error.flatten());

  const data = { ...result.data, uploaderId: req.user.id };
  if (data.categoryId === null) delete data.categoryId;
  const resource = await prisma.resource.create({ data, include: includeRelations });
  res.status(201).json({ success: true, data: resource });
});

exports.update = asyncHandler(async (req, res) => {
  const result = updateResourceSchema.safeParse(req.body);
  if (!result.success) throw new HttpError(400, "Invalid resource data.", result.error.flatten());
  if (Object.keys(result.data).length === 0) throw new HttpError(400, "Provide at least one field to update.");

  const existing = await prisma.resource.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, "Resource not found.");
  if (existing.uploaderId !== req.user.id && req.user.role !== "ADMIN") {
    throw new HttpError(403, "You can only update resources you uploaded.");
  }

  const data = { ...result.data };
  const resource = await prisma.resource.update({
    where: { id: req.params.id }, data, include: includeRelations
  });
  res.json({ success: true, data: resource });
});

exports.remove = asyncHandler(async (req, res) => {
  const existing = await prisma.resource.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, "Resource not found.");
  if (existing.uploaderId !== req.user.id && req.user.role !== "ADMIN") {
    throw new HttpError(403, "You can only delete resources you uploaded.");
  }
  await prisma.resource.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Resource deleted." });
});
