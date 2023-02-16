const nodemailer = require('nodemailer');
//const mongoose = require('mongoose');
//const Email = mongoose.model('Email');

const transporter = nodemailer.createTransport({
   host: process.env.SMTP_SERVER,
   port: 465,
   secure: true,
   auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
   },
   //sendmail:true,
   //path: '../node_modules/sendmail/sendmail.js'
});

exports.send = async function(message) {
   const options = {
      from: process.env.SMTP_EMAIL,
      to: message.to,
      subject: process.env.EMAIL_TAG + ' ' + message.subject,
      text: message.text,
      html: message.html,
      //path: '../sendmail/sendmail' //on windows 
   };
   //console.log(transporter)
   let email;
   if(process.env.ENV === 'test') email = { from: process.env.SMTP_EMAIL, to: message.to, messageId: "test" };
   else {email = transporter.sendMail(options,function (err,info) {
      if(err)
      {
        console.log({err:err, info:info});
      }
    });}
   //await new Email(email).save();
   return email;
};

//OLD VERSION (Not working without STMP)
/*
const sendmail = require('sendmail')({ silent: true });

exports.send = async function(message) {
   let email;
   if(process.env.ENV === 'test') email = { from: process.env.EMAIL, to: message.to, messageId: "test" };
   else {
      email = await sendmail({
         from: process.env.EMAIL,
         to: message.to,
         subject: process.env.EMAIL_TAG + ' ' + message.subject,
         text: message.text,
      });
   }
   return email;
} 
*/
// NODEMAILER VERSIOM\
//const nodemailer = require('nodemailer');

//const transporter = nodemailer.createTransport({
//   sendmail: true,
//   newline: 'unix',
//   path: '/usr/sbin/sendmail'
//});

//exports.send = async function(message) {
//   const options = {
//      from: process.env.EMAIL,
//      to: message.to,
//      subject: process.env.EMAIL_TAG + ' ' + message.subject,
//      text: message.text,
//      html: message.html
//   };

//   let email;
//   if(process.env.ENV === 'test') email = { from: process.env.EMAIL, to: message.to, messageId: "test" };
//   else email = await transporter.sendMail(options);
//   return email;
//};