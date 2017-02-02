import React, { Component } from 'react';
import './App.css';

class RequestTableRow extends Component {

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
				{this.makeSelectionRegion()}
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

	makeSelectionRegion() {

		// this is the quantity: hardcoded
		if (this.props.data[3] == 1) {
			return (
				<div className="checkbox">
	  				<label><input type="checkbox" value=""></input></label>
				</div>
			)
		}
		else {
			return (
				<div className="form-group">
  					<input type="text" className="form-control" id="usr"></input>
				</div>
			);
		}
	}
}

export default RequestTableRow
