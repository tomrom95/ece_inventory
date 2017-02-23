import React, { Component } from 'react';
import UserSelect from '../user/UserSelect.js';
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

function getString(str) {
	if (str === undefined || str === null || str === 'undefined' || str.length===0) {
		return "N/A";
	}
	else return String(str);
}

class AddToCartButton extends Component {

	constructor(props) {
		super(props);
		this.state = {
			checked: false
		}
	}

	makeTextBox(id, type, label, defaultText){
		return (
			<div className="form-group row request-quantity" key={id}>
			  <label htmlFor={id}>{label}</label>
			  <input type={type} className="form-control" defaultValue={defaultText} id={id}></input>
			</div>
		);
	}

	handleCheckboxChange(event) {
	    const value = event.target.checked;
	    this.setState({
	      checked: value
	    });
	}

	makeCheckBox(){
		var role = JSON.parse(localStorage.getItem('user')).role;
		if (role === "ADMIN" || role === "MANAGER") {
			return (
				<div className="request-quantity row" key={"request-on-behalf-row"}>
				  <div className="col-xs-10">
				  	<label htmlFor={"request-on-behalf-box"}>Assign to User:</label>
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
		else return null;
	}

	requestOnBehalf() {
		if (this.state.checked === true) {
			return (		
				<div className="row request-quantity user-select-box">
					<UserSelect ref="userSelect" api={this.props.api}/>
				</div>
			);
		}
		else return null;
	}

	makeDirectRequestRegion() {
	 return (
	        <div>
	        	{this.makeCheckBox("disburse-textbox-" + this.props.itemId, "checkbox", "Disburse to User", "")}
	        	{this.requestOnBehalf()}	                 
	        </div>
	  );
	}

	sendRequest() {
		var qty = document.getElementById("qty-textbox-" + this.props.itemId).value;

		var val = isWholeNumber(qty);
		if (val !== true) {
			alert(val);
			return;
		}

		var cartItem = {
			item: this.props.itemId,
			quantity: Number(qty)
		}

		var role = JSON.parse(localStorage.getItem('user')).role;
		if (role === "ADMIN" || role==="MANAGER") {
			if (this.state.checked === true)
				cartItem.user = this.refs.userSelect.getSelectedUserId();
		}

		this.props.api.post('/api/cart/items', cartItem)
		.then(function(response) {
	        if (response.data.error) {
	        	alert(response.data.error);
	        }
	      }.bind(this))
	      .catch(function(error) {
	        console.log(error);
	      }.bind(this));

	}

	clearView() {
		document.getElementById("qty-textbox-" + this.props.itemId).value = "";
		this.setState({
			checked: false
		});
	}

	render() {
		return (
			<td className="subtable-row">
				<button type="button" className="btn btn-outline-primary request-button" data-toggle="modal"
					data-target={"#requestPopup-"+this.props.itemId}>
						<div>
						<span className="fa fa-shopping-cart add-to-cart-icon"></span>
						<span>+</span>
						</div>

				</button>
				<div className="modal fade"
					id={"requestPopup-"+this.props.itemId}
					tabIndex="-1" role="dialog"
					aria-labelledby="modalLabel"
					aria-hidden="true">

				  <div className="modal-dialog" role="document">
				    <div className="modal-content add-to-cart">
				      <div className="modal-header">
				        <h6 className="modal-title" id="modalLabel">
				        	<div>{this.props.itemName} </div>
				        </h6>
				      </div>

				      <div className="modal-body">
						{this.makeTextBox("qty-textbox-" + this.props.itemId, "text", "Quantity", "")}
						{this.makeDirectRequestRegion()}
					  </div>

				      <div className="modal-footer">
				        <button type="button" onClick={e => this.clearView()} className="btn btn-secondary" data-dismiss="modal">Cancel</button>
				        <button type="button" onClick={e=>{this.sendRequest(); this.clearView()}} className="btn btn-primary" data-dismiss="modal">Add to Cart</button>
				      </div>

				    </div>
				  </div>
				</div>
			</td>
		);
	}
}

export default AddToCartButton;
