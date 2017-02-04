# Developer Guide

### System Architecture
Our web app is built using Node.js, with an Express backend and a ReactJS frontend. The server and client are run on separate ports, with the server just being a REST API. The client can make HTTP calls to our API for the basic CRUD operations (GET, POST, PUT, DELETE) to update and get information from our database. The server authenticates the client using tokens, which will be explained later.

### Backend Architecture
Our backend API is solely used as a REST API, and does not render any pages back to the user. With Express, we created different endpoints which then pull data from our database and return it as JSON for the response.

We used MongoDB for our database, because it’s the most supported Node database, integrates much better with the Javascript language than relational databases due to its JSON format, and allows us to nest objects like tags or instances within items. Since MongoDB doesn’t validate any of its objects, we coupled it with Mongoose to create schemas for our database. This library allowed us to declare required properties, add validators, and run optimized queries. When a request for objects is made, it runs a query to Mongoose. When a request to create objects is made, a Mongoose object is created and saved to the database.

We also protected our backend using Passport, Bcrypt and JSON Web Tokens. To create a new user, its password is salted and hashed using Bcrypt and saved as a user in our database. We then use JSON Web Tokens (JWT) to sign a user and return it as a token to the client. Passport can then protect an endpoint as middleware and parse the token to authenticate and return the user object.

We have our endpoints set up such that anything past “/api/” is protected by authentication, and requires the JWT token in the request header. The user can hit “/auth/login” to obtain the token. We also protected certain API endpoints to admin users by checking the user’s admin status passed in the token.

We have additionally protected communication with our backend with an SSL certificate. Both our client and our server use Let’s Encrypt SSL certificates to encrypt every request between the server and client.

### Frontend Architecture
Our frontend is build purely in ReactJS. We use the react-scripts library to automate certain parts of the app, like running the app in development mode and optimizing the app through a build step. When run in production, the app is optimized into a build directory and then it’s served as a static folder with Express.

The frontend uses the React Router library to create URL routes like “/inventory”. It also uses a library called Axios to make HTTP calls to the backend server. Axios is setup with a URL and a header, and requests can be made to a certain endpoint and returned asynchronously to the client.

### Running the App
Our app can be run in development or production mode. In each mode, the API and client have to be run separately.

To run development mode, run:

> npm run start-dev

This will run the client with react-scripts, which allows the developer to edit files and then the client will be rerun with the new code. The server is run with nodemon, which also allows the developer to change the folder and it will be reloaded.

To run production mode, run

> npm run start-prod

This first builds the client code with react scripts. Then, it uses ForeverJS to run the client and server in the background at all times. It will not rerun if code is updated.

### Database Schema
Here is a UML for our database:

![alt text](https://github.com/tomrom95/ece_inventory/tree/master/guides/uml.png "UML Diagram")

To take advantage of MongoDB’s embedded objects, we could have each item store an array of Tag strings and an array of Instance objects. This way we avoid joins to return tags or instances for an item. Requests use foreign keys to connect it with items and users. We took advantage of Mongoose’s ‘populate’ function to populate the foreign key fields with the actual object in a query.
