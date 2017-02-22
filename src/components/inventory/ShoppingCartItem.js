import React, { Component } from 'react';
import '../../App.css';

class ShoppingCartItem extends Component {

	constructor(props) {
		super(props);
		this.state = {
			quantity: props.quantity,
			itemName: props.itemData.name,
			modelNumber: props.itemData.model_number,
			id: props.itemData._id
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			quantity: newProps.quantity,
			itemName: newProps.itemData.name,
			modelNumber: newProps.itemData.model_number,
			id: newProps.itemData._id
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
			    <div className="row">{"Model: " + this.state.modelNumber}</div>
			    <div className="row">{"Quantity: " + this.state.quantity}</div>
		    </div>
		  </div>
		</div>);
	}

}

export default ShoppingCartItem;