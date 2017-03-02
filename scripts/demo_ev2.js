var childProcess = require('child_process');
var mongoose = require('mongoose');
let Item = require('../server/model/items');
let User = require('../server/model/users');
let Cart = require('../server/model/carts');
let Log = require('../server/model/logs');
let Request = require('../server/model/requests');


function runScript(scriptPath, callback) {
    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;
    var process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });
}

runScript('./scripts/populate_demo_inventory.js', function (err) {
    if (err) return err;
    console.log('finished running populate_demo_inventory.js');
    Request.remove({}, (err)=>{
      Cart.remove({}, (err) => {
        Log.remove({}, (err) => {
            console.log("Dropped cart, logs, requests db");
            var item1;
            var item2;
            var item3;
            Item.find({name: "1k resistor"}, function(err,item){
              if(err) return console.log(err);
              item1 = item;
              Item.find({name: "2k resistor"}, function(err,item){
                if(err) return console.log(err);
                item2 = item;
                Item.find({name: "5k resistor"}, function(err,item){
                  if(err) return console.log(err);
                  item3 = item;



                });
                });
              });
            })
          })
      })
    });
