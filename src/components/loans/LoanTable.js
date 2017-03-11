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
	}

	makeRows() {
		// dummy data!
		var user = "michael";
		var created = "March 3, 2017";
		var modified = "March 7, 2017";
		var items = [{name: "Oscilloscope", quantity: 10, status: "Returned"}];
		var params = {
			user: user,
			created: created,
			modified: modified,
			items: items
		};

		var list = [];
		for (var i=0; i<5; i++) {
			list.push(
				<LoanTableRow key={"loan-table-row-"+i} params={params}/>
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