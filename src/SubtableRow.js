import React, { Component } from 'react';
import './App.css';
import RequestPopup from './RequestPopup.js';

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

	makeButton() {
			return (<RequestPopup
						itemName={this.props.itemName}
						modelName={this.props.data[0]}/>);
	}

}

export default SubtableRow
