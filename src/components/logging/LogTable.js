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
		this.instance = axios.create({
		  baseURL: 'https://' + location.hostname + ':3001',
		  headers: {'Authorization': localStorage.getItem('token')}
		});
		this.state = {
			items: [],
      		allCustomFields: [],
      		showFilterBox: props.showFilterBox,
      		showButtons: props.showButtons,
      		filters: this.props.filters
		};
	}

	componentWillMount() {
		this.loadData();
	}

	loadData() {
		var url = 'api/logs';
		if (this.state.filters) {
			url += '?';
			if (this.state.filters.user_id)
				url += ("user_id=" + this.state.filters.user_id);
			if (this.state.filters.type)
				url += ("&type=" + this.state.filters.type);
			if (this.state.filters.item_name)
				url += ("&item_name=" + this.state.filters.item_name);
			if (this.state.filters.start_date)
				url += '&start_date=' + this.state.filters.start_date;
			if (this.state.filters.end_date)
				url += '&end_date=' + this.state.filters.end_date;
			if (this.state.filters.item_id)
				url += '&item_id=' + this.state.filters.item_id;
		}

		this.instance.get(url)
		.then(function (response) {
			this.setState({
				items: response.data
			});
		}.bind(this));

		this.instance.get('/api/customFields')
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

	setFilters(actionType, userId, itemName, startDate, endDate) {
		var filter = {};
		if (actionType)
			filter.type = actionType;
		if (userId)
			filter.user_id = userId;
		if (itemName && itemName.length !== 0)
			filter.item_name = itemName;
		if (startDate && startDate !== "Invalid date")
			filter.start_date = startDate;
		if (endDate && endDate !== "Invalid date")
			filter.end_date = endDate;

		this.setState({
			filters: filter
		}, function() {
			this.loadData();
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
		return (		
			<div className="row">
				{ this.state.showFilterBox ?
					(<div className="col-md-3">
						<LogFilterBox api={this.instance} 
									  filterRequests={(type, id, itemName, startDate, endDate) =>
									 	this.setFilters(type, id, itemName, startDate, endDate)}/>
					  </div>)
				: null }	
				<div className={this.state.showFilterBox ? "col-md-9" : ""}>
				{this.state.items.length === 0 ? <div className="center-text">No items found.</div> :
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
						  	{this.makeLogItems(this.state.items)}
						  </tbody>
						</table>
					</div>
				}
				</div>
			</div>
		);
	}
}

export default LogTable;
