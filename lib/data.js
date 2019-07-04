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


 // read data from a file
 lib.read = (dir, file, callback) => {
     fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', (err, data) => {
         callback(err, data);
     })
 }

 // update data inside a file
 lib.update = (dir, file, data, callback) => {
     // open the file to write to
     fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, filleDescriptor) =>{
         if(!err && filleDescriptor) {
             // convert the data to string
            let stringData = JSON.stringify(data);
             fs.ftruncate(filleDescriptor, (err) => {
                 if(!err) {
                    // Write to the file and close it
                    fs.writeFile(filleDescriptor, stringData, (err) => {
                        if(!err){
                            fs.close(filleDescriptor, (err) => {
                                if(!err){
                                    callback(false)
                                } else {
                                    callback('Error closing the file.')
                                }
                            })
                        } else {
                            callback('Error writing to existing file')
                        }
                    })
                 } else {
                    callback('Error truncating file') 
                 }
             })
         } else {
             callback('Could not open the file for updating, it may not exist yet')
         }
     })
 }


 module.exports = lib;