var mongoose = require('mongoose');
var Loan = require('./server/model/loans');
var EmailSettings = require('./server/model/emailSettings');
mongoose.connect('mongodb://admin:ece458duke@localhost/inventory');

var loans = [
  {
    user: "58a08055b3935e6e0fc9810e",
    request: '111111111111111111111111', // don't care about this, just fake it
    items: [
      {
        item: "588a92cf9ed4278830ac6890",
        quantity: 2,
        status: 'LENT'
      },
      {
        item: "588a92cf9ed4278830ac6892",
        quantity: 5,
        status: 'RETURNED'
      }
    ]
  },
  {
    user: "58a08055b3935e6e0fc9810e",
    request: '222222222222222222222222', // don't care about this, just fake it
    items: [
      {
        item: "588a92cf9ed4278830ac6894",
        quantity: 1,
        status: 'LENT'
      },
      {
        item: "588a92cf9ed4278830ac6895",
        quantity: 3,
        status: 'DISBURSED'
      }
    ]
  }
];
Loan.remove({}, function(error) {
  Loan.insertMany(loans).then(function(array) {
    EmailSettings.getSingleton(function(error, settings) {
      settings.loan_emails = {
        body: 'Semester is over',
        date: new Date()
      };
      settings.save(function(error) {
        console.log('done');
        process.exit();
      });
    });
  });
});
