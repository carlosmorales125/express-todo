import nodemailer from 'nodemailer';
import config from '../config';

export const confirmEmail = (userEmail, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.gmailEmail,
            pass: config.gmailPassword
        }
    });

    const url = `${config.confirmEmailUrl}/${token}`;

    const mailOptions = {
        from: config.gmailEmail,
        to: userEmail,
        subject: 'Vue Todo PWA -  Confirm Your Email',
        text: `Click here to confirm your email: ${url}`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

};

export default confirmEmail;
