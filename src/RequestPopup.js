import React, { Component } from 'react';
import './App.css';
import InventorySubTable from './InventorySubTable.js'

function makeData() {
	var tableData = [{
		Serial: "1676394",
		Condition: "New",
		Status: "Missing",
		Quantity: 1,
	},
	{
		Serial: "N/A",
		Condition: "New",
		Status: "Missing",
		Quantity: 53,
	}];
	console.log("Called!");
	return tableData;
}

class RequestPopup extends Component {

	constructor(props) {
		super(props);
		var tableData = makeData();
		this.state = {
			data: tableData
		}
		console.log("Model name: " + this.props.modelName)
	}

	render() {

		return (
			<td>
				<button type="button" className="btn btn-primary" data-toggle="modal"
					data-target={"#requestPopup-"+this.props.itemName+"-"+this.props.modelName}>
					Request
				</button>
				<div className="modal fade"
					id={"requestPopup-"+this.props.itemName+"-"+this.props.modelName}
					tabIndex="-1" role="dialog"
					aria-labelledby="modalLabel"
					aria-hidden="true">
				  <div className="modal-dialog" role="document">
				    <div className="modal-content">
				      <div className="modal-header">
				        <h5 className="modal-title" id="modalLabel">
				        	{this.props.itemName + ": " + this.props.modelName}
				        </h5>
				      </div>
				      	{this.makeModalBody()}
				      <div className="modal-footer">
				        <button type="button" className="btn btn-primary" data-dismiss="modal">Cancel</button>
				        <button type="button" className="btn btn-primary">Request</button>
				      </div>
				    </div>
				  </div>
				</div>

			</td>
		);
	}

	makeModalBody() {
		return (
		<div className="modal-body row">
			<InventorySubTable
				className="col-xs-12"
				data={this.state.data}
				itemName={this.props.modelName}
				ref={this.props.modelName+"-component"}
				hasButton={false}
				isInventorySubtable={false}/>
		</div>
		);
	}
}

export default RequestPopup;
