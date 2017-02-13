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
	*/

	constructor(props) {
		super(props);
		this.state = props;
	}

	getItemId() {
		return this.state.ID;
	}

	render() {
		return (
		<div className="card">
		  <div className="card-header">
		  	<div className="row">
			  	<h5 className="col-md-8"> 
			  		{this.state.Name}
			  	</h5>
			  	<div className="col-md-4">
			  		<a href="#" className="btn btn-danger btn-sm">Delete</a>
			  	</div>
		  	</div>
		  </div>

		  <div className="card-block">
		    <p><strong>Model: </strong>{this.state.Model}</p>
		    <p><strong>Vendor: </strong>{this.state.Vendor}</p>
		    <p><strong>Quantity: </strong>{this.state.Quantity}</p>
		  </div>
		</div>);
	}

}

export default ShoppingCartItem;