var exec = require('child_process').exec;
var fs = require('fs');
var moment = require('moment');

const BACKUP_VM = 'bitnami@colab-sbx-135.oit.duke.edu'

var expiry = 7;
if (moment().weekday() === 1) {
  expiry = 28;
}
if (moment().date() === 1) {
  expiry = 365;
}

var filename = moment().format('YYYY-MM-DD') + '-exp-' + expiry + '-days.archive';
var mongoDumpCommand = 'mongodump --archive=' + filename;

exec(mongoDumpCommand, function(error, stdout, stderr) {
  if (error) {
    console.log(error);
    process.exit();
  }
  console.log('Archive created');
  var scpCommand = 'scp -i ~/.ssh/id_rsa ' + filename + ' ' + BACKUP_VM + ':~/archives/';
  exec(scpCommand, function(error, stdout, stderr) {
    if (error) {
      console.log(error);
      process.exit();
    }
    console.log('Archive ' + filename + ' sent to backup vm');
    console.log('Copied archive will be removed in ' + expiry + ' days');
    var removeOldCommand = 'ssh -i ~/.ssh/id_rsa ' + BACKUP_VM + ' ~/remove_old_backups.sh';
    exec(removeOldCommand, function(error, stdout, stderr) {
      if(error) {
        console.log(error);
        process.exit();
      }
      console.log("Old backups deleted on backup vm")
      fs.unlink(filename, function(error){
        if(error) {
          console.log(error);
          process.exit();
        }
        console.log('Local archive file deleted');
        process.exit();
      });
    });
  });
});
