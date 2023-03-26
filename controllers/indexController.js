const axios = require("axios");
const { body, validationResult } = require("express-validator");
const validator = require("validator");

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
  const token = req.session.token;
  const postId = req.body.postId;

  try {
    const blogPostsRes = await axios.put(
      `http://localhost:3000/posts/${postId}/togglePublish`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const blogPosts = blogPostsRes.data;
    res.render("index", { blogPosts, token });
  } catch (err) {
    console.error(err);
    const error = err.response ? err.response.data.message : "Unknown error";
    res.render("index", { error });
  }
};

exports.new_post_get = (req, res, next) => {
  res.render("new-post-form");
};

exports.new_post_post = [
  body("title", "Title must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("content", "Content must not be empty")
    .trim()
    .isLength({ min: 1 }),

  async (req, res, next) => {
    const errors = validationResult(req);
    console.log(req.body.content);

    if (!errors.isEmpty()) {
      res.render("new-post-form", {
        title: req.body.title,
        content: req.body.content,
        errors: errors.array(),
      });
      return;
    }

    const token = req.session.token;

    try {
      const blogPostsRes = await axios.post(
        "http://localhost:3000/posts/new",
        {
          title: req.body.title,
          content: req.body.content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
  
      const blogPosts = blogPostsRes.data;
      res.render("index", { blogPosts, token });
    } catch (err) {
      console.error(err);
      const error = err.response ? err.response.data.message : "Unknown error";
      res.render("index", { error });
    } 
  }
];

exports.each_post_get = async (req, res, next) => {
  const token = req.session.token;

  try {
    const postRes = await axios.get(
      `http://localhost:3000/posts/${req.params.id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const postData = postRes.data;
    const content = postData.post.content.replace(/(<([^>]+)>)/gi, '');
    res.render("each-post", {
      post: postData.post,
      content: content,
      comments: postData.comments,
    });
  } catch (err) {
    console.error(err);
    const error = err.response ? err.response.data.message : "Unknown error";
    res.render("index", { error }); 
  }
}