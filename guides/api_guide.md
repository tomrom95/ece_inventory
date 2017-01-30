How to use the backend REST API

1) Make sure you run the db setup script

> node scripts/setupdb.js

1) Run your server

> npm run start-prod

2) To test out the API, you'll need something to contact the API with. You can use
Postman (a chrome extension for making http calls) or the library Axios in ReactJS
(which is the library from the tutorial we have been using)

3) All of the endpoints starting with /api are protected by authentication. To
bypass this, you need a token for your user by logging in. This requires hitting
the /auth/login endpoint. So make a POST request to https://yourvmdomain:3001/auth/login.
The API is running on Port 3001 with HTTPS, so be careful to get this right.

The POST needs 2 body parameters: username and password. When you ran the setupdb
script, you created a user called "admin" with the password "ece458duke" so use
this information.

4) When the call is made, you should get a token returned to you that starts with
"JWT ". You can see what is specifically returned in the api contract. Copy this
token for the next step.

5) This token will be used for authentication. So, now let's make a GET call to
https://yourvmdomain:3001/api/inventory. This requires no body parameters, but it
needs a header. So set a header with the key "Authorization" and the value being
the token you got from before (without the quotation marks).

6) You should get a JSON object representing all the inventory items. If it says
unauthorized, then your token was copied incorrectly.
