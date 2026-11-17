const { z } = require("zod");

const resourceSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5).max(3000),
  url: z.string().trim().url().max(2048),
  subject: z.string().trim().max(100).optional().nullable(),
  semester: z.coerce.number().int().min(1).max(12).optional().nullable(),
  fileType: z.string().trim().max(30).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(30)).max(15).optional().default([]),
  categoryId: z.string().optional().nullable()
});

const updateResourceSchema = resourceSchema.partial();

module.exports = { resourceSchema, updateResourceSchema };
