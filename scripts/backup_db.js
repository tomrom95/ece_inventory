'use strict'

var exec = require('child_process').exec;
var fs = require('fs');
var moment = require('moment');
var mongoose = require('mongoose');
var emailer = require('../server/emails/emailer');

const BACKUP_VM = 'backupadmin@colab-sbx-135.oit.duke.edu';
const BACKUP_FOLDER = '~/archives';
const REMOVE_SCRIPT = '~/remove_old_backups.sh';

mongoose.connect('mongodb://admin:ece458duke@localhost/inventory');

function handleError(error, stderr) {
  console.log(error);
  console.log('sending error email');
  emailer.sendBackupFailureEmail(error, stderr, (error) => {
    if (error) console.log(error);
    console.log('Backup failure email sent to admin user');
    process.exit();
  });
}

function getExpiryLength() {
  var expiry = 7;
  if (moment().weekday() === 1) {
    expiry = 28;
  }
  if (moment().date() === 1) {
    expiry = 365;
  }
  return expiry;
}

function mongoDump(next) {
  var expiry = getExpiryLength();
  var filename = moment().format('YYYY-MM-DD') + '-exp-' + expiry + '-days.archive';
  var mongoDumpCommand = 'mongodump --archive=' + filename;

  exec(mongoDumpCommand, function(error, stdout, stderr) {
    if (error) return handleError(error, stderr);
    return next(filename);
  });
}

function scp(filename, vm, folder, next) {
  var scpCommand = 'scp -i ~/.ssh/id_rsa ' + filename + ' ' + vm + ':' + folder;
  exec(scpCommand, function(error, stdout, stderr) {
    if (error) return handleError(error, stderr);
    return next();
  });
}

function executeVMScript(vm, script, next) {
  var removeOldCommand = 'ssh -i ~/.ssh/id_rsa ' + vm + ' ' + script;
  exec(removeOldCommand, function(error, stdout, stderr) {
    if(error) return handleError(error, stderr);
    return next();
  });
}

function removeLocalCopy(filename, next) {
  fs.unlink(filename, function(error){
    if(error) return handleError(error);
    return next();
  });
}

// Create archive with mongodump
mongoDump((filename) => {
  var expiry = getExpiryLength();
  console.log('Archive created with expiry of ' + expiry + ' days');

  // Copy archive to backup vm
  scp(filename, BACKUP_VM, BACKUP_FOLDER, () => {
    console.log('Archive ' + filename + ' sent to backup vm');

    // Execute script on vm to remove old archives
    executeVMScript(BACKUP_VM, REMOVE_SCRIPT, () => {
      console.log("Old backups deleted on backup vm");

      // remove local copy here
      removeLocalCopy(filename, () => {
        console.log('Local archive file deleted');

        // Send email to admin user on success
        emailer.sendBackupSuccessEmail(filename, expiry, (error) => {
          if (error) return handleError(error);
          console.log('Backup success email sent to admin user');
          process.exit();
        });
      });
    });
  });
});
