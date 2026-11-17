const router = require("express").Router();
const controller = require("../controllers/categoryController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", controller.list);
router.post("/", requireAuth, requireAdmin, controller.create);
router.delete("/:id", requireAuth, requireAdmin, controller.remove);

module.exports = router;
