const jwt = require("jsonwebtoken");

const { accessTokenSecret } = require("../config");
const Users = require("../models/user/model");

module.exports = {
  isLogin: (req, res, next) => {
    if (req.session.user == null || req.session.user == undefined) {
      req.flash(
        "alertMessage",
        "Session telah habis silahkan signin kembali!!"
      );
      req.flash("alertStatus", "danger");
      res.redirect("/admin/signin");
    } else {
      next();
    }
  },

  isAuth: (req, res, next) => {
    try {
      const token = req.header("Authorization");
      if (!token)
        return res.status(400).json({ message: "Invalid Authentication" });

      jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err)
          return res.status(400).json({ message: "Invalid Authentication" });

        req.user = user;
        next();
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  isAdmin: async (req, res, next) => {
    try {
      const user = await Users.findOne({ _id: req.user.id });

      if (user.role !== 1)
        return res
          .status(400)
          .json({ message: "Admin resource access denied" });
      next();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
};
