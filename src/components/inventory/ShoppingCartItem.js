import React, { Component } from 'react';
import '../../App.css';

class ShoppingCartItem extends Component {

	/*
		props will contain:
			- ID
			- Name 
			- Model
			- Vendor
			- Quantity
			- callback: delete cart item by id.
	*/

	constructor(props) {
		super(props);
		this.state = props;
	}

	getItemId() {
		return this.state.ID;
	}

	deleteItem() {
		// do callback to remove the item from cart
		// which also includes a call to refresh cart view
		// takes this.state.id param
	}

	render() {
		return (
		<div className="card cart-item">
		  <div className="card-block">
		  	<div className="row">
			  	<h5 className="col-md-10"> 
			  		{this.state.Name}
			  	</h5>
			  	<div className="col-md-2">
			  		<button type="button" className="btn btn-danger btn-sm"><span className="fa fa-trash"></span></button>
			  	</div>
		  	</div>
			<div className="container">
			    <div className="row"><strong>Model:</strong>{this.state.Model}</div>
			    <div className="row"><strong>Vendor:</strong>{this.state.Vendor}</div>
			    <div className="row"><strong>Quantity:</strong>{this.state.Quantity}</div>
		    </div>
		  </div>
		</div>);
	}

}

export default ShoppingCartItem;