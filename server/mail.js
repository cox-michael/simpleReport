const nodemailer = require("nodemailer");

module.exports = function() {
  // async function mail(to, subject, html) {
  const mail = (to, subject, html) => {
    return new Promise(resolve => {
      const transporter = nodemailer.createTransport({
          sendmail: true
      });

      const mailOptions = {
        from: `"SimpleReport" <${process.env.FROM_EMAIL_ADDRESS}>`,
        to: to, // (comma separated)
        subject: subject,
        // text: 'plain text body', // plain text body
        html: html // html body
      };

      // console.log(mailOptions);

      // transporter.sendMail(mailOptions, (err, info) => {
      transporter.sendMail(mailOptions, (err) => {
        // if (err) reject(err);
        // if (info) resolve(info);
        if(err) console.log('err:', err);
        // console.log('info:', info);
        console.log('\t\t\tSent:', to);
        resolve();
      });
    });
  };

  return mail;
};
