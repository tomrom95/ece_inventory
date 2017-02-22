import React, { Component } from 'react';
import '../../App.css';

class RequestItemsPopup extends Component {

	/*
		props will contain:
		- array of mappings from item (objects) to quantity
		- request ID
	*/

	constructor(props) {
		super(props);
		this.state = {
			items: props.items,
			id: props.id
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			items: newProps.items,
			id: newProps.id
		});
	}

	makeItemsList() {

		if (this.state.items.length === 0) {
    		return (<p><strong>Something went wrong!</strong></p>);
    	}

		var list = [];
		var i;
		for (i=0; i<this.state.items.length; i++) {
			var itemName = this.state.items[i].item.name;
			var quantity = this.state.items[i].quantity;
			list.push(
				<div key={"requestInfoRow-"+this.state.id+"-"+i} className="row">
					<p key={"requestInfoItem-"+this.state.id+"-"+i}>
						{itemName + " (" + quantity+") "}
					</p>
		        </div>
		    );
    	}    	
    	return list;
	}

	render() {
	    return (
	      <td>
	        <button type="button"
	          className="btn btn-outline-primary info-button"
	          data-toggle="modal"
	          data-target={"#requestInfoModal-"+this.state.id} >
	            <span className="fa fa-info"></span>
	        </button>

	        <div className="modal fade"
	              id={"requestInfoModal-"+this.state.id}
	              tabIndex="-1"
	              role="dialog"
	              aria-labelledby="requestInfoLabel"
	              aria-hidden="true">
	            <div className="modal-dialog" role="document">
	              <div className="modal-content">

	                <div className="modal-body">

	                  <div className="row">
	                    <div className="col-xs-4 detail-view-title"><h4>Items in this Request</h4></div>
	                    <div className="col-xs-8 info-icon"><span className="fa fa-info"></span></div>
	                  </div>

	                  <div className="row">
	                    <div className="offset-md-1 col-md-10">
	                    	{this.makeItemsList()}
	                    </div>
	                  </div>

	                </div>

	              </div>
	            </div>
	        </div>
	      </td>
    );
  }
}

export default RequestItemsPopup;