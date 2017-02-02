import React, { Component } from 'react';
import './App.css';


class ItemWizard extends Component {

	constructor(props) {
		super(props);
		this.state = {

		}
	}

	render() {
		return (
			<div>
				{this.makeTextBox("1", "text", "Item Name", "Michael")}
				{this.makeTextBox("2", "text", "Model Number", "")}
				{this.makeTextBox("3", "text", "Quantity", "")}
				{this.makeTextBox("4", "text", "Description", "")}
				{this.makeTextBox("5", "text", "Location", "")}
				{this.makeTextBox("6", "text", "Tags", "")}
			</div>
			);
	}

	makeTextBox(id, type, label, defaultText){
		return (
			<div className="form-group">
			  <label htmlFor={id}>{label}</label>
			  <input type={type} className="form-control" id={id}></input>
			</div>
		);
	}

}

export default ItemWizard