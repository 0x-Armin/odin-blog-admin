const axios = require("axios");
const { body, validationResult } = require("express-validator");

var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Blog Admin", token: req.session.token });
});

router.get("/signup", function (req, res, next) {
  res.render("sign-up-form", { title: "Sign up" });
});

router.post("/signup", [
  body("email", "Email must not be empty.").trim().isEmail(),
  body("password", "Password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("passwordCfm")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom((val, { req }) => val === req.body.password)
    .withMessage("The passwords do not match"),

  async (req, res, next) => {
    const user = { email: req.body.email, password: req.body.password };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("sign-up-form", {
        title: "Sign up",
        user,
        errors: errors.array(),
      });
      return;
    }

    // Valid form fields, call API to save
    axios
      .post("http://localhost:3000/users/signup", user)
      .then((response) => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/");
      });
  },
]);

router.post("/login", [
  body("email", "Email must not be empty.").trim().isEmail(),
  body("password", "Password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res, next) => {
    const user = { email: req.body.email, password: req.body.password };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("index", {
        title: "Log in",
        user,
        errors: errors.array(),
      });
      return;
    }

    // Valid form fields, call API to save
    axios
      .post("http://localhost:3000/users/login", user)
      .then((response) => {
        const token = response.data.token;
        req.session.token = token;
        res.render("index", {token: token});
      })
      .catch((err) => {
        const error = err.response.data.message;
        res.render("index", {error: error});
      });
  },
]);

module.exports = router;
