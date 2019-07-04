/**
 * Create and export config variables
 * 
 */

 // Container for all the environments
 const environments = {};

 // staging [default] environment
 environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging'
 };

 // Production environment
 environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production'
 }

 // determine with to export as was passed in the cmd
 const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

 //check that valid enviroment is supplied
 const envToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;


 module.exports = envToExport;