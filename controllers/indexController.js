const axios = require("axios");
const { body, validationResult } = require("express-validator");

exports.home = function (req, res, next) {
  res.render("index", { title: "Blog Admin", token: req.session.token });
};

exports.signup_get = function (req, res, next) {
  res.render("sign-up-form", { title: "Sign up" });
};

exports.signup_post = [
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
];

exports.login_post = [
  body("email", "Email must not be empty.").trim().isEmail(),
  body("password", "Password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Log in
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

    // Log in user to get token
    try {
      const response = await axios.post(
        "http://localhost:3000/users/login",
        user
      );
      const token = response.data.token;
      req.session.token = token;

      // Request for full list of blog posts with token
      const blogPostsRes = await axios.get(
        "http://localhost:3000/posts/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const blogPosts = blogPostsRes.data;

      res.render("index", { blogPosts, token });
    } catch (err) {
      console.error(err);
      const error = err.response ? err.response.data.message : "Unknown error";
      res.render("index", { error });
    }
  },
];

exports.toggle_publish_post = async (req, res, next) => {
  console.log(req.session.token);
};
