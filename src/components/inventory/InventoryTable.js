import React, { Component } from 'react';
import '../../App.css';
import TableRow from './TableRow.js';
import ItemWizard from './ItemWizard.js';
import AddToCartButton from './AddToCartButton.js';
import ItemEditor from './ItemEditor.js';
import ItemDetailView from './ItemDetailView.js';
import CustomFieldsPopup from './CustomFieldsPopup.js';
import CustomFieldListPopup from './CustomFieldListPopup.js';

import ShoppingCart from './ShoppingCart.js';

var meta;

function getKeys(data) {

	if (data.length === 0)
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
		"Tags": data["Tags"],
		"custom_fields": data["custom_fields"],
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
		"Tags": "",
		"custom_fields": "",
	});
}

class InventoryTable extends Component {

	constructor(props) {
		super(props);
		this.state = {
			columnKeys: getKeys(this.props.data),
			rows: getValues(this.props.data, getKeys(this.props.data)),
			allCustomFields: [],
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			columnKeys: getKeys(newProps.data),
			rows: getValues(newProps.data, getKeys(newProps.data))
		});
	}

	componentWillMount(){
		this.props.api.get('/api/customFields')
      .then(function(response) {
        if (response.data.error) {
          console.log(response.data.error);
        }
        this.setState({allCustomFields: response.data});
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      });
	}


	render() {
		return (
			<div className="maintable-container">
				<table className="table table-sm maintable-body">
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



		if (JSON.parse(localStorage.getItem('user')).role === "ADMIN" || JSON.parse(localStorage.getItem('user')).role === "MANAGER") {
			list.push(
					<CustomFieldListPopup
									api={this.props.api}
									key={"editfields-button"}
									callback={this.props.callback}/>
							);
			list.push(
					<CustomFieldsPopup
									api={this.props.api}
									key={"makefields-button"}
									callback={this.props.callback}/>
							);
			list.push(<ShoppingCart api={this.props.api} key={"shopping-cart-button"}/>);
			list.push(
					<ItemWizard data={getEmptyPrefill()}
	          			api={this.props.api}
	          			key={"makeitem-button"}
	          			callback={this.props.callback}
									allCustomFields={this.state.allCustomFields}/>
	          	);

		}
		else {
    		list.push(<th key={"buttonSpace-1"}></th>);
			list.push(<ShoppingCart api={this.props.api} key={"shopping-cart-button"}/>);
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
		var list = [];
		if (JSON.parse(localStorage.getItem('user')).role === "ADMIN" || JSON.parse(localStorage.getItem('user')).role === "MANAGER") {
			list.push(
					<AddToCartButton
						itemName={data.Name}
						modelName={data.Model}
						itemId={data.meta.id}
						api={this.props.api}
						ref={data.meta.id}
						role={JSON.parse(localStorage.getItem('user')).role}
						key={"request-popup-button-"+id}/>
			);
			list.push(this.makeEditButton(data,id));
			list.push(this.makeDeleteButton(id));

			list.push(<td className="subtable-row" key={"detail-view-" + id}>
						<ItemDetailView key={"detail-view-button-" + id}
								params={{itemID: id}}
								allCustomFields={this.state.allCustomFields}/>
					  </td>);

			return list;
		}

		else  {
			list.push(
			<AddToCartButton
				itemName={data.Name}
				modelName={data.Model}
				itemId={data.meta.id}
				api={this.props.api}
				ref={data.meta.id}
				role={JSON.parse(localStorage.getItem('user')).role}
				key={"request-popup-id-"+ id}/>);
				list.push(
					<td className="subtable-row" key={"detail-view-" + id}>
						<ItemDetailView key={"detail-view-button-"+id} params={{itemID: id}}/>
					</td>);
				return list;
			}
	}

	makeDeleteButton(id) {
		return (
			<td key={"delete-td-"+id} className="subtable-row">
				<button data-toggle="modal" data-target={"#delete-"+id} key={"delete-button-"+id}
					type="button"
					className="btn btn-danger delete-button">
						<span className="fa fa-trash"></span>
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
		          ref={"edit-"+id}
							allCustomFields={this.state.allCustomFields}/>
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
			<div className="modal fade confirmation-popup" id={type+"-"+id}>
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
