import React, { Component } from 'react';
import '../../App.css';

class ShoppingCartItem extends Component {

	/*
		props will contain:
			- ID
			- Quantity
			- callback: rerender the cart.
	*/

	constructor(props) {
		super(props);
		this.state = {
			quantity: props.quantity
		}
	}

	deleteItem() {
		this.props.api.delete("/api/cart/items/" + this.props.id)
		.then(function (response) {
			if (response.data.error) {
				console.log(response.data.error);
			}
			else {
				this.props.callback();
			}
		}.bind(this));
	}

	getItemData(id) {
		this.props.api.get('api/inventory/' + this.props.id)
	    .then(function(response) {
	    	if (response.data.error) {
	    		console.log(response.data.error);
	    	}
	    	else {
	    		this.setState({
	    			itemName: response.data.name,
	    			modelNumber: response.data.model_number
	    		});
	    	}
	    }.bind(this))
	    .catch(function(error) {
	      console.log(error);
	    }.bind(this));
	}

	render() {
		this.getItemData(this.props.id);
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
			    <div className="row">{"Model: " + this.state.modelNumber}</div>
			    <div className="row">{"Quantity: " + this.state.quantity}</div>
		    </div>
		  </div>
		</div>);
	}

}

export default ShoppingCartItem;