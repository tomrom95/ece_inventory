import React, { Component } from 'react';
import '../../App.css';
import LogItem from './LogItem.js';

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

  componentWillMount() {
    this.props.api.get('/api/customFields')
      .then(function(response) {
        if (response.data.error) {
          console.log(response.data.error);
        }
        this.setState({allCustomFields: response.data});
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      });
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
			var requestId = logItem.request;
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
					requestId={requestId}
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
				<table className={"table table-sm table-striped " + (this.props.showFilterBox ? "log-table" : "log-table-mini")}>
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
		);
	}
}

export default LogTable;
