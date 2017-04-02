Backup Guide
===================

**Backup VM**: colab-sbx-135.oit.duke.edu

**Username**: backupadmin

**Password**: nullstrings

## About the system

To backup our system, we are using the built-in mongo utilities for creating backup
archives as well as restoring a database from a backup archive. These offer the most
support and are best integrated into a mongodb database, so they were greatly
preferred. In this case, `mongodump` is the command to create a backup, and
`mongorestore` is the command to restore the database from it. Their use will be
discussed later.

Our backup process is as follows, and is run by the `backup_db.js` script in the
`scripts` folder. First, a mongo archive is created for the inventory
database and is archived into a file. This file name includes a time stamp and
a date of expiry. If the backup is a daily backup then its expiry is 7 days, if it's
a weekly backup then its expiry is 28 days, and if it's a yearly backup, its expiry
is 365 days. The file format looks like `YEAR-MONTH-DAY-exp-EXPIRY-days.archive`.
For example, `2017-03-20-exp-28-days.archive` is a weekly backup (28 day expiry) that
was created on March 20th, 2017.

Then, the backup is copied to a separate VM with separate credentials through `scp`.
This is done securely by the backup VM holding a public SSH key from the production
VM in its `authorized_keys` file. This will be gone over in more depth later.

After, a script is run on the backup VM to delete old archives. This is done by
parsing the filenames and checking to see if any of the expiry lengths have been
passed (i.e. if it has been at least 7 days since an archive with a 7 day expiry
was created).

Lastly, the local copy of the archive is deleted and an email is sent to the `admin`
user upon success. An email is also sent on failure. It is important to note that
our system emails the user with the username `admin`, required by the system.

This script to run the process, `backup_db.js`, is run by crontab every day on the
production vm. It can also be run manually by simply running `node scripts/backup_db.js`.

**An email is sent only to the admin user**. If you would like to change this email, edit the
admin's email in the User Profile tab under Profile.

## Setting up from scratch

Setting up the backup service is very simple. The script `backup_db.js` does everything
for you, so all you have to do is set it up to run every day. To do this, run

> crontab -e

This opens up a file containing tasks to run by cron. Then add the line

> 30 16 * * * /usr/bin/node /home/bitnami/ece_inventory/scripts/backup_db.js

This will tell cron to run the backup script every day at 16:30 (4:30pm). You can
change the first 2 numbers in the line to change the time to run it at. The first
number is the minute and the second is the hour out of 24. Also note that your file
path may be different for the script. It is usually good practice to include the
absolute path, in the event that this is set up by a different user, for example.

Then, you need to set up the backup VM. Our credentials are at the top of this guide
if you would like to use ours. If you would like to change the backup VM, change it at the
top of the `backup_db.js` file as well. When you are logged into the backup vm, create
a directory called `archives` to store all the archives. Additionally, copy over the
`remove_old_backups.sh` bash script from the `scripts` directory. This is the file
run to delete expired backups. Both the remove backups script and the archive folder
should be located in the home directory of your user on the backup VM (i.e. `~/`).

Lastly, you will need to authenticate the production VM to copy files and run the script.
To do this, first create an ssh key on the production VM:

> ssh-keygen -t rsa

Then copy the public key created (found in `~/.ssh/id_rsa.pub` unless otherwise
specified). On the backup VM, create a file called `authorized_keys` in the `~/.ssh/` directory
and copy this public key into the file. Save it, and you're done. This now authenticates
the production server. You will need to run the script on the production VM once first,
because it sometimes still just asks if you trust the VM the first time.

## Restoring from a backup

Restoring is fairly simple using the mongo utilities. First, pick a backup archive you
would like to restore to. They are all labeled by dates in the backup VM. Copy
this archive to the production VM using any means, most likely `scp`.

With the archive in the same working directory as you on the production VM, you
can run the following command to do a "dry run" restore, which will just verify that
the archive is ok and print any errors.

> mongorestore --db inventory --archive=ARCHIVE_FILE --dryRun

To actually restore, you can run:

> mongorestore --db inventory --archive=ARCHIVE_FILE --drop

This command will drop the old data in the database restore the inventory database
to the archive.
