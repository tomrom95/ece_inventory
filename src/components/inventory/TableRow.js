import React, { Component } from 'react';
import '../../App.css';
import ItemWizard from './ItemWizard.js';

function getPrefill(data) {
	return ({
		"Name": data[0],
		"Quantity": data[1],
		"Model Number": data[2],
		"Description": data[3],
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

	componentWillReceiveProps(newProps) {
		this.setState({
			data: newProps.data
		});
	}

	render() {
		return (
			<tr>
				{this.makeList(this.state.data)}
				{this.makeButtons()}
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

	makeButtons() {
			if(this.props.request_buttons){
				return this.props.request_buttons;
			}

			else if(this.props.inventory_buttons){
				return this.props.inventory_buttons;

			}
			return (<td> <div > </div> </td>);
	}
}

export default SubtableRow;
