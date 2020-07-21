let mysql = require('mysql');
let config = require('./config.js');



// Add new user
function AddUser(data) {
  let connection = mysql.createConnection(config);
  return new Promise((resolve, reject) => {
    console.log("CONN: " + connection);

    connection.query("CALL AddUser(?, ?)", data, function (err, result) {
      if (err) return reject(err);
      resolve(result);
    })
    connection.end();

  });
}

// Get username and password
function getUserDetails(data) {
  return new Promise((resolve, reject) => {
    let connection = mysql.createConnection(config);
    connection.query("CALL GetUser(?)", data, function (err, result) {
      if (err) return reject(err);
      resolve(result[0]);
    })
    connection.end();
  });
}

// Get user websites
function GetUserWebsites(data) {
  return new Promise((resolve, reject) => {
    let connection = mysql.createConnection(config);
    connection.query("CALL GetUserWebsites(?)", data, function (err, result) {
      if (err) return reject(err);
      resolve(result);
    })
    connection.end();
  });
}

// Add a new website
function AddWebsite(data) {
  return new Promise((resolve, reject) => {
    let connection = mysql.createConnection(config);
    connection.query("CALL AddWebsite(?,?,?,?)", data, function (err, result) {
      if (err) return reject(err);
      resolve(result);
    })
    connection.end();
  });
}

module.exports = {
  AddUser,
  getUserDetails,
  GetUserWebsites,
  AddWebsite,
}