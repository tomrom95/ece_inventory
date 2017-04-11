import React, { Component } from 'react';
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

class MinimumQuantityEditor extends Component {

	/*
		Props: items checked in JSON form.
	*/

	constructor(props) {
		super(props);
		this.state = {
			checked: false,
			itemsChecked: this.makeItemsList(props.itemsChecked),
			itemNames: this.makeItemsList(props.itemsCheckedNames)
		}
	}

	componentWillReceiveProps(newProps) {		
		this.setState({
			itemsChecked: this.makeItemsList(newProps.itemsChecked),
			itemNames: this.makeItemsList(newProps.itemsCheckedNames)
		});
	}

	makeItemsList(itemsChecked) {
		var list = [];
		var keys = Object.keys(itemsChecked);
		for (var i=0; i<keys.length; i++) {
			if (itemsChecked[keys[i]] === true) {
				list.push(keys[i]);
			}
		}
		return list;
	}

	makeItemNames(itemIds) {
		console.log(itemIds);
		var itemNames = [];
		for (var i=0; i<itemIds.length; i++) {
			this.props.api.get("api/inventory/"+itemIds[i])
			.then( function (response) {
				itemNames.push(response.data.name);
				this.state.itemNames = itemNames;
			}.bind(this));
		}	
	}

	makeItemNamesListView() {
		var itemNames = this.state.itemNames;
		if (itemNames.length === 0) {
			return (<div>No items selected</div>);
		}
		else {
			var list = [];
			for (var i=0; i<this.state.itemNames.length; i++) {
				list.push(<div key={"item-"+i}> {this.state.itemNames[i]} </div>);
			}
			return list;
		}
	}

	makeTextBox(id, type, label, defaultText) {
		if (!this.state.checked) {
			return (
				<div className="request-quantity" key={id}>
				  <label htmlFor={id}>{label}</label>
				  <input type={type} className="form-control" defaultValue={defaultText} id={id} disabled></input>
				</div>
			);
		}
		else if (this.state.checked === true) {
			return (
				<div className="request-quantity" key={id}>
				  <label htmlFor={id}>{label}</label>
				  <input type={type} className="form-control" defaultValue={defaultText} id={id}></input>
				</div>
			); 
		}
	}

	handleCheckboxChange(event) {
	    var value = event.target.checked;
	    this.setState({
	      checked: value
	    });
	}

	sendRequest() {
		var qty = document.getElementById("qty-textbox-" + this.props.itemId).value;
		var items = this.state.itemsChecked;
		for (var i=0; i<items.length; i++) {
			var params = {	
	 			minstock_isEnabled: this.state.checked
	 		};
	 		if (this.state.checked===true) {
	 			params.minstock_threshold = Number(qty);
	 		}
			this.props.api.put('api/inventory/'+items[i], params)
	 		.then( function (response) {
	 			if (response.data.error) {
	 				alert(response.data.error);
	 			} else {
	 				//console.log(response.data);
		 			this.props.clearCheckboxes();
	 			}	
	 		}.bind(this));
		}
	}

	clearView() {
		document.getElementById("qty-textbox-" + this.props.itemId).value = "";
		this.setState({
			checked: false
		});
	}

	makeCheckBox(label){
		return (
			<div className="row request-quantity" key={"request-on-behalf-row"} >
			  <div className="col-xs-10">
			  	<label>{label}</label>
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

	render() {
		return (
			<div>
				<a className="nav-link userpage-tab" href="#" data-toggle="modal"
					data-target={"#minQuantityEditor-"+this.props.itemId}>
						<div>
							Set Threshold
						</div>
				</a>

				<div className="modal fade"
					id={"minQuantityEditor-"+this.props.itemId}
					tabIndex="-1" role="dialog"
					aria-labelledby="modalLabel"
					aria-hidden="true">

				  <div className="modal-dialog min-qty-modal" role="document">
				    <div className="modal-content add-to-cart">
				      <div className="modal-header">
				        <h6 className="modal-title" id="modalLabel">
				        	<div className="add-to-cart-title">Edit Minimum Quantity</div>
				        </h6>
				      </div>

				      <div className="modal-body">
				      	<div> <strong> Items Selected: </strong> </div>
				      	{this.makeItemNamesListView()}
				      	<br/>
				      	{this.state.itemNames.length === 0 ? null : this.makeCheckBox("Enable Threshold")}
						{this.state.itemNames.length === 0 ? null : this.makeTextBox("qty-textbox-" + this.props.itemId, "number", "Minimum Quantity", "")}
					  </div>

		      		{ this.state.itemNames.length === 0 ? <div className="modal-footer"></div> : 
				      (<div className="modal-footer">
				        <button type="button" 
				        		 onClick={e => this.clearView()} 
				        		 className="btn btn-secondary" 
				        		 data-dismiss="modal">
				        		 	Cancel
				        </button>
				        <button type="button" 
				        		onClick={e=>{this.sendRequest(); this.clearView()}} 
				        		className="btn btn-primary" 
				        		data-dismiss="modal">
				        			Apply
				        		</button> 
				      </div>)}
				  	  
				    </div>
				  </div>
				</div>
			</div>
		);
	}
}

export default MinimumQuantityEditor;
