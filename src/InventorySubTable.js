import React, { Component } from 'react';
import './App.css';
import SubtableRow from './SubtableRow';

function getKeys(data) {
	if (data.length == 0)
		return;
	//console.log(Object.keys(data[0]));
	return Object.keys(data[0]);
}

function getValues(data) {
	var i; var j;
	var keys = getKeys(data);
	console.log(keys);
	var vals = [];
	for (i=0; i<data.length; i++) {
		var row = [];
		for (j=0; j<keys.length; j++) {
			row.push(data[i][keys[j]]);
		}
		vals.push(row);
	}
	return vals;
}

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
		    	  {this.makeColumnKeyElements()}
  			      <th> </th>
			    </tr>
			  </thead>
			  <tbody>
			  	{this.makeRows()}
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

	makeColumnKeyElements() {
		var i;
		var list = [];
		var keys = getKeys(this.state.data);
		for (i=0; i<keys.length; i++) {
			list.push(<th key={keys[i]}> {keys[i]} </th>);
		}
		return list;
	}

	makeRows() {
		var i;
		var list = [];
		var rowData = getValues(this.state.data);
		for (i=0; i<rowData.length; i++) {
			console.log(rowData[i]);
			list.push(<SubtableRow 
						data={rowData[i]} 
						itemName={this.props.itemName} 
						row={i} 
						key={this.props.itemName+"-"+i}/>
					);
		}
		return list;
	}

	//["1", "Larry", "the Bird", "@Twitter", "happy"]
}

export default InventorySubTable