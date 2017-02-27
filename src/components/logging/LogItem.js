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
			- showButtons boolean
	*/

	constructor(props) {
		super(props);
		this.state = {
     	 allCustomFields: this.props.allCustomFields,
     	 showButtons: props.showButtons
		};
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			allCustomFields: newProps.allCustomFields
		})
	}

	render() {
		var timestamp = this.props.timestamp;
		var description = this.props.description;
		if (!description)
			description = "Description not available.";

		var buttons = []; var i;

		if (this.state.showButtons) {
			for (i=0; i<this.props.itemIds.length; i++) {
				buttons.push(
				<ItemDetailView
					key={"log-detailview-" + this.props.itemIds[i]+ "-" + this.props.logItemId}
					params={{itemID: this.props.itemIds[i]}}
					isButton={false}
					allCustomFields={this.state.allCustomFields}/>
				);
			}
		}
		return (
			<tr>
		      <td>{timestamp}</td>
		      <td>{description}</td>

		      {
		      	this.state.showButtons ?
		      	<td className="log-detailview-links">{buttons}</td>
		      	: null
		      }
		    </tr>
	    );
	}
}

export default LogItem;
