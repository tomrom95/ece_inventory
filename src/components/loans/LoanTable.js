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
			var params = {
				_id: loanItem._id,
				user: loanItem.user.username,
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