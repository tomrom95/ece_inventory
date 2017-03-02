import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import LogItem from './LogItem.js';
import LogFilterBox from './LogFilterBox.js';
import LogTable from './LogTable.js';
import PaginationContainer from '../global/PaginationContainer.js';

class LogPage extends Component {

	constructor(props) {
		super(props);
		this.instance = axios.create({
		  baseURL: 'https://' + location.hostname,
		  headers: {'Authorization': localStorage.getItem('token')}
		});
		this.state = {
      		filters: props.filters,
      		showFilterBox: props.showFilterBox
		};
	}

	makeURL() {
		var url = 'api/logs/';
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
		return url;
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
		});
	}

	render() {
		var url = this.makeURL();
    	var table = LogTable;
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
					<PaginationContainer
						url={url}
          				processData={data=>data}
          				renderComponent={table}
          				showFilterBox={false}
          				showStatusFilterBox={false}
          				rowsPerPage={this.props.rowsPerPage ? this.props.rowsPerPage: 15}
         				id={"log-page-"+this.props.id}
          				hasOtherParams={this.state.filters ? true : false}
          				extraProps={{
      							showFilterBox: this.props.showFilterBox,
      							showButtons: this.props.showButtons,
      					}}/>
				</div>
			</div>
		);
	}
}

export default LogPage;
