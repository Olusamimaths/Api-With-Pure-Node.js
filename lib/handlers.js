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

};

// users delete
handlers._users.delete = (data, callback) =>{

};



 // ping handler
 handlers.ping = (data, callback) => {
    callback(200)
 }

 handlers.notFound = (data, callback) => {
    callback(404)
 }

 module.exports = handlers;