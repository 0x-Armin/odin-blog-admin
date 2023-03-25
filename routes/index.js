const index_controller = require("../controllers/indexController");

var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", index_controller.home);

router.get("/signup", index_controller.signup_get);

router.post("/signup", index_controller.signup_post);

router.post("/login", index_controller.login_post);

router.post("/togglePublish", index_controller.toggle_publish_post);

module.exports = router;
