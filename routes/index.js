const index_controller = require("../controllers/indexController");

var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", index_controller.home);

router.get("/signup", index_controller.signup_get);

router.post("/signup", index_controller.signup_post);

router.post("/login", index_controller.login_post);

router.post("/togglePublish", index_controller.toggle_publish_post);

router.get("/new-post", index_controller.new_post_get);
router.post("/new-post", index_controller.new_post_post);

router.get("/posts/:id", index_controller.each_post_get);

module.exports = router;
