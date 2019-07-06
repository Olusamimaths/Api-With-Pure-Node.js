/**
 * Request handlers
 * 
 */

 const _data = require('./data');
 const helpers = require('./helpers')

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
 * Users post
 * Required data: firstName, lastName, phone, password, tosAgreement
 * Optional data: none
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
 * User get
 * required data: phone
 * optional data: none
 * TODO: Only let an authenticated user access their object. Don't let them access anyone else's
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
 * Users - Put
 * required data: phone
 * optional data: firstName, lastName, password (at least one)
 * TODO: authenticate before updating
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
      }
   } else {
      callback(400, {'Error': 'Missing required field'})
   }
};

/**
 * Users - Delete
 * required: phone
 * @TODO: authenticate before deletion
 * @TODO: Delete associated data with the user
 */
handlers._users.delete = (data, callback) =>{
      // Check that the phone number provided is valid
      const phone = (typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length == 11) ? data.queryStringObject.phone.trim(): '';
      if(phone) {
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
 * Tokens - post
 * required data: phone and password
 * optional data: none
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
 * Tokens - get
 * required data: token id
 * optional data: none
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
 * Tokens - put
 * Required: id, extend
 * Optional data: none
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
 * Tokens - delete
 * Required data: id
 * Optional data: none
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
handlers._tokens.verifyToken = (id, phone, callback) {
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

 // ping handler
 handlers.ping = (data, callback) => {
    callback(200)
 }

 handlers.notFound = (data, callback) => {
    callback(404)
 }

 module.exports = handlers;