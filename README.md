# ece_inventory

To install:

1) Start up an oit vm - https://vm-manage.oit.duke.edu/. Ubuntu 16.04 is recommended
2) Make sure you install node and npm - https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions .
You may need to download curl using "sudo apt-get install curl"
3) Install mongodb - https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/ .
4) Make user admin in mongodb. Use these steps:

Enter mongo shell
 > mongod --shell
 
Switch to inventory database
 > use inventory
 
Create admin user
 > db.createUser({user:"admin", pwd:"ece458duke",roles:["readWrite","dbAdmin"]})
 
Check if you're authenticated (should return 1)
> db.auth("admin", "ece458duke")

5) Download some extra global node packages
> sudo npm install -g pushstate-server
> sudo npm install -g create-react-app
6) Install Git (sudo apt-get git), download our repo, change into repo directory
7) Download app packages
> sudo npm install
8) Run in development using
> npm run start-dev
Run in production using
> npm run start-prod
