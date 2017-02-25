import React, { Component } from 'react';
import '../../App.css';
import ItemDetailView from '../inventory/ItemDetailView.js';

class LogItem extends Component {

	/*
		Props will contain:
			- timestamp
			- description
			- list of itemIds
			- list of itemNames (equal in length to list of itemIds)
			- log item ID
	*/

	constructor(props) {
		super(props);
		console.log(props);
	}

	makeDescriptionWithLinks() {
		var description = this.props.description;

		if (!description) {
			return (
				<div className="description">
					No description available
				</div>
			);
		}


		var i;
		var text = [];
		var links = [];
		var lastIndex = 0;
		for (i=0; i<this.props.itemNames.length; i++) {
			var index = description.indexOf(this.props.itemNames[i], lastIndex);
			if (index === -1)
				index = description.length;
			else
				links.push(
					<ItemDetailView
						key={"log-detailview-" + this.props.itemIds[i]+ "-" + this.props.logItemId}
						params={{itemID: this.props.itemIds[i]}}
						isButton={false}
						allCustomFields={this.props.allCustomFields}/>);

			text.push(description.substring(lastIndex, index));
			lastIndex = index + this.props.itemNames[i].length;

			if (i===this.props.itemNames.length-1 && index!=description.length)
				text.push(description.substring(lastIndex, description.length));

		}

		var ret = [];

		for (i=0; i<text.length; i++) {
			ret.push(
				<div className="description" key={"text-"+this.props.logItemId+"-"+this.props.itemIds[i]}>
					{text[i]}
				</div>
			);
			if (i<links.length)
				ret.push(
					<div className="description" key={"link-"+this.props.logItemId+"-"+this.props.itemIds[i]}>
						{links[i]}
					</div>
				);
		}
		return ret;
	}

	render() {
		var timestamp = this.props.timestamp;
		var description = this.props.description;
		var buttons = []; var i;
		return (
			<tr>
		      <td>{timestamp}</td>
		      <td>{this.makeDescriptionWithLinks()}</td>
		    </tr>
	    );
	}
}

export default LogItem;
