const express = require("express");
const joi = require("joi");
const mysql = require("mysql");
const bodyParser = require('body-parser')
const session = require("express-session");
const crypto = require("crypto");
const uuid = require("uuid");
const _ = require("lodash");

const {
  AddUser,
  getUserDetails,
  GetUserWebsites,
  AddWebsite,
} = require("./database");

const SECRETKEY = "245428ABF89C89E";
const SESSION_SECRETKEY = "workindiaSecretpassword@#123"
var app = express()

app.use(session({
  secret: 'ssshhhhh', saveUninitialized: true, resave: true, genid: function (req) {
    // return uuid.v1();
    return crypto.createHash('sha256').update(uuid.v1()).update(crypto.randomBytes(256)).digest("hex");
  },
}));
// app.use(session({
//   secret: SESSION_SECRETKEY,
//   resave: true,

//   saveUninitialized: true,
//   cookie: {
//     secure: true,
//     path: "/",
//     httpOnly: false,
//     maxAge: 60*60,
//   },
//   genid: function (req) {
//     return uuid.v1();
//     // return crypto.createHash('sha256').update(uuid.v1()).update(crypto.randomBytes(256)).digest("hex");
//   },
// }));

app.use(bodyParser.urlencoded({ extended: false }))

function hashPassword(password) {
  let md5sum = crypto.createHash('md5');
  let hashPass = md5sum.update(password).digest("hex");
  return hashPass;
}

// Encrypt user website password with the master password (user login password)
function encryptWebsitePassword(password, masterPassword) {
  let mykey = crypto.createCipher('aes-128-cbc', masterPassword + SECRETKEY);
  let mystr = mykey.update(password, 'utf8', 'hex')
  mystr += mykey.final('hex');
  return mystr;
}

// Decrypt user website password with help of master password
function decryptWebsitePassword(encPassword, masterPassword) {
  let mykey = crypto.createDecipher('aes-128-cbc', masterPassword + SECRETKEY);
  let mystr = mykey.update(encPassword, 'hex', 'utf8')
  mystr += mykey.final('utf8');
  return mystr;
}

// middleware
function validateUserCredentials(req, res, next) {
  const userValidator = joi.object({
    username: joi.string().alphanum().min(6).max(255).required(),
    password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  });

  const { error, value } = userValidator.validate({
    username: req.body.username,
    password: req.body.password,
  })

  if (error) {
    console.log(error);
    return res.status(400).send("Error: Invalid username or password format");
  }

  next();
}

app.use((req, res, next) => {
  console.log("PATH: " + req.path);
  console.log("SESSION: ");
  console.log(req.session.user);
  next()
})

function validateWebsiteData(req, res, next) {
  const websiteValidator = joi.object({
    website: joi.string().pattern(new RegExp("^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$")).required(),
    username: joi.string().required(),
    password: joi.string().required(),
  });
  const { error, value } = websiteValidator.validate({
    website: req.body.website,
    username: req.body.username,
    password: req.body.password,
  })

  if (error)
  return res.status(400).send("Error: Invalid data");

  next();
}
// TODO: Complete this
function isAuthenticated(req, res, next) {
  console.log("AUTH:");
  if (req.session != undefined && req.session.user != undefined) {
    console.log(req.session);
    console.log(req.session.user);
    console.log("NEXT");
    return next();
  }
  return res.status(401).send("Unauthorized!");
}

// create new user
app.post("/app/user", validateUserCredentials, async function (req, res) {
  const user = {
    username: req.body.username,
    password: hashPassword(req.body.password),
  }

  console.log(user);

  try {
    await AddUser([user.username, user.password]);
  }
  catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }

  // TODO: CALL mysql

  req.session.user = user;

  console.log(req.session);

  return res.status(200).json({ success: "account created" });
});

// authenticate user
app.post("/app/user/auth", validateUserCredentials, async function (req, res) {

  // hash the password

  let user = {
    username: req.body.username,
    password: hashPassword(req.body.password),
    sessionId: req.sessionID,
  }


  let userDetails = await getUserDetails(user.username);

  if (userDetails == undefined || user.password != userDetails[0].password)
    return res.status(404).send("Error: Username or password invalid!");

  // req.session.user = user;
  req.session.user = user;
  return res.status(200).json({
    status: 'success',
    userId: req.session.user.sessionId,
  });
});

app.get("/app/sites/list", isAuthenticated, async function (req, res) {
  if (req.query.userId != req.session.user.sessionId)
    return res.status(401).send("UserId and session dont match!");

  // TODO: get list from mysql
  let list = await GetUserWebsites(req.session.user.username);
  list = list[0]
  for(let i=0; i<list.length; i++){
    console.log(list[i]);
    list[i].password = decryptWebsitePassword(list[i].password, req.session.user.password);
  }

  return res.status(200).json(list);
});

app.post("/app/sites", isAuthenticated, validateWebsiteData, async function (req, res) {
  if (req.query.userId != req.session.user.sessionId)
    return res.status(401).send("UserId and session dont match!!");

  const data = {
    website: req.body.website,
    username: req.body.username,
    password: encryptWebsitePassword(req.body.password, req.session.user.password),
  }

  console.log(data);
  try{
    await AddWebsite([data.website, data.username, data.password, req.session.user.username]);
  }
  catch(err){
    console.log(err);
    return res.status(500).json(toString(err));
  }

  return res.status(200).json({ status: 'success' })
});


app.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) console.log(err);
    res.status(200).send("Logged out!");
  })
})

app.listen(3000, function () {
  console.log("Server running");
})