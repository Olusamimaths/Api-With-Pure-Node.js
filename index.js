/**
 * Primary file for the API
 */

 const http = require('http');
 const https = require('https');
 const url = require('url');
 const StringDecoder = require('string_decoder').StringDecoder;
 const config = require('./config');
 const fs = require('fs');
 const handlers = require('./lib/handlers');
 const helpers = require('./lib/helpers');

 // instantiate http server
 const httpServer = http.createServer((req, res) => {
     unifiedServer(req, res);
 })

 // Start the httpServer
 httpServer.listen(config.httpPort, () => console.log(`The server is listening in port ${config.httpPort} in ${config.envName} mode`))

 // instantiate the https server
 const httpsServerOptions = {
     'key': fs.readFileSync('./https/key.pem'),
     'cert': fs.readFileSync('./https/cert.pem')
 }
 const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
})


 // start the https server
 httpsServer.listen(config.httpsPort, () => console.log(`The server is listening in port ${config.httpsPort} in ${config.envName} mode`))

 // All server logic for both https and http
 const unifiedServer = (req, res) => {

     // get the url and parse it
     // url comes from the req
     let parsedUrl = url.parse(req.url, true);

    // get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/*|\/+$/g, '');

    // get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // get the payloa, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    // write the decoder data to the before
    req.on('data', (data) => {
        // the data is in an unreadable format, decode it
        buffer += decoder.write(data);
    })
    // after buffering
    req.on('end', () => {
        buffer += decoder.end();

        // choose the handler
        const choosenHandler = typeof(router[trimmedPath])  !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // construct the data object to send to the handler
     let data = {
         trimmedPath,
         queryStringObject,
         method,
         headers,
         payload: helpers.parseJsonToObject(buffer) 
     }

     // Route the request to the handler
     // args to handler are data and a callback func
     // this is a function call!!!
     choosenHandler(data, (statusCode, payload) => {
        // use handler's status code or default 200
        statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

        // use the handler's payload or default empty object
        payload = typeof(payload) === 'object' ? payload: {};

        // convert the payload to a 
        let payloadString = JSON.stringify(payload);
        
        // Return the response
        res.setHeader('Content-type', 'application/json')
        res.writeHead(statusCode);
        res.end(payloadString)

        // log the request path
        console.log('Returning this response ', statusCode, payload);
     });

    // send the response
    //res.end('Hello World \n');

    // log the payload
     console.log(`Request recieved with these payload`, buffer)
        
    });

 }

 
 //define the request router
 const router = {
     'ping': handlers.ping,
     'users': handlers.users,
     'tokens': handlers.tokens
 }
