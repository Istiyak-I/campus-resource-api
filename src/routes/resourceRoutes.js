const router = require("express").Router();
const controller = require("../controllers/resourceController");
const reviews = require("../controllers/reviewController");
const { requireAuth } = require("../middleware/auth");

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", requireAuth, controller.create);
router.patch("/:id", requireAuth, controller.update);
router.delete("/:id", requireAuth, controller.remove);
router.put("/:resourceId/reviews", requireAuth, reviews.createOrUpdate);
router.delete("/:resourceId/reviews/:reviewId", requireAuth, reviews.remove);

module.exports = router;
