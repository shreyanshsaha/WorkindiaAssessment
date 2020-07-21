
# Installation

```npm install```

# Execution
```npm start```

Server will run at localhost:300

**For outputs refer the pdf**

# Requirements
1. Creating new user

The route to create new user works and the password is stored as hash format.

It returns 'account created'

2. Authenticate User

The hash of the password is authenticated for the user. If the match, a session is created for the user and userID is returned.

3. Add Website Password

An authenticated user can add a website and that website will be encrypted with user login password + secret key

4. Retrieve websites

An authenticated user can retieve lists with decrypted passwords
