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
			tags: []
		}
	}

	makeForm() {
		var keys = getKeys(this.props.data);
		var vals = getValues(this.props.data, keys);
		var types = ["text", " number", "text", "text", "text", "text"];
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
			  Add Item
			</button>

			<div className="modal fade" id="wizardModal" tabIndex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
			  <div className="modal-dialog" role="document">
			    <div className="modal-content">
			      <div className="modal-header">
			        <h5 className="modal-title" id="modalLabel">Modal title</h5>
			      </div>
			      <div className="modal-body">
			        {this.makeForm()}
			      </div>
			      <div className="modal-footer">
			        <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
			        <button onClick={e => this.onSubmission()} type="button" className="btn btn-primary">Create</button>
			      </div>
			    </div>
			  </div>
			</div>
		</div>
			);
	}

	makeTextBox(id, type, label, defaultText){
		return (
			<div className="form-group" key={"textform-"+id}>
			  <label htmlFor={id}>{label}</label>
			  <input type={type} className="form-control" defaultValue={defaultText} id={"textform-"+id}></input>
			</div>
		);
	}

	onSubmission() {
		// make the object you want to send over through axios.
		console.log("Getting from form: ");
		//console.log(document.getElementById("textform-0").value);
		var object = {
			name: document.getElementById("textform-0").value,
	  		quantity: Number(document.getElementById("textform-1").value),
	 		model_number: document.getElementById("textform-2").value,
	  		description: document.getElementById("textform-3").value,
	  		location: document.getElementById("textform-4").value,
	  		tags: (document.getElementById("textform-5").value).split(",")
  		}
  		console.log(object);
  		var val = isWholeNumber(object.quantity);
  		if (val === true) {
  			alert("success!");

  		}
  		else {
  			alert(val);
  		}
	}

	componentDidMount() {
		this.onSubmission();
	}

}

export default ItemWizard