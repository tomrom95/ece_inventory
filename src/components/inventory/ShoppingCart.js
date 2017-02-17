import React, { Component } from 'react';
import ShoppingCartItem from './ShoppingCartItem.js';
import '../../App.css';

class ShoppingCart extends Component {

	constructor(props) {
		super(props);
		this.state = {
			items: []
		}
	}

	componentDidMount() {
		this.loadData();
	}

	loadData() {
		this.props.api.get('api/cart/')
		.then(function(response) {
			if (response.data.error) {
				console.log(response.data.error);
			}
			else {
				// DUMMY ITEM
				this.setState({
					items: [{item: "5897a11d8f9904df9c765fe9", quantity: 10}]
					//items: response.data.items
				});
			}
		}.bind(this));
	}

	makeCartItems() {
		var items = this.state.items;
		var list = []; var i;
		for (i=0; i<items.length; i++) {
			list.push(
				(<div key={"div-"+i} className="row">
					<ShoppingCartItem 
					api={this.props.api} 
					key={"cart-item-"+i} 
					id={items[i].item} 
					quantity={items[i].quantity}
					callback={() => this.loadData()} />
				</div>));
		}
		return list;
	}

	sendRequests() {
		// api call with all request objects
	}

	render() {
		var reasonBox = (this.state.items.length===0) ? <div>Your cart is currently empty</div> 
						  : (<div className="form-group row">
		                          <label htmlFor="cart-reason"><strong>Reason for Request</strong></label>
		                          <input className="form-control" type="text" defaultValue="" id="cart-reason"/>
		                    </div>);
		var submitDisabled = (this.state.items.length===0) ? "disabled" : "";
 		return (			
			<th>	
				<button data-toggle="modal" data-target={"#cart-button"}
						type="button"
						className="btn btn-secondary">
							<span className="fa fa-shopping-cart"></span>
				</button>
				<div className="modal fade" id="cart-button">
				  <div className="modal-dialog" role="document">
				    <div className="modal-content cart-modal">
				      <div className="modal-header">
				        <h5 className="modal-title">
				        {"Shopping Cart (" + 
				        	this.state.items.length + 
				        	((this.state.items.length===1) ? " item)" : " items)"
				        	)}
				        </h5>
				      </div>
				      <div className="modal-body">
				      	<div className="cart-body container">
				      		{this.makeCartItems()}	        	
			        	</div>
			        	<div className="container">
			        		{reasonBox}
	                    </div>
				      </div>
				      <div className="modal-footer">
				      	<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
				        <button type="button" data-dismiss="modal" className={"btn btn-primary " + submitDisabled}>Request These Items</button>
				      </div>
				    </div>
				  </div>
				</div>
			</th>
		);
	}
}

export default ShoppingCart;