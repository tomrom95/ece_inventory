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
				user: loanItem.user.username,
				created: loanItem.created,
				modified: loanItem.modified,
				items: loanItem.items
			};

			list.push(
				<LoanTableRow key={"loan-table-row-"+i} api={this.props.api} params={params}/>
			);
		}
		return list;
	}

	render() {
		return (
		<div className="card">
		  <ul className="list-group list-group-flush">
		  	{this.makeRows()}
		  </ul>
		</div>);
	}

}

export default LoanTable;