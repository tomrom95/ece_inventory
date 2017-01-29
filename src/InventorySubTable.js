import React, { Component } from 'react';
import './App.css';
import SubtableRow from './SubtableRow';

class InventorySubTable extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: this.props.data
		}
	}

	render() {
		return (
			<table className="table table-inverse subtable-body">
			  <thead className="thread">
			    <tr>
			      <th>Model Number</th>
			      <th>Description</th>
			      <th>Location</th>
			      <th>Quantity</th>
  			      <th>Tags</th>
  			      <th> </th>
			    </tr>
			  </thead>
			  <tbody>
			    <SubtableRow data={["1", "Larry", "the Bird", "@Twitter", "happy"]} itemName={"osc"} row={1}/>
			    <SubtableRow data={["1", "Larry", "the Bird", "@Twitter", "happy"]} itemName={"osc"} row={2}/>
			    <SubtableRow data={["1", "Larry", "the Bird", "@Twitter", "happy"]} itemName={"osc"} row={3}/>
			    <SubtableRow data={["1", "Larry", "the Bird", "@Twitter", "happy"]} itemName={"osc"} row={4}/>
			  </tbody>
			</table>
		);
	}

	countAvailable() {
		var i;
		var count = 0;
		for (i=0; i<this.state.data.length; i++) {
			count += this.state.data.qty;
		}
		return count;
	}
}

export default InventorySubTable