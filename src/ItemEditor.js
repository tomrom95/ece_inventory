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

class ItemEditor extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			formIds: []
		}
	}

	makeForm() {
		var keys = getKeys(this.state.data);
		var vals = getValues(this.state.data, keys);
		var list = []; var i;
		for (i=0; i<keys.length; i++) {
			list.push(this.makeTextBox(i, "text", keys[i], vals[i]));
		}
		return list;
	}

	render() {
		return (
		<div>
			<button type="button" 
				className="btn btn-primary edit-button" 
				data-toggle="modal" 
				data-target={"#editModal-"+this.props.itemId}>
				Edit
			</button>

			<div className="modal fade" 
				id={"editModal-"+this.props.itemId}
				tabIndex="-1" role="dialog" 
				aria-labelledby="editLabel" 
				aria-hidden="true">
			  <div className="modal-dialog" role="document">
			    <div className="modal-content">
			      <div className="modal-header">
			        <h5 className="modal-title" id="editLabel">Edit Current Item</h5>
			      </div>
			      <div className="modal-body">
			        {this.makeForm()}
			      </div>
			      <div className="modal-footer">
			        <button type="button" onClick={e=>this.makeForm()} className="btn btn-secondary" data-dismiss="modal">Cancel</button>
			        <button onClick={e => this.onSubmission()} type="button" data-dismiss="modal" className="btn btn-primary">Submit</button>
			      </div>
			    </div>
			  </div>
			</div>
		</div>
		);
	}


	makeTextBox(row, type, label, defaultText){
		var id = "textform-"+this.props.itemId+"-row-"+row;
		this.state.formIds.push(id);
		return (
			<div className="form-group" key={"textform-div-row"+row+'-row-'+this.props.itemId}>
			  <label htmlFor={"textform-"+this.props.itemId+"-row-"+row}>{label}</label>
			  <input type={type} 
			  	className="form-control" 
			  	defaultValue={defaultText} 
			  	id={id}
			  	key={id}>
		  	  </input>
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
			name: document.getElementById(this.state.formIds[0]).value,
	  		quantity: document.getElementById(this.state.formIds[1]).value,
	 		model_number: document.getElementById(this.state.formIds[2]).value,
	  		description: document.getElementById(this.state.formIds[3]).value,
	  		location: document.getElementById(this.state.formIds[4]).value,
	  		vendor_info: document.getElementById(this.state.formIds[5]).value,
	  		tags: (document.getElementById(this.state.formIds[6]).value).split(","),
	  		has_instance_objects: false
  		}

  		var i;
  		for (i=0; i<object.length; i++) {
  			object.tags[i] = object.tags[i].trim();
  		}

		console.log("Object is:");
		console.log(object);

  		if (this.validItem(object) === true) {
  			object.quantity = Number(object.quantity);

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

export default ItemEditor