/**
 * @Request handlers
 * 
 */

 const _data = require('./data');
 const helpers = require('./helpers');
 const config = require('../config');

// define the handlers
 let handlers = {};

  // users handler
  handlers.users = (data, callback) => {
   const acceptableMethods = ['post', 'get', 'put', 'delete'];
   if(acceptableMethods.indexOf(data.method) > -1){
      handlers._users[data.method](data, callback);
   } else {
      callback(405);
   }
}

// container for the users submethod
handlers._users = {};

/**
 * Users @post
 * @Required data: firstName, lastName, phone, password, tosAgreement
 * @Optional data: none
 */
handlers._users.post = (data, callback) => {
   // check that all required fields are filled out
   const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
   const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
   const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false;
   const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
   const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

   if(firstName && lastName && phone && password && tosAgreement){
      _data.read('users', phone, (err, data) => {
         if(err) {
            // Hash the password
            const hashPassword = helpers.hash(password);

            // create the user object
            if(hashPassword) {
                  const userObject = {
                  firstName,
                  lastName,
                  phone,
                  hashPassword,
                  tosAgreement: true
               };

               // store the user
               _data.create('users', phone, userObject, (err) => {
                  if(!err){
                     callback(200);
                  } else {
                     console.log(err);
                     callback(500, {'Error': 'Could not create the new user'});
                  }
               })
            } else {
               callback(500, {'Error': 'Could not hash password'})
            }
            
         } else {
            // user already exist
            callback(400, {'Error': 'A user with that phone number already exists'})
         }
      })
   } else {
      callback(400, {'Error': 'Missing required fields'})
   }
};

/**
 * User @get
 * @required data: phone
 * @optional data: none
 */
handlers._users.get = (data, callback) => {
   // Check that the phone number provided is valid
   const phone = (typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length == 11) ? data.queryStringObject.phone.trim(): '';
   if(phone) {
      // Get the token from the headers
      const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

      // verify the validity of the token
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
         if(tokenIsValid) {
            // lookup for the user
            _data.read('users',phone, (err, data) => {
               if(!err && data) {
                  // Remove the hashed password from the user object before returning it to the req
                  delete data.hashPassword;
                  callback(200, data);
               } else {
                  callback(404);
               }
            })
         } else {
            callback(403, {'Error' : 'Missing required token in header or token is invalid'})
         }
      })
   } else {
      callback(404, {'Error': 'Missing required field'})
   }
};

/**
 * Users - @Put
 * @required data: phone
 * @optional data: firstName, lastName, password (at least one)
 */
handlers._users.put = (data, callback) =>{
   // Check for the required field
   const phone = (typeof(data.payload.phone) == 'string' && data.payload.phone.length == 11) ? data.payload.phone.trim(): '';
   // Check for the optional field
   const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
   const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
   const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

   // Phone is required
   if(phone){
      if(firstName || lastName || password){

         // Get the token from the headers
         const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

         // verify the validity of the token
         handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if(tokenIsValid) {
                  // check that user exists before trying to update
                  _data.read('users', phone, (err, userData) => {
                     if(!err && userData) {
                        // Update the fields
                        if(firstName) userData.firstName = firstName;
                        if(lastName) userData.lastName = lastName;
                        if(password) userData.hashPassword = helpers.hash(password);

                        // store the new update
                        _data.update('users', phone, userData, (err) => {
                           if(!err){
                           callback(200)
                           } else {
                              console.log(err);
                              callback(500, {'Error': 'Could not updat the user'})
                           }
                        })
                     } else {
                        callback(400, {'Error': 'User does not exist'})
                     }
                  })
            } else {
               callback(403, {'Error' : 'Missing required token in header or token is invalid'})
            }
         }); 
      }
   } else {
      callback(400, {'Error': 'Missing required field'})
   }
};

/**
 * Users - @Delete
 * @required phone
 * @TODO Delete associated data with the user
 */
handlers._users.delete = (data, callback) =>{
      // Check that the phone number provided is valid
      const phone = (typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length == 11) ? data.queryStringObject.phone.trim(): '';
      if(phone) {
         // Get the token from the headers
         const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

         // verify the validity of the token
         handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if(tokenIsValid) {
                  // lookup for the user
               _data.read('users',phone, (err, data) => {
                  if(!err && data) {
                     _data.delete('users', phone, (err) => {
                        if(!err){
                           callback(200);
                        } else {
                           callback(500, {'Error': 'Could not delete user.'})
                        }
                     })
                  } else {
                     callback(404, {'Error': 'Could not find the specified user'});
                  }
               })
            } else {
               callback(403, {'Error' : 'Missing required token in header or token is invalid'})
            }
         });
         
      } else {
         callback(404, {'Error': 'Missing required field'})
      }
};


  // tokens handler
  handlers.tokens = (data, callback) => {
   const acceptableMethods = ['post', 'get', 'put', 'delete'];
   if(acceptableMethods.indexOf(data.method) > -1){
      handlers._tokens[data.method](data, callback);
   } else {
      callback(405);
   }
}

