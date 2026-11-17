const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { z } = require("zod");

exports.list = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { resources: true } } }
  });
  res.json({ success: true, data: categories });
});

exports.create = asyncHandler(async (req, res) => {
  const parsed = z.object({ name: z.string().trim().min(2).max(60) }).safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Category name must be 2–60 characters.", parsed.error.flatten());
  const category = await prisma.category.create({ data: { name: parsed.data.name } });
  res.status(201).json({ success: true, data: category });
});

exports.remove = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) throw new HttpError(404, "Category not found.");
  await prisma.category.delete({ where: { id: category.id } });
  res.json({ success: true, message: "Category deleted. Its resources remain, without a category." });
});
