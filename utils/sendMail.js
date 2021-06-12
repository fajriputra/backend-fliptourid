const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";

const {
  mailingServiceClientID,
  mailingServiceClientSecret,
  mailingServiceRefreshToken,
  senderEmail,
} = require("../config");

const oauth2client = new OAuth2(
  mailingServiceClientID,
  mailingServiceClientSecret,
  mailingServiceRefreshToken,
  OAUTH_PLAYGROUND
);

module.exports = {
  sendEmail: (to, url, txt, heading, subheading) => {
    oauth2client.setCredentials({
      refresh_token: mailingServiceRefreshToken,
    });

    const accessToken = oauth2client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: senderEmail,
        clientId: mailingServiceClientID,
        clientSecret: mailingServiceClientSecret,
        refreshToken: mailingServiceRefreshToken,
        accessToken,
      },
    });

    const mailOptions = {
      from: senderEmail,
      to: to,
      subject: "FliptourID",
      html: `
            <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">${heading}</h2>
            <p>${subheading}
            </p>
            
            <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
        
            <p>If the button doesn't work for any reason, you can also click on the link below:</p>
        
            <div>${url}</div>
            </div>
        `,
    };

    smtpTransport.sendMail(mailOptions, (err, infor) => {
      if (err) return err;
      return infor;
    });
  },
};
