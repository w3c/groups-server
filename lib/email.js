"use strict";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail',
});

let MAILING_LIST, SENDER_EMAIL;

if (process.env.NODE_ENV == 'production') {
  MAILING_LIST = "plh@w3.org";
  SENDER_EMAIL = "plh@w3.org";
} else {
  MAILING_LIST = "plh@w3.org";
  SENDER_EMAIL = "plh@w3.org";
}

export
function email(msg) {
  const mailOptions = {
    from: "Group repositories error <" + SENDER_EMAIL + ">",
    to: MAILING_LIST,
    subject: "Group repositories error report",
    text: msg
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return sendError("exception while sending email", error); // notify plh
    }
    console.log('Message sent: %s', info.messageId);
  });

}

export
function sendError(msg, error) {
  // if things go wrong, please call the maintainer
  const mailOptions = {
    from: "Group repositories error <" + SENDER_EMAIL + ">",
    to: "plh@w3.org",
    subject: "Group repositories report",
    text: `We've got an error on the group repository tool.\n ${msg}\n\n` + JSON.stringify(error, null, " ")
  };

  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error(JSON.stringify(error));
    }
    console.log('Error message sent: %s', info.messageId);
  });

}

export default email;
