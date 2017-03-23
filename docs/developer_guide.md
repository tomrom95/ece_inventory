# Developer Guide

## About the system
Our web app is built using Node.js, with an Express backend and a ReactJS frontend. The server and client are run on separate ports, with the server just being a REST API. The client can make HTTP calls to our API for the basic CRUD operations (GET, POST, PUT, DELETE) to update and get information from our database. The server authenticates the client using tokens, which will be explained later.

### Backend Architecture
Our backend API is solely used as a REST API, and does not render any pages back to the user. With Express, we created different endpoints which then pull data from our database and return it as JSON for the response.

We used MongoDB for our database, because it’s the most supported Node database, integrates much better with the Javascript language than relational databases due to its JSON format, and allows us to nest objects like tags or instances within items. Since MongoDB doesn’t validate any of its objects, we coupled it with Mongoose to create schemas for our database. This library allowed us to declare required properties, add validators, and run optimized queries. When a request for objects is made, it runs a query to Mongoose. When a request to create objects is made, a Mongoose object is created and saved to the database.

We have additionally protected communication with our backend with an SSL certificate. Both our client and our server use Let’s Encrypt SSL certificates to encrypt every request between the server and client.

### Authentication

We protected our backend using Passport, Bcrypt and JSON Web Tokens. To create a new user, its password is salted and hashed using Bcrypt and saved as a user in our database. We then use JSON Web Tokens (JWT) to sign a user and return it as a token to the client. Optionally, a user can use the apikey returned from logging in to authenticate themselves. Passport can then protect an endpoint as middleware and parse the token to authenticate and return the user object.

Users can also sign in with a Duke Net ID. To do this, an OAuth token from Duke is sent to the backend, and is used to identify the user. then the user is saved and returned like with the username/password method. The site https://appmanager.colab.duke.edu/ can be used to register an app, and is explained more in the deployment guide

We have our endpoints set up such that anything past “/api/” is protected by authentication, and requires the JWT token or an apikey in the request header. The user can hit “/auth/login” to obtain the token and apikey. We also protected certain API endpoints to admin users by checking the user’s admin status passed in the token.

### Frontend Architecture
Our frontend is built purely in ReactJS. We use the react-scripts library to automate certain parts of the app, like running the app in development mode and optimizing the app through a build step. When run in production, the app is optimized into a build directory and then it’s served as a static folder with Express.

The frontend uses the React Router library to create URL routes such as “/inventory”. It also uses a library called Axios to make HTTP calls to the backend server. Axios is setup with a URL and a header, and requests can be made to a certain endpoint and returned asynchronously to the client.

The rendering of elements is divided into two parts: a Home element and its children elements. The main component of the Home page is the navigation bar, whose elements are determined by the user's privilege status. The Home element passes the necessary props to its child components, which make up all the possible pages for all users. We use web browsers' local storage functionality to store necessary user information, such as their token and privilege level, and the latter is fetched and parsed at the render level of these components to determine what features are to be shown to the user. Certain pages to which a standard or manager-level user does not have access will return a message of denied access if the user tries to manually reach them by manually typing in the URL.

A widely-used pattern in our frontend development is the rendering callback. Many of our React components have a particular callback function passed in as a prop, which updates their respective parent elements, which in turn pass them down new props. The new props are intercepted and trigger a re-rendering of the lower level component. This allows for instant re-rendering without manual refreshing. The state of a component is only ever updated with the setState() function, and render() is never called manually -- instead, Render is automatically called by React when the state of an element is updated.

Our design makes heavy use of Bootstrap modals. These modals are typically rendered simultaneously with their containers, and only their visibiliy is toggled when they are clicked. This means that larger components, such as the inventory table, often take longer to render than smaller ones because they would contain other components, namely modals. On the other hand, components rendered in modals (a sizeable portion of our user interface) are wonderfully responsive because their toggling would not typically trigger API calls to the server.

The main parts of the application are divided into folders, such as inventory, requests, and logging. All components specific to a particular feature will be found only in their respective subfolder located in the "src/components" folder.

