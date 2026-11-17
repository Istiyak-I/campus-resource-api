const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { z } = require("zod");

exports.createOrUpdate = asyncHandler(async (req, res) => {
  const parsed = z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional().nullable()
  }).safeParse(req.body);

  if (!parsed.success) throw new HttpError(400, "Rating must be an integer from 1 to 5.", parsed.error.flatten());

  const resource = await prisma.resource.findUnique({ where: { id: req.params.resourceId } });
  if (!resource) throw new HttpError(404, "Resource not found.");

  const review = await prisma.review.upsert({
    where: { userId_resourceId: { userId: req.user.id, resourceId: resource.id } },
    create: { ...parsed.data, userId: req.user.id, resourceId: resource.id },
    update: parsed.data,
    include: { user: { select: { id: true, name: true } } }
  });
  res.status(201).json({ success: true, data: review });
});

exports.remove = asyncHandler(async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.reviewId } });
  if (!review) throw new HttpError(404, "Review not found.");
  if (review.userId !== req.user.id && req.user.role !== "ADMIN") {
    throw new HttpError(403, "You can only delete your own review.");
  }
  await prisma.review.delete({ where: { id: review.id } });
  res.json({ success: true, message: "Review deleted." });
});
