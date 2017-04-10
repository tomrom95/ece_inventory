import React, { Component } from 'react';
import './App.css';
import CollapsibleRow from './CollapsibleRow.js';
import axios from 'axios';


class AccordionTable extends Component {

	constructor(props) {
		super(props);
		
		// props will include number of rows,
		// number of columns, and names of columns.
	}

	calculateQuantity(itemName) {
		console.log("keys are: " + Object.keys(this.props.data));
		var modelList = this.props.data[itemName];
		var i;
		var count = 0;
		for (i=0; i<modelList.length; i++) {
			count += modelList[i]["Quantity"];
		}
		return count;
	}

	makeRows(dataList) {
		var list = [];
		var i;
		var keys = Object.keys(dataList);
		for (i=5; i<keys.length; i++) {
			console.log(keys[i]);
			list.push(<CollapsibleRow 
					key={keys[i].replace(/ /g,'')} 
					itemName={keys[i]} 
					qty={this.calculateQuantity(keys[i])} 
					subItems={dataList[keys[i]]} />);
		}
		return list;
	}

	render() {
		//this.calculateQuantity("Oscilloscope");
		return (
			<div className="panel panel-default main-table">
				<div className="panel-heading inventory-table-heading"> 
					<div className="row">
						<div className="col-xs-10"> Item Name </div>
						<div className="col-xs-2"> Quantity </div>
					</div>
				</div>
				<div className="panel-group" id="accordion">
					{this.makeRows(this.props.data)}
				</div>
			</div>
		);
	}


}

export default AccordionTable