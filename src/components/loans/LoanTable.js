import React, { Component } from 'react';
import '../../App.css';
import LoanTableRow from './LoanTableRow.js';

class LoanTable extends Component {

	/*
		Loan table should contain columns:
			- initiating user
			- loan created
			- last modified
			- items: name, quantity, and status (id is passed down but not displayed)
			- request id: passed down but not displayed

	*/

	constructor(props) {
		super(props);
		this.state = {
			data: props.data
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			data: newProps.data
		});
	}

	makeRows() {
		var list = [];
		for (var i=0; i<this.state.data.length; i++) {
			  var loanItem = this.state.data[i];

			  var user = loanItem.user;
			  var label = user.username;
			  if (user.first_name && user.last_name) {
			    label = user.first_name + ' ' + user.last_name;
			    if (user.netid) {
			      label += ' (' + user.netid + ')';
			    } else {
			      label += ' (' + user.username + ')';
			    }
			  } else if (user.netid) {
			    label = user.netid;
			  }

			var params = {
				_id: loanItem._id,
				user: label,
				created: loanItem.created,
				modified: loanItem.modified,
				items: loanItem.items,
				request_id: loanItem.request_id
			};

			list.push(
				<LoanTableRow key={"loan-table-row-"+i} 
							  api={this.props.api} 
							  params={params}
							  callback={this.props.callback}/>
			);
		}
		return list;
	}

	render() {
		return (
		<div className={this.props.showFilterBox ? "card loan-table" : "card loan-table-mini"}>
		  <ul className="list-group list-group-flush">
		  	{this.state.rerender === true ? null : this.makeRows()}
		  </ul>
		</div>);
	}

}

export default LoanTable;