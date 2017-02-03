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

class ItemWizard extends Component {

	constructor(props) {
		super(props);
		this.state = {

		}
	}

	makeForm() {
		var keys = getKeys(this.props.data);
		var vals = getValues(this.props.data, keys);
		var list = []; var i;
		for (i=0; i<keys.length; i++) {
			list.push(this.makeTextBox(i, "text", keys[i], vals[i]));
		}
		return list;
	}

	render() {
		return (
			<div>
				{this.makeForm()}
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
		console.log(document.getElementById("textform-0").value);
	}

	componentDidMount() {
		this.onSubmission();
	}

}

export default ItemWizard