import React, { Component } from 'react';
import '../../App.css';
import TableRow from './TableRow.js';
import ItemWizard from './ItemWizard.js';
import RequestPopup from './RequestPopup.js';
import ItemEditor from './ItemEditor.js';
import ItemDetailView from './ItemDetailView.js';

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

		if (["Name", "Quantity", "Model", "Vendor"].includes(keys[i])) {
			ret.push(keys[i]);
			console.log(keys[i]);
		}
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

class InventoryTable extends Component {

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
			<div className="maintable-container">
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
			</div>
		);
	}

	makeColumnKeyElements(keys) {
		var i;
		var list = [];
		for (i=0; i<keys.length; i++) {
			list.push(<th key={keys[i]+"-inventorycol"}> {keys[i]} </th>);
		}

		list.push(<th key={"buttonSpace-0"}></th>);
		list.push(<th key={"buttonSpace-1"}></th>)

		if (JSON.parse(localStorage.getItem('user')).is_admin === true) {
			list.push(<th key={"buttonSpace-2"}></th>);
			list.push(
					<ItemWizard data={getEmptyPrefill()}
	          			api={this.props.api}
	          			key={"makeitem-button"}
	          			callback={this.props.callback}/>
	          	);
		}

		return list;
	}

	makeRows(rowData) {
		var i;
		var list = [];
		for (i=0; i<rowData.length; i++) {
			var elem;
			var id = this.props.data[i]["meta"]["id"];
			elem = (<TableRow
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
		if (JSON.parse(localStorage.getItem('user')).is_admin === true) {
			var list = [];
			list.push(
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
						isAdmin={true}
						key={"request-popup-button-"+id}/>
			);
			list.push(this.makeEditButton(data,id));
			list.push(this.makeDeleteButton(id));
			list.push(<td className="subtable-row" key = {"detail-view-" + id}> <ItemDetailView params={{itemID: id}}/> </td>);
			return list;
		}

		else  {
			var list = [];
			list.push(
			<RequestPopup
				itemName={data.Name}
				modelName={data.Model}
				itemId={data.meta.id}
				api={this.props.api}
				ref={data.meta.id}
				isAdmin={false}
				key={"request-popup-id-"+ id}/>);
				list.push(<td className="subtable-row" key = {"detail-view-" + id}> <ItemDetailView params={{itemID: id}}/> </td>);
				return list;
			}
	}

	makeDeleteButton(id) {
		return (
			<td key={"delete-td-"+id} className="subtable-row">
				<button data-toggle="modal" data-target={"#delete-"+id} key={"delete-button-"+id}
					type="button"
					className="btn btn-danger delete-button">
						<span className="fa fa-remove"></span>
				</button>
				{this.makeConfirmationPopup(
					"This will delete the selected item and all of its instances. Proceed?",
					"delete",
					id)}
			</td>
		);
	}

	makeEditButton(data, id) {
		return (
			<td key={"edit-td-"+id} className="subtable-row">
				<ItemEditor data={getPrefill(data)}
		          api={this.props.api}
		          callback={this.props.callback}
		          className="request-button"
		          itemId={id}
		          key={"editbutton-"+ id}
		          ref={"edit-"+id} />
	         </td>
        );
	}


	deleteItem(id) {
		this.props.api.delete('api/inventory/' + id)
		.then(function(response) {
			this.props.callback(true);
		}.bind(this));
	}

	makeConfirmationPopup(text, type, id) {
		return (
			<div className="modal confirmation-popup" id={type+"-"+id}>
			  <div className="modal-dialog confirmation-dialog" role="document">
			    <div className="modal-content">
			      <div className="modal-body padded">
			        <p>{text}</p>
			      </div>
			      <div className="modal-footer">
			      	<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
			        <button onClick={e=> this.deleteItem(id)} type="button" data-dismiss="modal" className="btn btn-danger">Confirm</button>
			      </div>
			    </div>
			  </div>
			</div>
		);
	}

}


export default InventoryTable
