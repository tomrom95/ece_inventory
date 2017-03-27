import React, { Component } from 'react';
import '../../App.css';
import TableRow from '../inventory/TableRow';
import Modal from 'react-modal';
import LeaveCommentModal from './LeaveCommentModal.js';
import RequestItemsPopup from "./RequestItemsPopup.js";


function getKeys(data) {
	if (data.length === 0)
		return;

	var keys = Object.keys(data[0]);
	var i;
	var ret = [];
	for (i=0; i<keys.length; i++) {
    if (keys[i] === "_id" || keys[i] === "user_id" || 
        keys[i] === "item_id" || keys[i] === "Items" || keys[i] === "Reviewer Comment" || keys[i] === "Request Type") {
			continue;
		}
		else ret.push(keys[i]);
	}
	return ret;
}

function getValues(data, keys) {
	var i; var j;
	var vals = [];
	for (i=0; i<data.length; i++) {
		var row = [];
		for (j=0; j<keys.length; j++) {
			row.push(String(data[i][keys[j]]).replace(/,/g,', '));
		}
		vals.push(row);
	}
	return vals;
}

class RequestTable extends Component {

	constructor(props) {
		super(props);
		this.state = {
			columnKeys: getKeys(this.props.data),
			rows: getValues(this.props.data, getKeys(this.props.data)),
      raw_data: this.props.data,
      requestTypes: this.props.data.map(function(elem) {return elem["Request Type"]}),
      controlBarVisible: {},
      global: this.props.global
		}
    this.denyButton = this.denyButton.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      columnKeys: getKeys(newProps.data),
      rows: getValues(newProps.data, getKeys(newProps.data)),
      raw_data: newProps.data,
      requestTypes: newProps.data.map(function(elem) {return elem["Request Type"]}),
    });
  }

	makeColumnKeyElements(keys) {
		var i;
		var list = [];
		for (i=0; i<keys.length; i++) {
			list.push(<th key={keys[i]+"-requestcol"}> {keys[i]} </th>);
		}
		list.push(<th key={"buttonSpace-" + 1}> </th>);
    list.push(<th key={"buttonSpace-" + 2}> </th>);

    // in global requests page, we have more buttons
    if (this.state.global === true) {
      list.push(<th key={"buttonSpace-" + 3}> </th>);
      list.push(<th key={"buttonSpace-" + 4}> </th>);
    }

		return list;
	}

  setDropdownStatus(rowIndex, status) {
    var types = this.state.requestTypes;
    types[rowIndex] = status;
    this.setState({
      requestTypes: types
    });
  }

  updateItemStatus(rowIndex) {
    this.changeRequestType(rowIndex);
  }

  makeOnClickHide(i) {
    var func = this.hideControlBar;
    var context = this;
      return function() {
        func(i, context);
        return false;
      };  
  }

  showControlBar(itemRow, context) {
    var controlBar = context.state.controlBarVisible;
    controlBar[itemRow] = true;

    context.setState({
      controlBarVisible: controlBar
    });
    context.props.callback();
  } 

  makeOnClickShow(i) {
    var func = this.showControlBar;
    var context = this;
      return function() {
        func(i, context);
        return false;
      };  
  }

  hideControlBar(itemRow, context) {
    var controlBar = context.state.controlBarVisible;
    controlBar[itemRow] = false;

    context.setState({
      controlBarVisible: controlBar,
      requestTypes: context.state.raw_data.map(function(elem) {return elem["Request Type"]})
    });
    context.props.callback();
  } 

  makeControlBar(rowIndex) {
    var list = [];
    list.push(
        <div key={"controlBar-status-"+rowIndex} className="btn-group loan-status-dropdown">
              <button type="button" className="btn btn-sm btn-secondary dropdown-toggle  loan-status-dropdown" data-toggle="dropdown">
                {this.state.requestTypes[rowIndex]}
              </button>
              <div className="dropdown-menu form-control">
                  <a onClick={() => this.setDropdownStatus(rowIndex, "LOAN")} 
                    className="dropdown-item" href="#/">
                    LOAN
                  </a>
                  <a onClick={() => this.setDropdownStatus(rowIndex, "DISBURSEMENT")} 
                    className="dropdown-item" href="#/">
                    DISBURSEMENT
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

    return (<td key={"requestControlBar-"+rowIndex} className="request-control-bar"> {list} </td>);
  }

	makeRows(rowData) {
		var i;
		var list = [];

		for (i=0; i<rowData.length; i++) {

      var button_list = [];

      if(this.state.global ){
        if(rowData[i][3] === 'PENDING'){
          button_list=[this.denyButton(i), this.approveButton(i), this.commentButton(i)];
        }
        else if (rowData[i][3] === 'APPROVED') {
          button_list=[this.denyButton(i), this.fulfillButton(i),this.commentButton(i)];
        }
        else if (rowData[i][3] === 'DENIED') {
          button_list=[this.blankSpace(i , 1), this.approveButton(i , 2),this.commentButton(i)];
        }
        else if (rowData[i][3] === 'FULFILLED') {
          button_list=[this.blankSpace(i , 1), this.blankSpace(i , 2), this.commentButton(i)];
        }
      }
      else{
				if(rowData[i][3] !== 'FULFILLED'){
					button_list=[this.deleteButton(i)];
				}
				else{
					button_list=[];
				}
      }

      if (button_list.length === 0) {
        button_list.push(this.blankSpace(i, 1));
      }

			var id = this.props.data[i]._id;
      var itemData = this.props.data[i]["Items"];
      var itemsInfoButton = <RequestItemsPopup 
                                key={"request-detail-view-"+id} 
                                id={id} 
                                items={itemData}
                                reviewerComment={(this.state.raw_data[i])["Reviewer Comment"]} />;

      button_list.push(itemsInfoButton);

      /* Make the cell where you can change what type of request it is */
      var status = this.state.raw_data[i]["Status"];
      var type = 
      (status !== "PENDING") ? 
            (<td key={"request-type-fixed"+i}>
                <a key={"request-type-fixed"+i}> 
                  { this.state.raw_data[i]["Request Type"] ? this.state.raw_data[i]["Request Type"] : "DISBURSEMENT" } 
                </a>
            </td>) : 
        (this.state.controlBarVisible[i] ? this.makeControlBar(i) :
          (<td key={"request-type-td"+i}>
            <a key={"request-type-"+i} 
               href="#/"
               onClick={this.makeOnClickShow(i)}> 
              { this.state.raw_data[i]["Request Type"] ? this.state.raw_data[i]["Request Type"] : "DISBURSEMENT" } 
            </a>
          </td>)
      );

      button_list.push(type);

			var elem = (<TableRow
					columnKeys={this.props.columnKeys}
					data={rowData[i]}
					idTag={id}
					row={i}
					key={this.props.data[i]["_id"]+"-row"}
					api={this.props.api}
          request_buttons={button_list}/>);
			list.push(elem);
		}
		return list;
	}

  denyButton(index){
    return(
			<td key={"delete-td-"+index} className="subtable-row">
	      <button key={"deny"+index} className="btn btn-outline-danger btn-sm" onClick={e => this.denyRequest(index)}>
	        Deny
	      </button>
			</td>
    );
  }

  approveButton(index){
    return(
			<td key={"approve-td-"+index} className="subtable-row">
	      <button key={"approve"+index} className="btn btn-outline-success btn-sm" onClick={e => this.approveRequest(index)}>
	        Approve
	      </button>
			</td>
    );
  }

  fulfillButton(index){
    return(
			<td key={"fulfill-td-"+index} className="subtable-row">
		    <button key={"fulfill"+index} className="btn btn-outline-success btn-sm" onClick={e => this.fulfillRequest(index)}>
		      Fulfill
		    </button>
			</td>
    );
  }

  deleteButton(index){
    return(
			<td key={"delete-td-"+index} className="subtable-row">
      	<button key={"delete"+index} onClick={()=>{this.deleteRequest(index)}} type="button" className="btn btn-sm btn-danger delete-button">×</button>
			</td>
		)
  }

  commentButton(index){
    return(
			<td key={"comment-td-"+index} className="subtable-row">
      	<LeaveCommentModal id={index} 
                          key={"comment-"+index} 
                          request={this.state.raw_data[index]._id} 
                          api={this.props.api}
                          callback={() => this.props.callback()}/>
			</td>
    )
  }

	blankSpace(index , col){
		return(
			<td key={"blank-td-"+index + col} className="subtable-row">
				<button key={"blank"+index + col}  className="white-space-cell" type="button"> hey </button>
			</td>
		);
	}

  changeRequestType(rowIndex) {
    this.props.api.put('/api/requests/' + this.state.raw_data[rowIndex]._id, 
      {action: this.state.requestTypes[rowIndex]})
    .then(function(response) {
      if (response.data.error) {
        alert(response.data.error);
      }
      else {
        this.hideControlBar(rowIndex, this);
      }
    }.bind(this));
  }

  approveRequest(index){
    this.props.api.put('/api/requests/' + this.state.raw_data[index]._id,
      {
        status: 'APPROVED',
      }
    )
    .then(function(response) {
      if(response.data.error){
        alert(response.data.error);
      }
      else{
        this.state.rows[index][3] = 'APPROVED'
        this.forceUpdate();
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  denyRequest(index){
    this.props.api.put('/api/requests/' + this.state.raw_data[index]._id,
      {
        status: 'DENIED',
      }
    )
    .then(function(response) {
      if(response.data.error){
        console.log("error denying request");
      }
      else{
        this.state.rows[index][3] = 'DENIED'
        this.forceUpdate();
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  fulfillRequest(index){
    this.props.api.patch('/api/requests/' + this.state.raw_data[index]._id,
      {
        action: "FULFILL",
      }
    )
    .then(function(response) {
      if(response.data.error){
        alert(response.data.error);
      }
      else{
        this.state.rows[index][3] = 'FULFILLED'
        this.forceUpdate();
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  deleteRequest(index){
    this.props.api.delete('/api/requests/' + this.state.raw_data[index]._id)
    .then(function(response) {
      if(response.data.error){
        alert(response.data.error);
      }
      else{
				var rows = this.state.rows;
				rows.splice(index,1);
				var raw_data = this.state.raw_data;
				raw_data.splice(index,1);
				this.setState({
					rows: rows,
					raw_data: raw_data
				});
        this.props.callback(true);
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  commentRequest(index) {
    this.props.api.put('/api/requests/' + this.state.raw_data[index]._id,
      {
        reviewer_comment: "for real",
      }
    )
    .then(function(response) {
      if(response.data.error){
        alert(console.data.error);
      }
      else{

      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));
  }

  render() {
		return (
			<table className="table table-sm subtable-body requesttable">
			  <thead className="thread">
			    <tr>
		    	  {this.makeColumnKeyElements(this.state.columnKeys)}
			    </tr>
			  </thead>
			  <tbody>
			  	{this.makeRows(this.state.rows)}
			  </tbody>
			</table>
		);
	}
}

export default RequestTable;
