import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import LogItem from './LogItem.js';
import LogFilterBox from './LogFilterBox.js';

function formatDate(dateString) {
  var i;
  var split = dateString.split(' ');
  var date = '';
  for (i=1; i<=4; i++) {
    date += split[i] + ' ';
  }
  return date;
}

class LogTable extends Component {

	constructor(props) {
		super(props);
		this.state = {
			items: props.data,
      		allCustomFields: [],
      		showButtons: props.showButtons
		};
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			items: newProps.data	
		});
	}

	makeLogItems(data) {
		var i; var j;
		var list = [];
		for (i=0; i<data.length; i++) {
			var logItem = data[i];
			var timestamp = formatDate(new Date(logItem.time_stamp).toString()); // pass down
			var description = logItem.description; // pass down
			var items = logItem.items;
			var itemIds = []; // pass down
			var itemNames = []; // pass down
			for (j=0; j<items.length; j++) {
				itemIds.push(items[j]._id);
				itemNames.push(items[j].name);
			}
			list.push(
				<LogItem
					key={"logitem-"+logItem._id}
					timestamp={timestamp}
					description={description}
					itemIds={itemIds}
					itemNames={itemNames}
					logItemId={logItem._id}
          			allCustomFields={this.state.allCustomFields}
          			showButtons={this.state.showButtons}/>
			);
		}
		return list;
	}

	render() {
		var rows = this.makeLogItems(this.state.items.data);
		return (		
				<div className="logtable-container">
					<table className="table table-sm table-striped log-table">
					  <thead>
					    <tr>				    
					      <th>Timestamp</th>
					      <th>Description</th>
					      {this.state.showButtons ? <th>Details</th> : null}
					    </tr>
					  </thead>
					  <tbody>
					  	{rows}
					  </tbody>
					</table>
				</div>
		);
	}
}

export default LogTable;
