import React, { Component } from 'react';
import './App.css';
 
function getKeys(data) {
	return Object.keys(data);
}

function getValues(data, keys) {
	var i;
	var vals = [];
	for (i=0; i<keys.length; i++) {
		vals.push(data[keys[i]]);
	}
	return vals;
}

function validNumber(num) {
	return !isNaN(num);
}

function isWholeNumber(num) {
	if (!validNumber(num)) {
		return "Not a valid number!";
	}
	else {
		if (Number(num) !== parseInt(num)) {
			return "Please input a whole number!";
		}
		else return true;
	}
} 

class ItemWizard extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: props.data
		}
	}

	makeForm() {
		var keys = getKeys(this.state.data);
		var vals = getValues(this.state.data, keys);
		var types = ["text", " text", "text", "text", "text", "text"];
		var list = []; var i;
		for (i=0; i<keys.length; i++) {
			list.push(this.makeTextBox(i, types[i], keys[i], vals[i]));
		}
		return list;
	}

	render() {
		return (
		<div>
			<button type="button" className="btn btn-primary" data-toggle="modal" data-target="#wizardModal">
			  {this.makeButtonText()}
			</button>

			<div className="modal fade" id="wizardModal" tabIndex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
			  <div className="modal-dialog" role="document">
			    <div className="modal-content">
			      <div className="modal-header">
			        <h5 className="modal-title" id="modalLabel">{this.makeModalTitle()}</h5>
			      </div>
			      <div className="modal-body">
			        {this.makeForm()}
			      </div>
			      <div className="modal-footer">
			        <button type="button" onClick={e=>this.clearView()} className="btn btn-secondary" data-dismiss="modal">Cancel</button>
			        <button onClick={e => {this.onSubmission(); this.clearView()}} type="button" data-dismiss="modal" className="btn btn-primary">Submit</button>
			      </div>
			    </div>
			  </div>
			</div>
		</div>
		);
	}

	makeButtonText() {
		if (this.props.type === "create") {
			return "+";
		}
		if (this.props.type === "edit") {
			return "Edit";
		}
	}

	makeModalTitle() {
		if (this.props.type === "create") {
			return "Add an Item";
		}
		if (this.props.type === "edit") {
			return "Edit Current Item";
		}	
	}

	makeTextBox(id, type, label, defaultText){
		return (
			<div className="form-group" key={"textform-"+id}>
			  <label htmlFor={id}>{label}</label>
			  <input type={type} className="form-control" defaultValue={defaultText} id={"textform-"+id}></input>
			</div>
		);
	}

	validItem(object) {
		if (object.name.length === 0) {
			alert("Name is a required field.");
			return;
		}

		if (object.quantity.length === 0) {
			alert("Quantity is a required field.");
			return;
		}

		var val = isWholeNumber(object.quantity);

  		if (val !== true) {
  			alert(val);
  			return;
		}
		var desc = object.description;
		if (desc.length > 400) {
			alert("Description must be less than 400 characters long.");
			return;
		}
		return true;
	}

	onSubmission() {
		var object = {
			name: document.getElementById("textform-0").value,
	  		quantity: document.getElementById("textform-1").value,
	 		model_number: document.getElementById("textform-2").value,
	  		description: document.getElementById("textform-3").value,
	  		location: document.getElementById("textform-4").value,
	  		vendor_info: document.getElementById("textform-5").value,
	  		tags: (document.getElementById("textform-6").value).split(","),
	  		has_instance_objects: false
  		}

  		var i;
  		for (i=0; i<object.length; i++) {
  			object.tags[i] = object.tags[i].trim();
  		}

  		if (this.validItem(object) === true) {
  			alert("Succssful submission!");
  			object.quantity = Number(object.quantity);

  			console.log(object);
  			var context = this;
  			if (this.props.type === "create") {
	  			this.props.api.post('/api/inventory', object)
				  	.then(function(response) {
				        if (response.data.error) {
				          console.log(response.data.error);
				        } else {
				        	console.log(context.props);
				        	context.props.callback();
				        }
				      }.bind(this))
				      .catch(function(error) {
				        console.log(error);
				      }.bind(this));
			}
			if (this.props.type === "edit") {
				console.log("Item id is:" + this.props.itemId);
	  			this.props.api.put('/api/inventory/'+ this.props.itemId, object)
				  	.then(function(response) {
				        if (response.data.error) {
				          console.log(response.data.error);
				        } else {
				        	this.props.callback();
				        }
				      }.bind(this))
				      .catch(function(error) {
				        console.log(error);
				      }.bind(this));
			}
		}
  	}

  	clearView() {
  		var i;
  		for (i=0; i<getKeys(this.props.data).length; i++) {
  			document.getElementById("textform-"+i).value = "";
  		}
  	}

}

export default ItemWizard