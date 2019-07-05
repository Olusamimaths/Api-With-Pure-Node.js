/**
 * Helpers for various tasks
 * 
 */

 const crypto = require('crypto');
 const config = require('../config');

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

             // append randam character
             str += randomCharacter;
         }
         return str;
     } else {
         return false;
     }
 }


 // Export the module
 module.exports = helpers;