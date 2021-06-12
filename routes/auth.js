const router = require("express").Router();
const { isAuth, isAdmin } = require("../middlewares/auth");

const controller = require("../controllers/authController");

router.post("/register", controller.register);
router.post("/activation", controller.activateEmail);
router.post("/login", controller.login);
router.post("/refresh_token", controller.getAccessToken);
router.post("/forgot", controller.forgetPassword);
router.post("/reset", isAuth, controller.resetPassword);
router.get("/get-user", isAuth, controller.getUser);
router.get("/all", isAuth, isAdmin, controller.getAllUser);
router.get("/logout", controller.logout);

module.exports = router;
