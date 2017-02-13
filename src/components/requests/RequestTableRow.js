import React, { Component } from 'react';
import '../../App.css';

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
			</tr>
		);
	}

	makeList(elems) {
		var i;
		var htmlList = [];
		for (i=0; i<elems.length; i++) {
			// column tag is used as key. It is a tag for each column cell rendered.
			// Required for React DOM.
			var columnTag = this.props.rowId + "-col-" + i;
			htmlList.push(<td className="subtable-row" key={columnTag}> {elems[i]} </td>);
		}
		return htmlList;
	}

}

export default RequestTableRow