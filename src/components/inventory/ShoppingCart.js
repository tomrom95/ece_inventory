import React, { Component } from 'react';
import ShoppingCartItem from './ShoppingCartItem.js';
import UserSelect from '../user/UserSelect.js';
import '../../App.css';

class ShoppingCart extends Component {

	constructor(props) {
		super(props);
		this.state = {
			items: [],
			checked: null,
			actionType: "Assign to User"
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

	sendRequests() {
		var reason = document.getElementById('cart-reason').value;
		if ((reason.trim()).length === 0) {
			alert("Reason field cannot be blank.");
			return;
		}

		var params = {
			action: "CHECKOUT",
			reason: reason
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
				if (this.state.checked === true && this.state.actionType === "Disburse to User") {
					this.props.api.patch('/api/requests/' + requestId, { action: "DISBURSE" })
	    			.then(function(response) {
	      				if(response.data.error){
	        				alert(response.data.error + ". A request was created but was not fulfilled.");
	      				}
				    }.bind(this))
				    .catch(function(error) {
				      alert(error);
				    }.bind(this));
				}
			}
		}.bind(this));
		document.getElementById('cart-reason').value = '';
	}

	makeReasonBox() {
		return ((this.state.items.length===0) ? <div>Your cart is currently empty</div>
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
				  	<label htmlFor={"request-on-behalf-box"}>Assign/Disburse to User</label>
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
			          		<a onClick={()=>this.setActionType("Disburse to User")} className="dropdown-item" href="#">
				            	Disburse to User
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

	clearCheckbox() {
		this.setState({
			checked: false
		});
	}

	render() {
		var submitDisabled = (this.state.items.length===0) ? "disabled" : "";
 		return (
			<th>
				<button data-toggle="modal"
						data-target={"#cart-button"}
						type="button"
						className="btn btn-outline-primary"
						onClick={() => this.loadData()}>
							My Cart <span className="fa fa-shopping-cart"></span>
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
			        		{this.makeReasonBox()}
			       			{this.makeDirectRequestRegion()}
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
				        		data-dismiss="modal"
				        		className={"btn btn-primary " + submitDisabled}>
				        		Request These Items
				        </button>
				      </div>
				    </div>
				  </div>
				</div>
			</th>
		);
	}
}

export default ShoppingCart;
