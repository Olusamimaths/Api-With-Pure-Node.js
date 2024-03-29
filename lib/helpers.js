/**
 * Helpers for various tasks
 * 
 */

 const crypto = require('crypto');
 const config = require('../config');
 const https = require('https');
 const querystring = require('querystring');

 // container for all the helpers
 const helpers = {};

 // Creat a SHA26 hash 
 helpers.hash = (str) => {
     if(typeof(str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
     } else {
         return false;
     }
 }


 // Parse a Json string to an object in all cases, without throwing
 helpers.parseJsonToObject = (str) => {
     try {
         const obj = JSON.parse(str);
         return obj;
     } catch(e){
         return {};
     }
 };


 // Create a string random alphanumeric characters, of a given length
 helpers.createRandomString = (strLength) => {
     strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
     if(strLength) {
         // Define all the possible characters that can be used
         const possibleCharacters = 'abcdefghijklmonpqrstuvwxyz0123456789';

         // initialize string
         let str = '';
         for(let i = 1; i <=strLength; i++) {
             // Get random character
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

             // append random character
             str += randomCharacter;
         }
         return str;
     } else {
         return false;
     }
 }

 // Send an SMS via Twilio
 helpers.sendTwilioSms = (phone, msg, callback) => {
     // validate the parameters
     phone = typeof(phone) == 'string' && phone.trim().length == 11 ? phone.trim() : false;
     msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim() <= 1600 ? msg.trim() : false;
     if(phone && msg) {
        // configure twilio request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+234'+phone,
            'Body': msg
        };

        // Stingify the payload
        const stringPayload = querystring.stringify(payload);

        // Configure the request details
        const requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth': config.twilio.accountSid+':'+config.twilio.authtoken,
            'headers': {
                'Content-Type' : 'Application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the reqest object
        const req = https.request(requestDetails, (res) => {
            // Grab the status of the sent request
            const status = res.statusCode;
            // Callback successfully if the request went through
            if(status == 200 || status == 201) {
                callback(false);
            } else {
                callback('Status code returned was' + status)
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error', (e) => callback(e));

        // add the payload
        req.write(stringPayload);

        // End the request
        req.end();
     } else {
         callback('Invalid parameters supplied.')
     }
 }


 // Export the module
 module.exports = helpers;