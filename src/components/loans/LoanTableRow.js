import React, { Component } from 'react';
import '../../App.css';

class LoanTableRow extends Component {

	/*
		Row should contain:
			- initiating user
			- date created
			- date last modified
			- items table:
				- name
				- quantity
				- status
				- id (not displayed)
	*/

	constructor(props) {
		super(props);
		this.state = {
			user: props.params.user,
			created: props.params.created,
			modified: props.params.modified,
			items: props.params.items
		}
	}

	makeItemRows() {
		var items = this.state.items;
		var list = [];
		for (var i=0; i<items.length; i++) {
			var key = "loan-item-id-"+items[i]._id;
			list.push(
			    <tr key={key}>
			      <td key={key + "-col1"}>{items[i].name}</td>
			      <td key={key + "-col2"}>{items[i].quantity}</td>
			      <td key={key + "-col3"}>{items[i].status}</td>
			    </tr>
			);
		}
		return list;
	}

	render() {
		return (
		    <li className="list-group-item">
				<div className="container">
		    		<div className="row">
		    			<strong>User: </strong> {this.state.user}
		    		</div>
		    		<div className="row">
		    			<strong>Date Created: </strong> {this.state.created}
		    		</div>
		    		<div className="row">
		    			<strong>Last Modified: </strong> {this.state.modified}
		    		</div>
		    		<br></br>
		    		<div className="row">
			    		<table className="table table-sm table-hover">
						  <thead>
						    <tr>
						      <th>Item Name</th>
						      <th>Quantity Loaned</th>
						      <th>Status</th>
						    </tr>
						  </thead>
						  <tbody>
						  	{this.makeItemRows()}
						  </tbody>
						</table>
		    		</div>		    		
		    	</div>
			</li>);
	}
}

export default LoanTableRow;