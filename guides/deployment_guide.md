To install:

1) Start up an oit vm - https://vm-manage.oit.duke.edu/. Ubuntu 16.04 is recommended

2) Make sure you install node and npm - https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions .
You may need to download curl using "sudo apt-get install curl"

3) Install mongodb - https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/ .

4) Make user admin in mongodb. Use these steps:

If you haven't already, start mongo
 > sudo service mongod start

Enter mongo shell
 > mongod --shell

Switch to inventory database
 > use inventory

Create admin user
 > db.createUser({user:"admin", pwd:"ece458duke",roles:["readWrite","dbAdmin"]})

Check if you're authenticated (should return 1)
> db.auth("admin", "ece458duke")

5) Download some extra global node packages
> sudo npm install -g forever

> sudo npm install -g create-react-app

> sudo npm install -g mocha

6) Install Git (sudo apt-get git), download our repo, change into repo directory

7) Download app packages
> sudo npm install

8) Install SSL certificates for your web server. We are using LetsEncrypt, but you can use any other SSL provider.

If you use another SSL provider, please copy the key.pem and cert.pem files into the root directory of the project.

If you use LetsEncrypt, first install the package:
> sudo apt-get install letsencrypt

Create a certificate
> sudo letsencrypt certonly --standalone -d YOUR_VM_URL

For example, this for our production vm is
> sudo letsencrypt certonly --standalone -d colab-sbx-186.oit.duke.edu

This will create a certificate (as cert.pem) and key (as privkey.pem), and will output the directory where they're saved.
Usually this directory is /etc/letsencrypt/live/YOUR_VM_URL/

Copy these files into your project's root directory. Make sure to use root access to do this (run `sudo su`). Also make sure you rename privKey.pem to key.pem when you copy it.

9) [Optional] Run our setup script. This will create an inventory admin and populate some example data.
> node scripts/setupdb.js

10) [Optional] If you would like the app to work with NetID login, you need to register the app at the [colab app manager site](https://appmanager.colab.duke.edu/). Because we have been developing this system on many devices, we use a naming convention to match the server to the corresponding app ID. With the Duke Virtual Machines, since they all have the pattern colab-sbx-###, we give our apps the app ID ece-inventory-colab-sbx-### and the url being the base HTTP url. Since production is run on SSL, you also need to add another app with the HTTPS address and the app ID ece-inventory-colab-sbx-###-https.

Note that we can match the app id with any url you choose. If your site is www.DOMAIN.duke.edu or www.DOMAIN.com then your app ID should be ece-inventory-DOMAIN or ece-inventory-DOMAIN-https.

11) Run in development using
> npm run start-dev

Run in production using
> npm run start-prod
