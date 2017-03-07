import React, { Component } from 'react';
import '../../App.css';
import ItemDetailView from '../inventory/ItemDetailView.js';
import SingleRequestView from '../requests/SingleRequestView.js';

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
     	 allCustomFields: props.allCustomFields,
     	 showButtons: props.showButtons,
     	 requestId: props.requestId,
     	 logItemId: props.logItemId,
     	 itemIds: props.itemIds,
     	 itemNames: props.itemNames
		};
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			allCustomFields: newProps.allCustomFields,
			showButtons: newProps.showButtons,
			requestId: newProps.requestId,
     		logItemId: newProps.logItemId,
	     	itemIds: newProps.itemIds,
	     	itemNames: newProps.itemNames
		});
	}

	render() {
		var timestamp = this.props.timestamp;
		var description = this.props.description;
		if (!description)
			description = "Description not available.";

		var buttons = []; var i;

		if (this.state.showButtons) {
			for (i=0; i<this.state.itemIds.length; i++) {
				buttons.push(
				<ItemDetailView
					key={"log-detailview-" + this.state.itemIds[i]+ "-" + this.state.logItemId}
					params={{itemID: this.state.itemIds[i], itemName: this.state.itemNames[i]}}
					isButton={false}
					allCustomFields={this.state.allCustomFields}/>
				);
			}

			if (this.state.requestId) {
				var uniqueKey = "log-request-detail-view-"+this.state.requestId+"-"+this.state.logItemId;
				buttons.push(<SingleRequestView 
								key={uniqueKey}
								requestId={this.state.requestId}
								id={uniqueKey}/>);
			}
		}
		return (
			<tr>
		      <td>{timestamp}</td>
		      <td className="log-description">{description}</td>

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
