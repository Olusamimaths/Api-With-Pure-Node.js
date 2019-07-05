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


 // Export the module
 module.exports = helpers;