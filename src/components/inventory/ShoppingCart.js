import React, { Component } from 'react';
import ShoppingCartItem from './ShoppingCartItem.js';
import '../../App.css';

class ShoppingCart extends Component {

	/*
		The way this cart is populated:
			- all requests in cart are retrieved from API call
		State = {
			reason: [String]
			requestObject: Array({RequestObjects}) (as defined by backend)
		}
	*/

	constructor(props) {
		super(props);
	}

	loadData() {
		// api call that loads data and re-renders
	}

	sendRequests() {
		// api call with all request objects
	}

	deleteCartItem(itemId) {
		// api call to delete item
		// invoke loadData method
	}

	render() {
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
				        <h5 className="modal-title">{"Shopping Cart (3 items)"}</h5>
				      </div>
				      <div className="modal-body">
				      	<div className="cart-body container">
				      		<div className="row">
				      			<ShoppingCartItem Name={"Oscilloscope"} Model={"Unknown"} Vendor={"Agilent"} Quantity={10} />
				      		</div>
				      		<div className="row">
				      			<ShoppingCartItem Name={"Oscilloscope"} Model={"Unknown"} Vendor={"Agilent"} Quantity={10} />
				      		</div>	
				      		<div className="row">
				      			<ShoppingCartItem Name={"Oscilloscope"} Model={"Unknown"} Vendor={"Agilent"} Quantity={10} />
				      		</div>			        	
			        	</div>
			        	<div className="container">
					        <div className="form-group row">
		                          <label htmlFor="cart-reason"><strong>Reason *</strong></label>
		                          <input className="form-control" type="text" defaultValue="" id="cart-reason"/>
		                    </div>
	                    </div>
				      </div>
				      <div className="modal-footer">
				      	<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
				        <button type="button" data-dismiss="modal" className="btn btn-primary">Request These Items</button>
				      </div>
				    </div>
				  </div>
				</div>
			</th>
		);
	}
}

export default ShoppingCart;