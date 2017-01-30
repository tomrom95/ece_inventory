import React, { Component } from 'react';
import './App.css';

class SubtableRow extends Component {

	constructor(props) {
		super(props);
		var i;
		var rowData = [];
		for (i=0; i<props.data.length; i++) {
			rowData.push(props.data[i]); 
		}
		this.state = {
			data: rowData
		}
	}

	render() {
		return (
			<tr>
				{this.makeList(this.state.data)}
			  	<td><button className="btn btn-primary">Request</button></td>
			</tr>
		);
	}

	makeList(elems) {
		var i;
		var htmlList = [];
		for (i=0; i<elems.length; i++) {
			// column tag is used as key. It is a tag for each column cell rendered.
			// Required for React DOM.
			var columnTag = this.props.itemName + "-" + this.props.rowNumber + "-" + i;
			htmlList.push(<td className="subtable-row" key={columnTag}> {elems[i]} </td>);
		}
		return htmlList;
	}

}

export default SubtableRow