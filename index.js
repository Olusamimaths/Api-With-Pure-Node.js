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
    req.on('end', () => {
        buffer += decoder.end();

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
     'sample': handle.sample
 }
