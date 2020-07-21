let mysql = require('mysql');
let config = require('./config.js');
const { reject } = require('lodash');



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