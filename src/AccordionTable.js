import React, { Component } from 'react';
import './App.css';
import CollapsibleRow from './CollapsibleRow.js';

class AccordionTable extends Component {

	constructor(props) {
		super(props);
		
		// props will include number of rows,
		// number of columns, and names of columns.
	}

	render() {
		return (
			<div className="panel panel-default main-table">
				<div className="panel-heading inventory-table-heading"> 
					<div className="row">
						<div className="col-xs-10"> Item Name </div>
						<div className="col-xs-2"> Quantity </div>
					</div>
				</div>
				<div className="panel-group" id="accordion">
					<CollapsibleRow itemName={"Oscilloscope"} qty={10} />
					<CollapsibleRow itemName={"Voltmeter"} qty={11} />
					<CollapsibleRow itemName={"LED"} qty={12} />
				</div>
			</div>
		);
	}


}

export default AccordionTable