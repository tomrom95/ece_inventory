import React, { Component } from 'react';
import './App.css';
import InventorySubTable from './InventorySubTable';

class CollapsibleRow extends Component {

	constructor(props) {
		super(props);
		this.state = {
			qty: props.qty
		}
		// props will include what is initially inside each cell in the row
	}

	makeSubtable() {

		var tableData = [{
					ModelNumber: "1", 
					Description: "Larry", 
					Location: "the Bird",
					Quantity: 10,
					Tags: "happy"
					},
					{ModelNumber: "1", 
					Description: "Larry", 
					Location: "the Bird",
					Quantity: 10,
					Tags: "sad"
					}];
		return (
			<InventorySubTable data={tableData} itemName={this.props.itemName} ref={this.props.itemName+"-component"}/>
		);
	}

	render() {
		var subtable = this.makeSubtable();
		return (
			<div className="panel panel-default">
				<div className="panel-heading inventory-table-row">
		      		<h4 className="panel-title">
		      			<div className="row" data-toggle="collapse" data-parent="#accordion" href={"#"+this.props.itemName}>
			        		<div className="col-xs-10 panel-font"> {this.props.itemName} </div>
			        		<div className="col-xs-2 panel-font"> {this.state.qty} </div>
			        	</div>
		      		</h4>

		    	</div>
		    	<div id={this.props.itemName} className="panel-collapse collapse">
			      <div className="subtable-body">
			      	{subtable}
			      </div>
    			</div>
		    </div>
		);
	}

	componentDidMount() {

	}

	componentWillUnmount() {

	}

	/*
  		<h4 className="panel-title">
    		<a data-toggle="collapse" data-parent="#accordion" href={"#"+this.props.itemName}>
    		{this.props.itemName}</a>
  		</h4>
	*/

}

export default CollapsibleRow