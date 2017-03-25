import React, { Component } from 'react';
import '../../App.css';
import LoanTable from './LoanTable.js';
import PaginationContainer from '../global/PaginationContainer.js';
import LoanFilterBox from './LoanFilterBox.js';
import axios from 'axios';

class LoanPage extends Component {

	constructor(props) {
		super(props);
		this.instance = axios.create({
		  baseURL: 'https://' + location.hostname,
		  headers: {'Authorization': localStorage.getItem('token')}
		});

		this.state = {
      		filters: props.filters,
      		showFilterBox: props.showFilterBox,
      		isGlobal: props.isGlobal
		};
	}

	processData(responseData) {
	    var loans = responseData.data;
	    var i;
	    var loanList = [];
	    for (i=0; i<loans.length; i++) {
	      var obj = loans[i];
	        var loan = {
	        	_id: obj._id,
	        	user: obj.user,
	        	request_id: obj.request,
	        	created: obj.created,
	        	modified: obj.lastModified,
	        	items: obj.items
	        }
	        loanList.push(loan);
	      }
	    return loanList;
  	}

	makeURL() {
		var url = 'api/loans/';
		if (this.state.filters) {
			url += '?';
			if (this.state.isGlobal === false) {
				url += "user_id=" + JSON.parse(localStorage.getItem('user'))._id;
			}
			else if (this.state.filters.user_id)
				url += ("user_id=" + this.state.filters.user_id);
			if (this.state.filters.type)
				url += ("&item_type=" + this.state.filters.type);
			if (this.state.filters.item_name)
				url += ("&item_name=" + this.state.filters.item_name);
		}
		return url;
	}

	setFilters(statusType, userId, itemName) {
		var filter = {};
		if (statusType)
			filter.type = statusType;
		if (userId)
			filter.user_id = userId;
		if (itemName && itemName.length !== 0)
			filter.item_name = itemName;

		this.setState({
			filters: filter
		});
	}

	render() {
	    var url = this.makeURL();
	    var table = LoanTable;

	    return (
	    	<div className="row">
	    	{ this.state.showFilterBox ?
				(<div className="col-md-3">
							<LoanFilterBox api={this.instance}
											showUserBox={this.state.isGlobal}
										  	filterRequests={(type, id, itemName) => 
										  		this.setFilters(type, id, itemName)}/>
				</div>) : null
			}

				<div className={this.state.showFilterBox ? "col-md-9" : ""}>
			    	<PaginationContainer
			            url={url}
			            processData={data => this.processData(data)}
			            renderComponent={table}
			            showFilterBox={false}
			            showStatusFilterBox={false}
			            hasOtherParams={this.state.filters ? true : false}
			            id={'loan-page'}
			            rowsPerPage={this.props.rowsPerPage}
			            extraProps={{showFilterBox: this.state.showFilterBox}} />
		         </div>

	        </div>);
	}

}

export default LoanPage;