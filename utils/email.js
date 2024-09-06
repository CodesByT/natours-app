const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  //  1) Create a transporter , which is a service which send the email

  const transporter = nodemailer.createTransport({
    host: process.env.EMAILHOST,
    port: process.env.EMAILPORT,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAILPASSWORD,
    },
  })

  //  2) Define email options
  const mailOptions = {
    from: 'Mr.T <email@tayyab.io>',
    to: options.email,
    subject: options.subject,
    text: options.emailMessage,
    // html:
  }
  //  3) send the email
  await transporter.sendMail(mailOptions) // it returns a promise
}

module.exports = sendEmail
