API Guide
===================

The production server is located at https://colab-sbx-186.oit.duke.edu. Note that all API endpoints communicate via HTTPS.

The parameters, body and expected return payloads are all specified in the API contract.

[API Contract](https://colab-sbx-186.oit.duke.edu/docs/api_contract.txt)
==

How do I issue requests to the API?
-------
You will need a program to contact the API with. You can use
[Postman](https://www.getpostman.com/) (a chrome extension for making https calls with an easy to use GUI) or the library [Axios](https://github.com/mzabriskie/axios) in ReactJS, which involves writing code to perform API requests.

####Postman
1) In Postman, near the top of the screen, you will see a dropdown with key words such as GET, POST, PUT etc. Choose an action to denote the type of API you would like to make.

2) To the right of the dropdown, is the textbox to enter the URL. You will need to enter the production server URL: https://colab-sbx-186.oit.duke.edu followed by the relevant route as shown in the API contract.

3) If you are using a GET method, you have the option of adding queryable fields to the URL (depending on the fields supported in the contract), but following the url with a "?", followed by the query field and value with '"&" between query field-value pairs. This is an example URL:

    https://colab-sbx-186.oit.duke.edu/api/inventory?name=1k&vendor_info=IBM

4) If you are using a POST, PUT or PATCH method, or any API call listed in the contract that requires the filling out of a body, hit the tab "Body" directly under the URL box to enter the field-value parameters. Make sure the option of "x-www-form-urlencoded" is selected. If you are using the "raw" option, make sure that in the drop down next to "binary", the option "JSON" is selected.

5) You will need to obtain an API Key to enter into the header, such that the backend system can authorize and authenticate the user account making the request to the API endpoint. The section about obtaining API Key will explain how to do this.

6) You will need to include in the header (under the tab "Headers") the following header:

    Key: "Content-Type",
    Value: "application/x-www-form-urlencoded"

7) Once all the above steps are completed, simply hit the blue button "Send" and you will get a response.


What is the format of these requests?
----

The format of these requests are all in JSON format. All methods requiring a body will expect a JSON object as a body payload. As described in Step 4 of using Postman, you can either enter these as field-value pairs into the "x-www-form-urlencoded" form, or as a raw JSON object or array of JSON objects. This is an example request body if a raw JSON body is entered:
`
{
					    "quantity": 900,
					    "vendor_info": "IBM",
}
`

To what URL do they go (if web-based)?
---
The base URL for the production server is `https://colab-sbx-186.oit.duke.edu` . Different routes are appended to the end of this URL depending on the API endpoint that you wish to test.

What is the format of responses?
---
All responses are in the form of JSON objects or an array of JSON objects. This is an example response:

      {
			    "_id": "58adb3b605bd0609ef8dd919",
			    "__v": 0,
			    "quantity": 900,
			    "name": "1k resistor",
			    "vendor_info": "IBM",
			    "is_deleted": false,
			    "custom_fields": [],
			    "is_asset": false,
			    "tags": [
			      "component",
			      "electric",
			      "cheap"
			    ]
  }

Where do I get an API key?
---
All of the endpoints starting with /api are protected by authentication. To get an API key to be authorised and authenticated, you need an API key for your user by logging in.

1) You will want to make a POST request to the `/auth/login` endpoint. The production server URL is `https://colab-sbx-186.oit.duke.edu/auth/login`.  Enter this URL into the Postman URL box.

2) In the post body, you will need to enter the following field-value pairs:

    "username": *your username*
    "password": *your password*

	The default username/password combination is:

    "username": admin
    "password": ece458duke

3) When the call is made, you should get an object returned to you. The API key is located within the "user" object" in the field "apikey".  Copy this api key for the next step.

Note: If you get an error of "User does not exist" with admin/ece458duke combination, this means the setup script was not run before the system was deployed. To do this, navigate in Terminal to the root directory of the repository, and enter `node scripts/setupdb.js`. Then enter `npm run start-prod` to start the server.

4) This API key will be used for authentication. With any call you make to an API endpoint with the base `/api`, you will need to enter this API key. Set a header with the key `Authorization` and the value being the API key you got from before.

5) You should get an authenticated response. If it says `Unauthorized`, then your token was copied incorrectly.