// container for all tokens submethod
handlers._tokens = {};

/**
 * @Tokens - post
 * @required data: phone and password
 * @optional data: none
 */
handlers._tokens.post = (data, callback) => {
   const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false;
   const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

   if(phone && password){
      // Lookup the user who matches the phone number
      _data.read('users', phone, (err, userData) => {
         if(!err && userData){
            // hash the sent password and compare to the stored password
            const hashedPassword = helpers.hash(password);
            if(hashedPassword == userData.hashPassword) {
               // create new token with a random name, expires in 1 hour
               const tokenId = helpers.createRandomString(20);
               const expires = Date.now() + 1020 * 60 * 60;

               const tokenObject = {
                  phone,
                  tokenId,
                  expires
               }

               // store the tokens
               _data.create('tokens', tokenId, tokenObject, (err) => {
                  if(!err){
                     callback(200, tokenObject)
                  } else {
                     callback(500, {'Error': 'Could not create token'})
                  }
               })
            } else {
               callback(400, {'Error' : 'Incorrect password'})
            }
         } else {
            callback(400, {'Error': 'Could not find the specified user:'})
         }
      })
   } else {
      callback(400, {'Error': 'Missing required field(s)'});
   }
}

/**
 * @Tokens - get
 * @required data: token id
 * @optional data: none
 */
handlers._tokens.get = (data, callback) => {
   // Check that the id provided is valid
   const id = (typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.length == 20) ? data.queryStringObject.id.trim(): '';
   if(id) {
      // lookup for the token
      _data.read('tokens',id, (err, tokenData) => {
         if(!err && tokenData) {
            callback(200, tokenData);
         } else {
            callback(404);
         }
      })
   } else {
      callback(404, {'Error': 'Missing required field'})
   }
}

/**
 * @Tokens - put
 * @Required id, extend
 * @Optional data: none
 */
handlers._tokens.put = (data, callback) => {
   const id = (typeof(data.payload.id) == 'string' && data.payload.id.length == 20) ? data.payload.id.trim(): '';
   const extend = (typeof(data.payload.extend) == 'boolean' && data.payload.extend == true) ? true: false;
   if(id && extend) {
      // Lookup the token
      _data.read('tokens', id, (err, tokenData) => {
         if(!err) {
         // check that token has not yet expired
            if(tokenData.expires > Date.now()) {
               // Set the expiration to one hour from now
               tokenData.expires = Date.now() + 1000 * 60 * 60;
               
               // Store the new updates
               _data.update('tokens', id, tokenData, (err) => {
                  if(!err){
                     callback(200);
                  } else {
                     callback(500, {'Error': 'Could not update the token\'s expiration'})
                  }
               })
            } else {
               callback(400, {'Error': 'Token expired, cannot be suspected'})
            }
         } else {
            callback(400, {'Error': 'Specified token does not exist.'})
         }
      })
   } else {
      callback(404, {'Error': 'Missing required fields or fields are invalid'});
   }
}

/**
 * @Tokens - delete
 * @Required data: id
 * @Optional data: none
 */
handlers._tokens.delete = (data, callback) => {
   // Check that the id provided is valid
   const id = (typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.length == 20) ? data.queryStringObject.id.trim(): '';
   if(id) {
      // lookup for the token
      _data.read('tokens',id, (err, tokenData) => {
         if(!err && tokenData) {
            _data.delete('tokens', id, (err) => {
               if(!err){
                  callback(200);
               } else {
                  callback(500, {'Error': 'Could not delete token.'})
               }
            })
         } else {
            callback(404, {'Error': 'Could not find the token user'});
         }
      })
   } else {
      callback(404, {'Error': 'Missing required field'})
   }
}

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
   // lookup the token
   _data.read('tokens', id, (err, tokenData) => {
      if(!err && tokenData) {
         // check that the token is for the given user and has not expired
         if(tokenData.phone == phone && tokenData.expires > Date.now()){
            callback(true);
         } else {
            callback(false);
         }
      } else {
         callback(false);
      }
   })
}

/**
 * Check servcice
 */
handlers.checks = (data, callback) => {
   const acceptableMethods = ['post', 'get', 'put', 'delete'];
   if(acceptableMethods.indexOf(data.method) > -1){
      handlers._checks[data.method](data, callback);
   } else {
      callback(405);
   }
}


