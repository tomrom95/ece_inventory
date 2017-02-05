import React, { Component } from 'react';
import './App.css';
import RequestPopup from './RequestPopup.js';
import ItemWizard from './ItemWizard.js';

function getPrefill(data) {
	return ({
		"Name": data[0], 
		"Quantity": data[1], 
		"Model Number": data[2], 
		"Description": data[3], 
		"Location": data[4], 
		"Tags": data[5]
	});
}


class SubtableRow extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: this.props.data
		}
	}

	render() {
		return (
			<tr>
				{this.makeList(this.state.data)}
				{this.makeButton()}
				<td> {this.makeEditButton()} </td>
				<td> {this.makeDeleteButton()} </td>
			</tr>
		);
	}

	makeList(elems) {
		var i;
		var htmlList = [];
		for (i=0; i<elems.length; i++) {
			var columnTag = this.props.idTag + "-" + i;
			var value = elems[i];
			if (value.length === 0 || value === "undefined") 
				value = "N/A";
			htmlList.push(<td className="subtable-row" key={columnTag}> {value} </td>);
		}
		return htmlList;
	}

	makeButton() {
			return (
				<RequestPopup
					data={[ {
								Serial: "N/A",
								Condition: "N/A",
								Status: "N/A",
								Quantity: this.props.data[4]
							}
						]}
					itemName={this.props.data[0]}
					modelName={this.props.data[1]}
					itemId={this.props.idTag}
					api={this.props.api}
					ref={this.props.idTag}/>
			);
	}

	makeEditButton() {
		if (JSON.parse(localStorage.getItem('user')).is_admin === true) {
			return this.props.buttons;
		}
	}
	makeDeleteButton(id) {
		if (JSON.parse(localStorage.getItem('user')).is_admin === true) {
			return (
				<button onClick={()=>{this.deleteItem(this.props.idTag)}} type="button" className="btn btn-danger delete-button">X</button>
			);
		}
	}

	deleteItem(id) {
		this.props.api.delete('api/inventory/' + id)
		.then(function(response) {
			this.props.callback();
		}.bind(this));
	}
}

export default SubtableRow
