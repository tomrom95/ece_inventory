import React, { Component } from 'react';
import '../../App.css';
import LogItem from '../logging/LogItem.js';

function getString(str) {
	if (str === undefined || str === null || str.trim().length === 0) {
		return "N/A";
	}
	else return String(str);
}

function validNumber(num) {
	if (!isNaN(num)) {
		return (num >= 0);
	}
	return false;
}

function isWholeNumber(num) {
	if (!validNumber(num)) {
		return "Not a valid number!";
	}
	else {
		if (Number(num) !== parseInt(num)) {
			return "Please input a positive whole number!";
		}
		else return true;
	}
}

class ShoppingCartItem extends Component {

	constructor(props) {
		super(props);
		this.state = {
			quantity: props.quantity,
			itemName: props.itemData.name,
			modelNumber: props.itemData.model_number,
			id: props.itemData._id,
			updateButtonVisible: false
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			quantity: newProps.quantity,
			itemName: newProps.itemData.name,
			modelNumber: newProps.itemData.model_number,
			id: newProps.itemData._id,
			updateButtonVisible: false
		});
	}

	deleteItem() {
		this.props.api.delete("/api/cart/items/" + this.state.id)
		.then(function (response) {
			if (response.data.error) {
				console.log(response.data.error);
			}
			else {
				this.props.callback();
			}
		}.bind(this));
	}

	updateQuantity() {
		var qty = this.refs["qty-"+this.state.id].value;
		var message = isWholeNumber(qty);

		if (message !== true) {
			alert(message);
			return;
		}

		var params = {quantity: qty};
		this.props.api.put("api/cart/items/" + this.state.id, params)
		.then(function (response) {
			if (response.data.error) {
				alert(response.data.error);
			}
			else {
				this.setState({
					quantity: this.refs["qty-"+this.state.id].value,
					updateButtonVisible: false
				});
			}
		}.bind(this));
	}

	makeUpdateButton() {
		if (this.state.updateButtonVisible === true)
			return (
					<button type="button"
			          className="btn btn-sm btn-primary row cart-update-button"
			          onClick={() => this.updateQuantity()}>
			            Update
		    		</button>
        	);
		else return null;
	}

	handleFormChange(event) {
		var qty = event.target.value;
		if (qty >= 1 || qty === "") {
			this.setState({
				quantity: qty,
				updateButtonVisible: true
			});
		}
	}

	render() {
		return (
		<div className="card cart-item">
		  <div className="card-block">
		  	<div className="row">
			  	<h5 className="col-md-10"> 
			  		{this.state.itemName}
			  	</h5>
			  	<div className="col-md-2">
			  		<button 
			  		onClick={() => this.deleteItem()} 
			  		type="button" 
			  		className="btn btn-danger btn-sm">
			  			<span className="fa fa-remove"></span>
			  		</button>
			  	</div>
		  	</div>
			<div className="container">
			    <div className="row">
			    	{"Model: " + getString(this.state.modelNumber)}
			    </div>		    
			    <div className="row" key={"qty-textbox-"+this.state.id}>
			  		<label className="cart-quantity-label" htmlFor={"qty-"+this.state.id}>{"Quantity:"}</label>
			  		<input type={"number"} 
			  			className="form-control cart-quantity-box" 
			  			value={this.state.quantity} 
			  			onChange={e => this.handleFormChange(e)}
			  			ref={"qty-"+this.state.id}>
			  		</input>
				</div>
				{this.makeUpdateButton()}
		    </div>
		  </div>
		</div>);
	}

}

export default ShoppingCartItem;