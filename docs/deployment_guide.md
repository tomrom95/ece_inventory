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
> sudo npm run start-dev

When in development mode, you can find your site at:
http://YOUR_VM_URL:3000
The frontend is hosted on a different port here to allow for some of our development
tools

Run in production using
> sudo npm run start-prod

When in production mode, you can find your site at:
https://YOUR_VM_URL

Note that sudo is used here because we are running the server on port 443, which
requires root access.

12) [Optional] You can also setup our code to run with a reverse proxy server, Nginx.
This setup will mostly follow [these steps](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04#set-up-nginx-as-a-reverse-proxy-server). So, first install Nginx:

> sudo apt-get install nginx

Open the nginx server configuration:

> sudo nano /etc/nginx/sites-available/default

Replace the file with this configuration:

```
server {
        listen 443;
        server_name YOUR_VM_URL;

        ssl on;
        # Use certificate and key provided by Let's Encrypt:
        ssl_certificate /etc/letsencrypt/live/YOUR_VM_URL/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/YOUR_VM_URL/privkey.pem;
        ssl_session_timeout 5m;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_prefer_server_ciphers on;
        ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';

        location / {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-NginX-Proxy true;
                proxy_pass http://localhost:3001/;
                proxy_ssl_session_reuse off;
                proxy_set_header Host $http_host;
                proxy_cache_bypass $http_upgrade;
                proxy_redirect off;
        }
}
```

Replace any instance of YOUR_VM_URL with your vm url. Save the file. Restart nginx using:

> sudo systemctl restart nginx

Once nginx is set up, you need to tell our server to use a different port, since
nginx is using 443. So, set the environment variable `USE_PROXY` to `TRUE`. You can
do this simply by typing:

> export USE_PROXY=TRUE

This environment variable is very important, and make sure you either save it or
you set it every time you run the server scripts. Then, you can run the server using `npm run start-dev` or `npm run start-prod`. Note that you no longer need root privileges since the
server is actually running on port 3001, with nginx running on 443. To remember to always
set the `USE_PROXY` variable, you can make the production command

>  USE_PROXY=TRUE npm run start-prod
