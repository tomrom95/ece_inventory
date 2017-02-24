import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
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
		this.instance = axios.create({
		  baseURL: 'https://' + location.hostname + ':3001',
		  headers: {'Authorization': localStorage.getItem('token')}
		});
		this.state = {
			items: []
		};
	}

	componentWillMount() {
		this.instance.get('api/logs')
		.then(function (response) {
			this.setState({
				items: response.data
			});
		}.bind(this));
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
					logItemId={logItem._id}/>
			);
		}
		return list;
	}

	render() {
		return (
			<div className="container">
				<table className="table table-sm table-striped log-table">
				  <thead>
				    <tr>				    
				      <th>Timestamp</th>
				      <th>Description</th>
				    </tr>
				  </thead>
				  <tbody>
				  	{this.makeLogItems(this.state.items)}
				  </tbody>
				</table>
			</div>
		);
	}
}

export default LogTable;