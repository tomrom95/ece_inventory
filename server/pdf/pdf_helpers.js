var Loan = require('../model/loans');

module.exports.uploadPDF = function(req,res) {
  if (!req.files) return res.status(400).send('No files were uploaded.');
  // The name of the input field (i.e. "uploadPDF")
  let uploadFile = req.files.uploadPDF;

  let filePath = __dirname + '/files/' + uploadFile.name;
  // Use the mv() method to place the file somewhere on your server
  uploadFile.mv(filePath, function(err) {
    if (err) return res.status(500).send(err);

    // Update path of the loan Schema
    Loan.findById(req.params.loan_id, function(error, loan){
      if(error) return res.send({error: error});
      var itemIndex = loan.items.findIndex(function(element){
        return String(element.item) === String(req.params.item_id);
      })
      loan.items[itemIndex].attachment_path = filePath;
      loan.save(function(error){
        if(error) return res.send({error: error});
        res.send('File uploaded!');
      })
    })
  });
}


/*
Using the following HTML element

<html>
  <body>
    <form ref='uploadForm'
      id='uploadForm'
      action='https://colab-sbx-115.oit.duke.edu/upload/loan/58e464e43f7ed8ef9c67876a/item/58c0270bdad2fa3b942b092a'
      method='post'
      encType="multipart/form-data">
        <input type="file" name="uploadPDF" />
        <input type='submit' value='Upload!' />
    </form>
  </body>
</html>


*/