// Container for all the checks methods
handlers._checks = {};

/**
 * Checks - @POST
 * @Rquired data: protocol, url, method, successCodes, timeoutSeconds
 * @Optional data: none
 */
handlers._checks.post = (data, callback) => {
   const protocol = typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
   const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
   const method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
   const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
   const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5? data.payload.timeoutSeconds : false;
   
   console.log(protocol, url, method, successCodes, timeoutSeconds)
   if(protocol && url && method && successCodes && timeoutSeconds){
       // Get the token from the headers
       const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
       // lookup the user by reading the token
       _data.read('tokens', token, (err, tokenData) => {
          if(!err && tokenData){
            const userPhone = tokenData.phone;
            console.log('userPhone:', userPhone)

            // lookup the user data
            _data.read('users', userPhone, (err, userData) => {
               if(!err && userData) {
                  const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                  // verify that the user has less than the max check per user
                  if(userChecks.length < config.maxChecks) {
                     //create a random id for the check
                     const checkId = helpers.createRandomString(20);

                     // create the check object, and include the user's phone
                     const checkObject = {
                        'id': checkId,
                        userPhone,
                        protocol,
                        url,
                        method,
                        successCodes,
                        timeoutSeconds
                     }

                     // save the object
                     _data.create('checks', checkId, checkObject, (err) => {
                        if(!err) {
                           // Add the check id to the user's object
                           userData.checks = userChecks;
                           userData.checks.push(checkId);

                           // save the new user data
                           _data.update('users', userPhone, userData, (err) =>{
                              if(!err){
                                 // return the data about the new check
                                 callback(200, checkObject);
                              } else {
                                 callback(500, {'Error': 'Could not update the user with the new check'});
                              }
                           })
                        }else {
                           callback(500, {'Error': 'Could not create the new check.'});
                        }
                     })
                  } else {
                     callback(400, {'Error': 'Maximum number of checks exceeded ('+config.maxChecks+')'})
                  }
               } else {
                  callback(403, )
               }
            })
          } else {
             callback(403)
          }
       })
       
       
   } else {
      callback(400, {'Error': 'Missing required inputs, or inputs are invalid'});
   }
}

/**
 * Checks @get
 * @required data: id
 * @optional data: none
 */
handlers._checks.get = (data, callback) => {
   // Check that the phone number provided is valid
   const id = (typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.length == 20) ? data.queryStringObject.id.trim(): '';
   if(id) {

      // lookup the check
      _data.read('checks', id, (err, checkData) => {
         if(!err && checkData) {
            // Get the token from the headers
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

            // verify the validity of the token and belongs to user who create the check
            handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
               if(tokenIsValid) {
                 callback(200, checkData);
               } else {
                  callback(403)
               }
            })
         } else {
             callback(404);
         }
      })
   } else {
      callback(400, {'Error': 'Missing required field'})
   }
};

/**
 * Checks - @put
 * @required data: id
 * @optional data: protocol, url method, successCodes, timeoutSeconds( at least one)
 */

 handlers._checks.put = (data, callback) => {
   // Check for the required field
   const id = (typeof(data.payload.id) == 'string' && data.payload.id.length == 20) ? data.payload.id : '';
   // check for option fields
   const protocol = typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
   const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
   const method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
   const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
   const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5? data.payload.timeoutSeconds : false;
   
   if(id) {
      // check for one of the required fields
      if(protocol || url || method || successCodes || timeoutSeconds) {
         // Lookup the check
         _data.read('checks', id, (err, checkData) => {
            if(!err && checkData) {
            // Get the token from the headers
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

            // verify the validity of the token and belongs to user who create the check
            handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                  if(tokenIsValid) {
                     // Update the ckeck where necessary
                     if(protocol) checkData.protocol = protocol;
                     if(url) checkData.url = url;
                     if(method) checkData.method = method;
                     if(successCodes) checkData.successCodes = successCodes;
                     if(timeoutSeconds) checkData.timeoutSeconds = timeoutSeconds;

                     // Store the updates
                     _data.update('checks', id, checkData, (err) => {
                        if(!err){
                           callback(200);
                        } else {
                           callback(500, {'Error': 'Could not update the check.'})
                        }
                     })
                  } else {
                     callback(403)
                  }
             });

            } else {
               callback(400, {'Error':'Check ID did not exist'})
            }
         })
      } else {
         callback(400, {'Error': 'Missing fields to update'})
      }

   } else {
      callback(400, {'Error': 'Missing required field'})
   }
 }


 // ping handler
 handlers.ping = (data, callback) => {
    callback(200)
 }

 handlers.notFound = (data, callback) => {
    callback(404)
 }

 module.exports = handlers;