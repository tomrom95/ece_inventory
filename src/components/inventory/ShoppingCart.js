import React, { Component } from 'react';
import ShoppingCartItem from './ShoppingCartItem.js';
import UserSelect from '../user/UserSelect.js';
import FulfillRequestForm from '../requests/FulfillRequestForm.js';
import '../../App.css';

class ShoppingCart extends Component {

	constructor(props) {
		super(props);
		this.state = {
			items: [],
			checked: null,
			actionType: "Assign to User",
			requestType: "DISBURSEMENT",
			requestTypeDisplay: "Request for Disbursement",
			needToFulfill: false,
			requestSubmitted: false,
			current_request: null,
		}
	}

	loadData() {
		this.props.api.get('api/cart/')
		.then(function(response) {
			if (response.data.error) {
				console.log(response.data.error);
			}
			else {
				this.setState({
					items: response.data.items,
					checked: false
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
					itemData={items[i].item}
					quantity={items[i].quantity}
					callback={() => this.loadData()} />
				</div>));
		}
		return list;
	}

	refineRequestData(response_request){
		var new_body = {
			Items: response_request.items,
			_id: response_request._id,
		}
		return new_body;
	}

	sendRequests() {
		var reason = document.getElementById('cart-reason').value;
		if ((reason.trim()).length === 0 && !this.state.checked) {
			alert("Reason field cannot be blank.");
			return;
		}

		var params = {
			action: "CHECKOUT",
			reason: reason,
			type: this.state.requestType
		}

		var role = JSON.parse(localStorage.getItem('user')).role;
		if (role === "ADMIN" || role==="MANAGER") {
			if (this.state.checked === true) {
				params.user = this.refs.userSelect.getSelectedUserId();
				if (!params.user) {
					alert("User must be selected");
					return;
				}
			}
		}

		this.props.api.patch('api/cart/', params)
		.then(function (response) {
			if (response.data.error) {
				alert(response.data.error);
			}
			else {
				var requestId = response.data.request._id;
				this.setState({
					requestSubmitted: true,
				})
				if (this.state.checked === true && this.state.actionType === "Fulfill to User") {
					this.setState({
						needToFulfill: true,
						current_request: this.refineRequestData(response.data.request),
					});

				}
			}
		}.bind(this));
		document.getElementById('cart-reason').value = '';
	}

	makeReasonBox() {
		return ((this.state.items.length===0) ? <div>Your cart is currently empty.</div>
						  : (<div className="form-group row">
		                          <label htmlFor="cart-reason">Reason for Request</label>
		                          <input className="form-control" type="text" defaultValue="" id="cart-reason"/>
		                    </div>)
	  	);
	}

	handleCheckboxChange(event) {
	    var value = event.target.checked;
	    this.setState({
	      checked: value
	    });
	}

	setActionType(action) {
		this.setState({
			actionType: action
		});
	}

	makeCheckBox(){
		var role = JSON.parse(localStorage.getItem('user')).role;
		if (role === "ADMIN" || role === "MANAGER") {
			return (
				<div className="row request-quantity" key={"request-on-behalf-row"}>
				  <div className="col-xs-10">
				  	<label htmlFor={"request-on-behalf-box"}>Assign/Fulfill to User</label>
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

	makeUserSelectDropdown() {
		if (this.state.checked === true) {
			return (
				<div className="row request-quantity">
					<UserSelect ref="userSelect" api={this.props.api}/>
				</div>
			);
		}
		else return null;
	}

	makeActionTypeDropdown() {
		if (this.state.checked === true) {
			return (
				<div className="row form-group request-quantity">
					<div className="btn-group">
				        <button type="button" className="btn btn-secondary dropdown-toggle cart-actiontype-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				          {this.state.actionType}
				        </button>
				        <div className="dropdown-menu">
				          	<a onClick={()=>this.setActionType("Assign to User")} className="dropdown-item" href="#">
				            	Assign to User
				          	</a>
			          		<a onClick={()=>this.setActionType("Fulfill to User")} className="dropdown-item" href="#">
				            	Fulfill to User
				          	</a>
				        </div>
				    </div>
			    </div>
		    );
		} else return null;
	}

	makeDirectRequestRegion() {
		if (this.state.items.length === 0) {
			return null;
		}
	 	else if (this.state.items.length > 0)
	 		return (
		        <div className="form-group row">
		        	{this.makeCheckBox()}
		        	{this.makeActionTypeDropdown()}
		        	{this.makeUserSelectDropdown()}
		        </div>
	  		);
	}

	makeRequestTypeDropdown() {
		if (this.state.items.length === 0) {
			return null;
		}
		return (
			<div className="row form-group">
				<div className="btn-group request-type-dropdown">
			        <button type="button" className="btn btn-secondary dropdown-toggle cart-actiontype-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			          {this.state.requestTypeDisplay}
			        </button>
			        <div className="dropdown-menu form-control cart-actiontype-dropdown">
			          	<a onClick={()=>this.setRequestType("LOAN")} className="dropdown-item" href="#">
			            	Request for Loan
			          	</a>
		          		<a onClick={()=>this.setRequestType("DISBURSEMENT")} className="dropdown-item" href="#">
			            	Request for Disbursement
			          	</a>
			        </div>

			    </div>
		    </div>
	    );
	}

	setRequestType(type) {
		this.setState({
			requestType: type,
			requestTypeDisplay: (type === "DISBURSEMENT" ? "Request for Disbursement" : "Request for Loan")
		});
	}

	clearCheckbox() {
		this.setState({
			checked: false,
			needToFulfill: false,
			requestSubmitted: false,
		});
	}


	render() {
		var submitDisabled = (this.state.items.length===0) ? "disabled" : "";

		var assign_success = "Successfully checked out "  + this.state.items.length + " items."
		var EndForm = (
			<div className="modal-content cart-modal">
				<div className="modal-header">
					<h5 className="modal-title">
						Done
					</h5>
				</div>
				<div className="modal-body">
					{assign_success}
				</div>
				<div className="modal-footer">
					<button type="button"
							className="btn btn-secondary"
							data-dismiss="modal"
							onClick={() => this.clearCheckbox()}>
						Close
					</button>

				</div>
			</div>
		);
		var fulfillForm = (
			<FulfillRequestForm
				data={this.state.current_request}
				api={this.props.api}
				callback={() => this.props.callback()}
				clearForm={() => this.clearCheckbox()}
				cancel={true}
			/>
		);

		var ShoppingCartForm = (
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
						{this.makeReasonBox()}
						{this.makeDirectRequestRegion()}
						{this.makeRequestTypeDropdown()}
								</div>

				</div>
				<div className="modal-footer">
					<button type="button"
							className="btn btn-secondary"
							data-dismiss="modal"
							onClick={() => this.clearCheckbox()}>
						Close
					</button>
					<button onClick={() => this.sendRequests()}
							type="button"
							className={"btn btn-primary " + submitDisabled}>
							Request These Items
					</button>

				</div>
			</div>
		);
		var body;
		if(!this.state.requestSubmitted){
			body = ShoppingCartForm;
		}
		else{
			if(this.state.needToFulfill){
				body = fulfillForm;
			}
			else{
				body = EndForm;
			}
		}
 		return (
 			<div>
        <a className="nav-link shopping-cart-tab" href="#"
                		data-toggle="modal"
						data-target={"#cart-button"}
						onClick={() => this.loadData()}>
						My Cart <span className="fa fa-shopping-cart"></span>
				</a>
				<div className="modal fade" id="cart-button">
				  <div className="modal-dialog" role="document">
						{body}
					</div>
				</div>
			</div>
		);
	}
}

export default ShoppingCart;
