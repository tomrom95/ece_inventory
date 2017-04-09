import React, { Component } from 'react';
import '../../App.css';

function validNumber(num) {
	if (!isNaN(num)) {
		return (num > 0);
	}
	return false;
}

function isWholeNumber(num) {
	if (!validNumber(num)) {
		return "Not a valid number!";
	}
	else {
		if (Number(num) !== parseInt(num)) {
			return "Please input a whole number!";
		}
		else return true;
	}
}

class AddToCartButton extends Component {

	/*
		Props: itemID
	*/

	constructor(props) {
		super(props);
		this.state = {
			checked: false	
		}
	}

	makeTextBox(id, type, label, defaultText) {
		if (!this.state.checked) {
			return (
				<div className="request-quantity" key={id}>
				  <label htmlFor={id}>{label}</label>
				  <input type={type} className="form-control" defaultValue={defaultText} id={id} disabled></input>
				</div>
			);
		}
		else if (this.state.checked === true) {
			return (
				<div className="request-quantity" key={id}>
				  <label htmlFor={id}>{label}</label>
				  <input type={type} className="form-control" defaultValue={defaultText} id={id}></input>
				</div>
			); 
		}
	}

	handleCheckboxChange(event) {
	    var value = event.target.checked;
	    this.setState({
	      checked: value
	    });
	}

	sendRequest() {
		var qty = document.getElementById("qty-textbox-" + this.props.itemId).value;
	}

	clearView() {
		document.getElementById("qty-textbox-" + this.props.itemId).value = "";
		this.setState({
			checked: false
		});
	}


	makeCheckBox(label){
		return (
			<div className="row request-quantity" key={"request-on-behalf-row"} >
			  <div className="col-xs-10">
			  	<label>{label}</label>
			  </div>
			  <div className="col-xs-2 cart-checkbox">
			  	<input type={"checkbox"}
			  			id={"request-on-behalf-row"}
			  			onChange={e => this.handleCheckboxChange(e)}
			  			checked={this.state.checked}>
			  	</input>
			  </div>
			</div>
		);
	}

	render() {
		return (
			<td>
				<button type="button" className="btn btn-sm btn-outline-primary" data-toggle="modal"
					data-target={"#minQuantityEditor-"+this.props.itemId}>
						<div>
							Edit
						</div>
				</button>

				<div className="modal fade"
					id={"minQuantityEditor-"+this.props.itemId}
					tabIndex="-1" role="dialog"
					aria-labelledby="modalLabel"
					aria-hidden="true">

				  <div className="modal-dialog" role="document">
				    <div className="modal-content add-to-cart">
				      <div className="modal-header">
				        <h6 className="modal-title" id="modalLabel">
				        	<div className="add-to-cart-title">Edit Minimum Quantity for Selected Items</div>
				        </h6>
				      </div>

				      <div className="modal-body">
			      		{this.makeCheckBox("Enable Threshold")}
						{this.makeTextBox("qty-textbox-" + this.props.itemId, "number", "Minimum Quantity", "")}
					  </div>

				      <div className="modal-footer">
				        <button type="button" onClick={e => this.clearView()} className="btn btn-secondary" data-dismiss="modal">Cancel</button>
				        <button type="button" onClick={e=>{this.sendRequest(); this.clearView()}} className="btn btn-primary" data-dismiss="modal">Apply</button>
				      </div>

				    </div>
				  </div>
				</div>
			</td>
		);
	}
}

export default AddToCartButton;
