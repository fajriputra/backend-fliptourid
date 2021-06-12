const { getToken } = require("../utils/get-token");
const jwt = require("jsonwebtoken");
const config = require("../config");

const Users = require("../models/user/model");

module.exports = {
  decodeToken: () => {
    return async (req, res, next) => {
      try {
        let token = getToken(req);

        if (!token) return next();

        req.user = jwt.verify(token, config.secretKey);

        let user = await Users.findOne({ token: { $in: [token] } });

        if (!user) {
          return res.json({
            error: 1,
            message: "Token expired",
          });
        }
      } catch (err) {
        if (err && err.name === "JsonWebTokenError") {
          return res.json({
            error: 1,
            message: err.message,
          });
        }

        next(err);
      }
      next();
    };
  },
};
