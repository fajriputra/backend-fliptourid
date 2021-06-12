// wlvodbrlleohkhca
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  rootPath: path.resolve(__dirname, ".."),
  clientURL: process.env.CLIENT_URL,
  activationTokenSecret: process.env.ACTIVATION_TOKEN_SECRET,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  mailingServiceClientID: process.env.MAILING_SERVICE_CLIENT_ID,
  mailingServiceClientSecret: process.env.MAILING_SERVICE_CLIENT_SECRET,
  mailingServiceRefreshToken: process.env.MAILING_SERVICE_REFRESH_TOKEN,
  senderEmail: process.env.SENDER_EMAIL,
};
