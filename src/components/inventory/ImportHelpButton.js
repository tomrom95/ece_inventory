import React, { Component } from 'react';
import '../../App.css';


class ImportHelpButton extends Component {

	constructor(props) {
		super(props);
	}


	render() {
		var button =
			<button type="button"
				className="btn btn-primary"
				data-toggle="modal"
				data-target={"#bulkImportModal"}>
				Import
			</button>;
    var example_one = {
      "name": "resistor",
      "quantity": 5,
      };
    var schema =   {
        "name": "String [required]",
        "quantity": "Integer",
        "model_number": "String",
        "description": "String",
        "tags": "[String]",
        "custom_fields": [
          {
            "name": "String",
            "value": "String"
          }
        ],
   	"minstock_threshold": "Integer",
	"minstock_isEnabled": "Boolean",
	"instances": [{
		"tag": "String",
		"custom_fields": [
		  {
		    "name": "String",
		    "value": "String"
		  }
		]
	}]
      };
    var example_two = [
      {
        "name": "resistor",
        "quantity": 5
      },
      {
        "name": "inductor",
        "quantity": 10
      }
    ];
    var example_one_string = JSON.stringify(example_one, null, 2);
    var schema_string = JSON.stringify(schema, null, 2);
    var example_two_string = JSON.stringify(example_two, null, 2);
    var part_one = "The import button accepts a JSON file with the appropriate item schema.  An example of a correct item schema would be\n";
    var part_two = "This will produce an item in the inventory with name 'resistor' and quantity '5'.  For non-asset items, the name and quantity fields are required. For asset items, the name is required, and the quantity is required if you prefer to not specify each asset instance. If you would like to specify each instance, do not enter a quantity. Instance custom fields must be per-asset. The rest of the schema looks as follows\n";
    var part_three = "An example of a correct import with multiple items would look like this\n";
		return (
      <div>
        <a className="nav-link userpage-tab"
           data-toggle="modal"
           href="#"
           data-target={"#helpModal"}>
           Bulk Import Help
        </a>
        <div className="modal fade"
          id={"helpModal"}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="createLabel"
          aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="createLabel">How to use bulk import</h5>
              </div>
              <div className="modal-body">
               <p>
                {part_one}
               </p>
               <div>
                <pre>
                  {example_one_string}
                </pre>
               </div>
               <p>
                {part_two}
               </p>
               <div>
                <pre>
                  {schema_string}
                </pre>
               </div>
               <p>
                {part_three}
               </p>
               <div>
                <pre>
                  {example_two_string}
                </pre>
               </div>
              </div>

            </div>
          </div>
        </div>
      </div>
		);
	}

}

export default ImportHelpButton
