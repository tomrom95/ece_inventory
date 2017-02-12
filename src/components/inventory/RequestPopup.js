import React, { Component } from 'react';
import '../../App.css';
import RequestSubtable from '../requests/RequestSubtable.js';

function validNumber(num) {
	return !isNaN(num);
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

function getDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function getString(str) {
	if (str === undefined || str === null || str === 'undefined' || str.length===0) {
		return "N/A";
	}
	else return String(str);
}

class RequestPopup extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: this.props.data
		}
	}

	render() {
		var modalBody = this.makeModalBody();
		return (
			<td className="subtable-row">
				<button type="button" className="btn btn-outline-primary request-button" data-toggle="modal"
					data-target={"#requestPopup-"+this.props.itemId}>
					<span className="fa fa-shopping-cart"></span>
				</button>
				<div className="modal fade"
					id={"requestPopup-"+this.props.itemId}
					tabIndex="-1" role="dialog"
					aria-labelledby="modalLabel"
					aria-hidden="true">
				  <div className="modal-dialog" role="document">
				    <div className="modal-content">
				      <div className="modal-header">
				        <h5 className="modal-title" id="modalLabel">
				        	<div>{"Item Name: " + this.props.itemName} </div>
				        	<div> {"Model Number: " + getString(this.props.modelName)} </div>
				        </h5>
				      </div>
				      	{modalBody}
				      <div className="modal-footer">
				        <button type="button" className="btn btn-primary" data-dismiss="modal">Cancel</button>
				        <button type="button" onClick={e=>{this.sendRequest(); this.clearView()}} className="btn btn-primary" data-dismiss="modal">Request</button>
				      </div>
				    </div>
				  </div>
				</div>
			</td>
		);
	}

	makeModalBody() {
		if(this.props.isAdmin){
			return (
			<div className="modal-body">
				{this.makeTextBox("qty-textbox-" + this.props.itemId, "text", "Quantity to Request", "")}
				{this.makeTextBox("reason-textbox-" + this.props.itemId, "text", "Reason for Request", "")}
				{this.makeTextBox("comment-textbox-" + this.props.itemId, "text", "Additional Comments", "")}
				{this.makeTextBox("username-textbox-" + this.props.itemId, "text", "Username", "")}

			</div>
			);
		}
		else{
			return (
			<div className="modal-body">
				{this.makeTextBox("qty-textbox-" + this.props.itemId, "text", "Quantity to Request", "")}
				{this.makeTextBox("reason-textbox-" + this.props.itemId, "text", "Reason for Request", "")}
				{this.makeTextBox("comment-textbox-" + this.props.itemId, "text", "Additional Comments", "")}

			</div>
			);
		}

	}

	makeTextBox(id, type, label, defaultText){
		return (
			<div className="form-group row request-quantity" key={id}>
			  <label htmlFor={id}>{label}</label>
			  <input type={type} className="form-control" defaultValue={defaultText} id={id}></input>
			</div>
		);
	}

	sendRequest() {
		var qty = document.getElementById("qty-textbox-" + this.props.itemId).value;
		var reasonVal = document.getElementById("reason-textbox-"+ this.props.itemId).value;
		var comment = document.getElementById("comment-textbox-" + this.props.itemId).value;
		var username = "";


		var val = isWholeNumber(qty);
		if (val !== true) {
			alert(val);
			return;
		}

		if (Number(qty) === 0) {
			alert("Request quantity cannot be zero.");
			return;
		}

		if (Number(qty) > this.props.data[0].Quantity) {
			alert("Request quantity cannot exceed availability");
			return;
		}

		if (reasonVal.length === 0) {
			alert("Reason is a required field");
			return;
		}

		var request = {
          reviewer_comment: "",
          requestor_comment: comment,
          reason: reasonVal,
          quantity: qty,
          status: "PENDING",
          created: "",
          item: this.props.itemId
        };

				if(this.props.isAdmin ){

					if(document.getElementById("username-textbox-" + this.props.itemId).value){
						username = document.getElementById("username-textbox-" + this.props.itemId).value;
						request = {
							reviewer_comment: "",
		          requestor_comment: comment,
		          reason: reasonVal,
		          quantity: qty,
		          status: "PENDING",
		          created: "",
		          item: this.props.itemId,
							user: username
						};
					}


				}
  		this.props.api.post('/api/requests', request)
	  	.then(function(response) {
	        if (response.data.error) {
	        	alert(response.data.error);
	        } else {

	        }
	      }.bind(this))
	      .catch(function(error) {
	        console.log(error);
	      }.bind(this));

	}

	clearView() {
		document.getElementById("qty-textbox-" + this.props.itemId).value = "";
		document.getElementById("reason-textbox-" + this.props.itemId).value = "";
		document.getElementById("comment-textbox-" + this.props.itemId).value = "";
	}

	update(newData) {
		// Method for later use when we have instances on front-end/

		// make sure you format newData to include keys... or change the way it's passed in.
		/*this.setState({
			data: newData
		});
		*/
	}
}

export default RequestPopup;
