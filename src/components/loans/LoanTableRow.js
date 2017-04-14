import React, { Component } from 'react';
import '../../App.css';
import { Tooltip } from 'reactstrap';
import UploadPdfModal from './UploadPdfModal.js';

function formatDate(dateString) {
  var i;
  var split = dateString.split(' ');
  var date = '';
  for (i=1; i<=4; i++) {
    date += split[i] + ' ';
  }
  return date;
}

class LoanTableRow extends Component {

	/*
		Row should contain:
			- initiating user
			- date created
			- date last modified
			- items table:
				- name
				- quantity
				- status
				- id (not displayed)
	*/

	constructor(props) {
		super(props);
		this.state = {
			_id: props.params._id,
			user: props.params.user,
			created: props.params.created,
			modified: props.params.modified,
			items: props.params.items,
			itemsModified: props.params.items,
			reviewer_comment: props.reviewer_comment,
			controlBarVisible: {},
      tooltipOpenMap: {},
		}
	}

	componentWillMount() {
		this.props.api.get("api/requests/"+ this.props.params.request_id)
		.then( response => {
			if (response.data.error) {
				alert(response.data.error);
			}
			else {
				this.setState({
					reviewer_comment: response.data.reviewer_comment
				});
			}
		});
    var tooltipOpenMap = this.state.tooltipOpenMap;
    for(var i = 0; i < this.state.items.length; i++){
      tooltipOpenMap[i] = false;
    }
    this.setState({
      tooltipOpenMap: tooltipOpenMap
    })
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			_id: newProps.params._id,
			user: newProps.params.user,
			created: newProps.params.created,
			modified: newProps.params.modified,
			items: newProps.params.items,
			itemsModified: newProps.params.items,
			reviewer_comment: newProps.reviewer_comment,
		});
	}

  makeToolkitItems(instances){

		if (instances.length === 0) {
    		return (<p><strong>Something went wrong!</strong></p>);
    	}

		var str = 'Instances:\n';
		var i;
		for (i=0; i<instances.length; i++) {
			var tag = instances[i].tag;
			str += "   " + tag +  '\n';
    	}

    	return str;

  }

	makeItemRows() {
		var items = this.state.items;
		var list = [];
		var i;
		for (i=0; i<items.length; i++) {

			var key = "loan-item-id-"+items[i]._id;
			var backfillColumns = [];

			backfillColumns.push(
				<td className="loan-control-bar" key={key+"-backfill-status"}>
					{items[i].status}
					{this.makeBackfillControlBar(i)}
				</td>
			);

			list.push(
			    <tr key={key} id={items[i].item.name}>
			      <td key={key + "-col1"}>{items[i].item.name}</td>
			      <td key={key + "-col2"}>{items[i].quantity}</td>
			      {
			      	(this.state.controlBarVisible[i]) === true ? this.makeControlBar(i) :

				      items[i].status === "LENT" ?
				      (<div>
				      	<td className="status-cell" key={key + "-col3"}>
				      	<a href="#/"
					      	onClick={this.makeOnClickShow(i)}
					      	key={key + "-status"}>
				      		{items[i].status}
				      	</a>
				      </td>
				      <td key={key+"-request-backfill-button"}>
				      	<UploadPdfModal item_id={items[i].item._id}
				      					loan_id={this.state._id}
				      					submitBackfillRequest={this.makeOnClickBackfillRequest(i, "BACKFILL_REQUESTED")} />
			  	  	  </td>
			  	  	 </div>

				      ) : items[i].status === "BACKFILL_REQUESTED" ? backfillColumns :
				      (<td className="status-cell" key={key + "-col3"}>
				      	<a key = {key + "-status"}>
			      			{items[i].status}
			      	  	</a>
			      	  </td>
			      	  )
			  	  }
			    </tr>
			);
      if(items[i].instances !== null){
        if(items[i].instances.length > 0){
          list.push(
            <Tooltip placement="bottom"
               isOpen={this.state.tooltipOpenMap[i]}
               target={items[i].item.name}
               toggle={this.toggle.bind(this, i)}
               autohide={false}
               key={items[i]._id}>
               {this.makeToolkitItems(items[i].instances)}
            </Tooltip>
          );
        }

      }
		}
		return list;
	}

	makeOnClickShow(i) {
		var func = this.showControlBar;
		var context = this;
	    return function() {
	      func(i, context);
	      return false;
	    };
	}

	makeOnClickHide(i) {
		var func = this.hideControlBar;
		var context = this;
	    return function() {
	      func(i, context);
	      return false;
	    };
	}

	makeOnClickBackfillRequest(i, status) {
		var func = this.submitBackfillRequest;
		var context = this;
		return function() {
			func(i, status, context);
			return false;
		}
	}

	showControlBar(itemRow, context) {
		var controlBar = context.state.controlBarVisible;
		controlBar[itemRow] = true;
		context.setState({
			controlBarVisible: controlBar
		});
	}

	hideControlBar(itemRow, context) {
		var controlBar = context.state.controlBarVisible;
		controlBar[itemRow] = false;

		var items = context.state.itemsModified;
		items[itemRow].status = context.state.items[itemRow].status;

		context.setState({
			controlBarVisible: controlBar,
			itemsModified: items
		});
		context.props.callback();
	}

	makeControlBar(rowIndex) {
		var list = [];
		list.push(
				<div key={"controlBar-status-"+rowIndex} className="btn-group loan-status-dropdown">
			        <button type="button" className="btn btn-sm btn-secondary dropdown-toggle  loan-status-dropdown" data-toggle="dropdown">
			          {this.state.itemsModified[rowIndex].status}
			        </button>
			        <div className="dropdown-menu form-control">
			          	<a onClick={() => this.setDropdownStatus(rowIndex, "LENT")}
			          		className="dropdown-item" href="#/">
			            	LENT
			          	</a>
		          		<a onClick={() => this.setDropdownStatus(rowIndex, "DISBURSED")}
		          			className="dropdown-item" href="#/">
			            	DISBURSED
			          	</a>
		          		<a onClick={() => this.setDropdownStatus(rowIndex, "RETURNED")}
		          			className="dropdown-item" href="#/">
			            	RETURNED
			          	</a>
			        </div>
			    </div>);

		list.push(
				<button key={"controlBar-button-"+rowIndex} onClick={() => this.updateItemStatus(rowIndex)}
						type="button"
						className="btn btn-sm btn-primary loantable-button">
					Apply
				</button>);

		list.push(
				<button key={"controlBar-cancel-"+rowIndex} onClick={this.makeOnClickHide(rowIndex)}
						type="button"
						className="btn btn-sm btn-outline-danger">
					Cancel
				</button>);
		return (<td className="loan-control-bar"> {list} </td>);
	}

	makeBackfillControlBar(rowIndex) {
		var href = "#/";
		if (this.state.items[rowIndex].attachment_name)
			href = 'https://'+ location.hostname + '/uploads/'+this.state.items[rowIndex].attachment_name;

		var role = JSON.parse(localStorage.getItem('user')).role;

		if (role === "MANAGER" || role === "ADMIN") {
			return (
				<div>
					<div key={"backfill-controlBar-"+rowIndex}>
						<button type="button"
								className="btn btn-sm btn-outline-success"
								onClick={() => this.approveBackfill(rowIndex)}>
					    	APPROVE
				        </button>
				        <button type="button"
				        		className="btn btn-sm btn-outline-danger"
				        		onClick={() => this.denyBackfill(rowIndex)}>
					    	DENY
				        </button>
				        <a target={href==="#/" ? "" : "_blank"}
				        	href={href}
				        	onClick={href==="#/" ? (() => alert("No PDF uploaded for this backfill request")) : null}>
				        	<strong>View PDF</strong>
			        	</a>
			        </div>
		        </div>);
		}
		else return null;
	}

	approveBackfill(rowIndex) {
		this.submitBackfillRequest(rowIndex, "DISBURSED", this);
	}

	denyBackfill(rowIndex) {
		this.submitBackfillRequest(rowIndex, "LENT", this);
	}

	setDropdownStatus(rowIndex, newStatus) {
		var items = this.state.itemsModified;
		items[rowIndex].status = newStatus;
		this.setState({
			itemsModified: items
		});
	}

	updateItemStatus(rowIndex) {
		var items = this.state.itemsModified;
		var itemId = items[rowIndex].item._id;
		var loanId = this.state._id;
		var param = {items: []};

		for (var i=0; i<items.length; i++) {
			param.items.push({item: itemId, status: items[i].status});
		}

		this.props.api.put("api/loans/"+loanId, param)
		.then(response => {
			if (response.data.error) {
				alert(response.data.error);
			}
			else
				this.props.callback();
			});

		var controlBar = this.state.controlBarVisible;
		controlBar[rowIndex] = false;

		this.setState({
			controlBarVisible: controlBar
		});
	}

  toggle(index) {
    var tooltipOpenMap = this.state.tooltipOpenMap;
    tooltipOpenMap[index] = !tooltipOpenMap[index];
    this.setState({
      tooltipOpenMap: tooltipOpenMap
    });
  }
	submitBackfillRequest(rowIndex, status, context) {
		var items = context.state.itemsModified;
		var itemId = items[rowIndex].item._id;
		var loanId = context.state._id;
		var param = {items: []};

		for (var i=0; i<items.length; i++) {
			if (i === rowIndex) {
				param.items.push({item: itemId, status: status})
			} else {
				param.items.push({item: itemId, status: items[i].status});
			}
		}

		context.props.api.put("api/loans/"+loanId, param)
		.then(response => {
			if (response.data.error) {
				alert(response.data.error);
			}
			else
				context.props.callback();
			});
	}

	render() {
		return (
		    <li className="list-group-item">
				<div className="container loan-details">
		    		<div className="row">
		    			<strong>User:  </strong> {this.state.user}
		    		</div>
		    		<div className="row">
		    			<strong>Date Created:  </strong> {formatDate(new Date(this.state.created).toString())}
		    		</div>
		    		<div className="row">
		    			<strong>Last Modified:  </strong> {formatDate(new Date(this.state.modified).toString())}
		    		</div>
		    		<div className="row">
		    			<strong>Reviewer Comment:  </strong> {this.state.reviewer_comment ? this.state.reviewer_comment : "N/A"}
		    		</div>
		    		<br></br>
		    		<div className="row">
			    		<table className="table table-sm table-hover" id={this.state._id}>
  						  <thead>
  						    <tr>
  						      <th>Item Name</th>
  						      <th>Quantity Loaned</th>
  						      <th>Status</th>
  						    </tr>
  						  </thead>
  						  <tbody>
  						  	{this.makeItemRows()}
  						  </tbody>
						  </table>

		    		</div>
		    	</div>
			</li>);
	}
}

export default LoanTableRow;
