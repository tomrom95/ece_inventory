import React, { Component } from 'react';
import '../../App.css';
import ItemDetailView from '../inventory/ItemDetailView.js';

class LogItem extends Component {

	/*
		Props contain:
			- timestamp
			- description
			- list of itemIds
			- list of itemNames (equal in length to list of itemIds)
			- log item ID
	*/
	
	render() {
		var timestamp = this.props.timestamp;
		var description = this.props.description;
		if (!description)
			description = "Description not available.";
		var buttons = []; var i;
		for (i=0; i<this.props.itemIds.length; i++) {
			buttons.push(
			<ItemDetailView 
				key={"log-detailview-" + this.props.itemIds[i]+ "-" + this.props.logItemId}
				params={{itemID: this.props.itemIds[i]}}
				isButton={false} />);
		}
		return (
			<tr>
		      <td>{timestamp}</td>
		      <td>{description}</td>
		      <td className="log-detailview-links">{buttons}</td>
		    </tr>
	    );
	}
}

export default LogItem;
