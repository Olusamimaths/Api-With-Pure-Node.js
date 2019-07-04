/**
 * Libray for storing and editing data
 * 
 */

 const fs = require('fs');
 const path = require('path');

 const lib = {};

 // base directory of the data folder
 lib.baseDir = path.join(__dirname, '/../.data/');

 lib.create = (dir, file, data, callback) => {
     // Open the file for writing
     fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', (err, filleDescriptor) => {
         if(!err && filleDescriptor) {
            // Convert dat to string
            const stringData = JSON.stringify(data);

            // write to file and close it
            fs.writeFile(filleDescriptor, stringData, (err) => {
                if(!err){
                    fs.close(filleDescriptor, (err) => {
                        if(!err){
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    })
                } else {
                    callback('Error writing to new file')
                }
            });
         } else {
             callback('Could not create new file, it may already exist')
         }
     })
 }



 module.exports = lib;