const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Users = require("../models/user/model");
const {
  clientURL,
  activationTokenSecret,
  accessTokenSecret,
  refreshTokenSecret,
} = require("../config");
const { sendEmail } = require("../utils/sendMail");

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password)
        return res.status(400).json({ message: "This fields is required" });

      if (!validateEmail(email))
        return res
          .status(400)
          .json({ message: "Must be a valid email address" });

      const user = await Users.findOne({ email });
      if (user)
        return res.status(400).json({ message: `${email} already exist` });

      if (password.length < 6)
        return res
          .status(400)
          .json({ message: "Must be at least 6 characters" });

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = {
        name,
        email,
        password: passwordHash,
      };

      const activation_token = createActivationToken(newUser);

      const url = `${clientURL}/auth/activate/${activation_token}`;
      sendEmail(
        email,
        url,
        "Verify your email address",
        "Welcome to FliptourID",
        "Congratulations! You're almost set to start using FliptourID. Just click the button below to validate your email address."
      );

      res.json({
        message: "Register success! Please check your email to activation",
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  },
  activateEmail: async (req, res) => {
    try {
      const { activation_token } = req.body;
      const user = jwt.verify(activation_token, activationTokenSecret);

      const { name, email, password } = user;

      const check = await Users.findOne({ email });
      if (check)
        return res.status(400).json({ message: `${email} doesn't exits` });

      const newUser = new Users({
        name,
        email,
        password,
      });

      await newUser.save();

      res.json({ message: "Your account has been activated" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email });
      if (!user)
        return res.status(400).json({ message: `${email} doesn't exist.` });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(500).json({ message: "Incorrect email or password" });

      const refresh_token = createRefreshToken({ id: user._id });
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/auth/refresh_token",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1d
      });

      res.json({ message: "Login successfully" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getAccessToken: async (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token)
        return res.status(400).json({ message: "Please login now" });

      jwt.verify(rf_token, refreshTokenSecret, (err, user) => {
        if (err) return res.status(400).json({ message: "Please login now" });

        const access_token = createAccessToken({ id: user.id });
        res.json({ access_token });
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  forgetPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ email });
      if (!user)
        return res.status(400).json({ message: `${email} doesn't exits` });

      const access_token = createAccessToken({ id: user._id });
      const url = `${clientURL}/auth/reset/${access_token}`;

      sendEmail(
        email,
        url,
        "Reset your password",
        "Link Reset Password",
        "Just click the button below to reset your password."
      );
      res.json({ message: "Please check your email to reset password" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;

      const passwordHash = await bcrypt.hash(password, 12);

      await Users.findOneAndUpdate(
        { _id: req.user.id },
        {
          password: passwordHash,
        }
      );

      res.json({ message: "Password successfully changed" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");

      return res.json(user);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getAllUser: async (req, res) => {
    try {
      const users = await Users.find().select("-password");

      return res.json(users);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/auth/refresh_token" });

      return res.json({ message: "Logged out successfully" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
};

const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const createActivationToken = (payload) => {
  return jwt.sign(payload, activationTokenSecret, { expiresIn: "10m" });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, accessTokenSecret, { expiresIn: "20m" });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: "24h" });
};
