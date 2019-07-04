/**
 * Primary file for the API
 */

 const http = require('http');
 const url = require('url');
 const StringDecoder = require('string_decoder').StringDecoder;

 // Respond to all requests with a string
 const server = http.createServer((req, res) => {

     // get the url and parse it
     // url comes from the req
     let parsedUrl = url.parse(req.url, true);

    // get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/*|\/+$/g, '');

    // get the query string as an object
    const query = parsedUrl.query;

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
         'queryStringPath': query,
         method,
         headers,
         payload: buffer
     }

     // Route the request to the handler
     // args to handler are data and a callback func
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
     })

    // send the response
    res.end('Hello World \n');

    // log the payload
     console.log(`Request recieved with these payload`, buffer)
        
    });



 })



 // Start the server
 server.listen(3000, () => console.log('The server is listening on port 3000'))

 // define the handlers

 let handlers = {};

 handlers.sample = (data, callback) => {
    // Callback a http status code and a payload object
    callback(406, {'name': 'sample handler'})
 }

 handlers.notFound = (data, callback) => {
    callback(404)
 }

 //define the request router
 const router = {
     'sample': handlers.sample
 }
