import React, { Component } from 'react';
import './App.css';
import SubtableRow from './SubtableRow.js';
import ItemWizard from './ItemWizard.js';
import RequestPopup from './RequestPopup.js';



import ItemEditor from './ItemEditor.js';

var meta;

function getKeys(data) {

	if (data.length == 0)
		return;

	var keys = Object.keys(data[0]);
	var i;
	var ret = [];
	for (i=0; i<keys.length; i++) {
		if (keys[i] === "meta") {
			meta = keys[i];
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

function getPrefill(data) {
	return ({
		"Name": data["Name"],
		"Quantity": data["Quantity"],
		"Model Number": data["Model"],
		"Description": data["Description"],
		"Location": data["Location"],
		"Vendor Info": data["Vendor"],
		"Tags": data["Tags"]
	});
}

function getEmptyPrefill() {
	return ({
		"Name": "",
		"Quantity": "",
		"Model Number": "",
		"Description": "",
		"Location": "",
		"Vendor Info": "",
		"Tags": ""
	});
}

class InventorySubTable extends Component {

	constructor(props) {
		super(props);
		this.state = {
			columnKeys: getKeys(this.props.data),
			rows: getValues(this.props.data, getKeys(this.props.data))
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			columnKeys: getKeys(newProps.data),
			rows: getValues(newProps.data, getKeys(newProps.data))
		});
	}

	render() {
		return (
			<table className="table maintable-body">
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

	makeEditButton(data, id) {

		return (
		<ItemEditor data={getPrefill(data)}
          api={this.props.api}
          callback={this.props.callback}
          className="request-button"
          itemId={id}
          key={"edit-"+ id}
          ref={"edit-"+id} />
        );
	}

	makeColumnKeyElements(keys) {
		var i;
		var list = [];
		for (i=0; i<keys.length; i++) {
			list.push(<th key={keys[i]+"-inventorycol"}> {keys[i]} </th>);
		}
		list.push(<th key={"buttonSpace-0"}> </th>);
		if (JSON.parse(localStorage.getItem('user')).is_admin === true) {
			list.push(
				<th className="add-button" key={"item-wizard-slot"}>
					<ItemWizard data={getEmptyPrefill()}
	          			api={this.props.api}
	          			type={"create"}
	          			key={"makeitem-button"}
	          			callback={this.props.callback} />
	          	</th>);
		}

		return list;
	}

	makeRows(rowData) {
		var i;
		var list = [];
		for (i=0; i<rowData.length; i++) {
			var elem;
			var id = this.props.data[i]["meta"]["id"];
			var button_list=[];
			elem = (<SubtableRow
					columnKeys={this.props.columnKeys}
					data={rowData[i]}
					idTag={id}
					row={i}
					key={id+"-row"}
					api={this.props.api}
					inventory_buttons={this.makeInventoryButtons(this.props.data[i], id)}
					callback={this.props.callback}/>);
			list.push(elem);
		}
		return list;
	}

	makeInventoryButtons(data, id) {

		if (JSON.parse(localStorage.getItem('user')).is_admin === true){
			console.log(data);
			return (

				<div>
					<RequestPopup
										data={[ {
											Serial: data.Serial,
											Condition: data.Condition,
											Status: data.Status,
											Quantity: data.Quantity
												}
											]}
										itemName={data.Name}
										modelName={data.Model}
										itemId={data.meta.id}
										api={this.props.api}
										ref={data.meta.id}
										isAdmin={true}/>

					{this.makeDeleteButton(id)}
					{this.makeEditButton(data,id)}

				</div>
			);
		}
		else{

			return (
				<div>

					<RequestPopup
										data={[ {
													Serial: data.Serial,
													Condition: data.Condition,
													Status: data.Status,
													Quantity: data.Quantity
												}
											]}
										itemName={data.Name}
										modelName={data.Model}
										itemId={data.meta.id}
										api={this.props.api}
										ref={data.meta.id}
										isAdmin={false}/>

				</div>
			);
		}



	}
	makeDeleteButton(id) {
		return (
			<button onClick={()=>{this.deleteItem(id)}} type="button" className="btn btn-danger delete-button">X</button>
		);
	}


	deleteItem(id) {
		this.props.api.delete('api/inventory/' + id);
		this.props.callback();
		console.log("Deleting item number " + id);
	}

}


export default InventorySubTable
