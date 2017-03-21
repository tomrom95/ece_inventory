'use strict';
var EmailSettings = require("../../../model/emailSettings");

module.exports.getAPI = function (req, res) {
  EmailSettings.getSingleton(function(error, settings) {
    if (error) return res.send({error: error});
    return res.json(settings);
  });
};

/**
Only changes subject tag
*/
module.exports.putAPI = function (req, res) {
  var subject_tag = req.body.subject_tag;
  EmailSettings.getSingleton(function(error, settings) {
    if (error) return res.send({error: error});
    if (!subject_tag) return res.json({settings});

    settings.subject_tag = subject_tag;
    settings.save(function(error, updatedSettings) {
      if (error) return res.send({error: error});
      return res.json(updatedSettings);
    });
  });
}

/**
Adds new loan email to settings
*/
module.exports.postAPI = function(req, res) {
  var dateString = req.body.date;
  var body = req.body.body;
  if (!dateString) return res.send({error: "date required"});
  var date = new Date(dateString);
  EmailSettings.getSingleton(function(error, settings) {
    if (error) return res.send({error: error});
    // Two loan emails cannot exist on the same day
    var sameDay = settings.loan_emails.some(function(email) {
      return email.date.getUTCDate() === date.getUTCDate()
        && email.date.getUTCMonth() === date.getUTCMonth()
        && email.date.getUTCFullYear() === date.getUTCFullYear();
    });
    if (sameDay) return res.send({error: 'A loan email is already being sent that day'});

    // Add loan email
    settings.loan_emails.push({date: date, body: body});
    settings.save(function(error, updatedSettings) {
      if (error) return res.send({error: error});
      return res.json(updatedSettings.loan_emails);
    });
  });
}

/**
Deletes loan email from settings
*/
module.exports.deleteAPI = function(req, res) {
  if (!req.params.email_id) return res.send({error: 'email id required'});
  EmailSettings.getSingleton(function(error, settings) {
    if (error) return res.send({error: error});
    var index = settings.loan_emails.findIndex(function(email) {
      return String(email._id) === req.params.email_id;
    });
    if (index < 0) return res.send({error: 'email id does not exist'});

    settings.loan_emails.splice(index, 1);
    settings.save(function(error, updatedSettings) {
      if (error) return res.send({error: error});
      return res.json({message: 'Successful'});
    });
  });
}
