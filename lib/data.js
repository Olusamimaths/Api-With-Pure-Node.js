/**
 * Libray for storing and editing data
 * 
 */

 const fs = require('fs');
 const path = require('path');
 const helpers = require('./helpers');

 const lib = {};

 // base directory of the data folder
 lib.baseDir = path.join(__dirname, '/../.data/');

 /**
  * @Create
  * @params  string: destinationd irectory,string:file name,object: data to write into file, function: callback sent after creating
  */
 lib.create = (dir, file, data, callback) => {
     // Open the file for writing
     // flag 'wx' - Open file for writing. The file is created (if it does not exist) or truncated (if it exists), fails if the path exists.
     fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', (err, fileDescriptor) => {
         if(!err && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if(!err){
                    fs.close(fileDescriptor, (err) => {
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


 /**
  * @Read
  * @params  string: destination directory,string:file name, function: callback sent after creating
  */
 lib.read = (dir, file, callback) => {
     fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', (err, data) => {
        // parse from string to object
        if(!err){
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }            
     })
 }

  /**
  * @Update
  * @params  string: destination directory,string:file name,object: data to write into file, function: callback sent after creating
  */
 lib.update = (dir, file, data, callback) => {
     // open the file to write to
     // 'r+' - Open file for reading and writing. An exception occurs if the file does not exist.
     fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor) =>{
         if(!err && fileDescriptor) {
             // convert the data to string
            let stringData = JSON.stringify(data);
            // clear the file first
             fs.ftruncate(fileDescriptor, (err) => {
                 if(!err) {
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if(!err){
                            fs.close(fileDescriptor, (err) => {
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


  /**
  * @Delete
  * @params  string: destination directory,string:file name, function: callback sent after creating
  */
 lib.delete = (dir, file, callback) => {
     // Unlink the file
     fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err) => {
         if(!err){
             callback(false);
         } else {
             callback('Error deleting file, it may not exist.')
         }
     })
 }


 module.exports = lib;