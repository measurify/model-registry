const mongoose = require('mongoose');

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