Components that are utilized throughout the entire project are located inside "src/components/global". These components include PaginationContainer and NavBar, which are reused extensively. While other components exist that are as widely used in our project, we opted to place them intuitively in directories that would make for easier access. For instance, the UserSelect component, which is used in multiple other components, is located in "src/components/user" due to the similarity in naming between the component and that directory.

The components of interest in this application are GlobalRequests, CurrentOrders, Inventory, and LogPage, which all use PaginationContainer to render their respective table components, RequestTable, InventoryTable, and LogTable respectively. The former components create an instance of PaginationContainer within them, which is passed a processData() method among other props.

### Database Schema
Here is a UML for our database:

![alt text](https://github.com/tomrom95/ece_inventory/blob/master/docs/uml.png?raw=true "UML Diagram")

To take advantage of MongoDB’s embedded objects, we could have each item store an array of Tag strings and an array of Instance objects. This way we avoid joins to return tags or instances for an item. Requests use foreign keys to connect it with items and users. We took advantage of Mongoose’s ‘populate’ function to populate the foreign key fields with the actual object in a query.

## Running the App
Our app can be run in development or production mode. In each mode, the API and client have to be run separately.

To run development mode, run:

> npm run start-dev

This will run the client with react-scripts, which allows the developer to edit files and then the client will be rerun with the new code. The server is run with nodemon, which also allows the developer to change the folder and it will be reloaded.

To run production mode, run

> npm run start-prod

This first builds the client code with react scripts. Then, it uses ForeverJS to run the client and server in the background at all times. It will not rerun if code is updated.

## Developing the App
Here we will describe how to change the app to fit your needs

### Endpoints
We have organized our API in a simple folder structure. If you go to /server/router you can find the two main routes, /api and /auth. /auth only has routes associated to logging in, and every other protected endpoint is in /api.

In each directory there is a router file which names the routes and connects them to the corresponding method to deal with the request. We also built custom middleware to check the authentication status of the user. All that needs to be added is `restrictToManagers` or `restrictToAdmins` in the route before the route handler. For example:

```javascript
router.route('/inventory')
      .get(inventory_routes.getAPI)
      .post(restrictToManagers, inventory_routes.postAPI);
```

Then, in the routes folder, all of our endpoints are stored. Each base endpoint has its own file, and follows the simple convention to name any exported method either getAPI, getAPIById, postAPI, putAPI, deleteAPI, or patchAPI.

If you would like to add any endpoint, just add a new file to the routes directory, import it into the router file, and specify the endpoints and authentication level.

### Schemas
All of our database schemas are located in /server/model. Our schemas all use Mongoose for validation. You can use the `mongoose.Schema()` method to create the schema and `mongoose.model('ObjectName', ObjectSchema)` to then register a model in the database.

It is important to note that use of the mongo shell may be necessary to edit a schema. Mongo will store old data if a field is removed, or old indexes if you remove a unique field. To use the shell, in terminal, type

> mongo

and the shell will pop up. Then in the shell type

> use inventory

to access our database. If, say, you wanted to remove a stale field like "location", you could type

> db.items.update({location:{$ne:null}}, {$unset: {location:""}}, {multi:true})

More major changes to a schema may require dropping the collection and reinserting the database. You can drop a collection by typing

> db.items.drop()

Mongoose models can be queried using the .find() command. They use JSON objects as query filters and query projections like this one, to find all items with a quantity less than 10 to restock and only return the names:

```javascript
Item.find({quantity: {$lt: 10}}, {name: 1}, callback);
```

Mongoose models can also populate foreign keys. If say, you want to return the referenced items in a request, you can add `.populate('items.item', 'name')` to the query.

### Authentication
Most authentication methods can be found in /server/auth/auth_helpers.js. Most information about authentication was described before. You can see in this file we use the `bcrypt` library to hash passwords and `JWT` to for user token authentication. We also store apikeys for each user. For this, we use the `uuid` package to create a unique key for each user to use as their apikey.

Setting up passport is done in server.js and the auth routes are found in /server/router/auth.
