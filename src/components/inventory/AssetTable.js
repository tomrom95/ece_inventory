import React, { Component } from 'react';
import '../../App.css';
import TableRow from './TableRow.js';
import ItemWizard from './ItemWizard.js';
import AddToCartButton from './AddToCartButton.js';
import ItemEditor from './ItemEditor.js';
import ItemDetailView from './ItemDetailView.js';

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
		if(data[i].meta.isAsset){
			for (j=0; j<keys.length; j++) {
				row.push(String(data[i][keys[j]]).replace(/,/g,', '));
			}
			vals.push(row);
		}
	}
	return vals;
}

function getPrefill(data) {
	return ({
		"Name": data["Name"],
		"Quantity": data["Quantity"],
		"Model Number": data["Model"],
		"Description": data["Description"],
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
		"Vendor Info": "",
		"Tags": "",
		"custom_fields": "",
	});
}

class AssetTable extends Component {

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

	setCustomFields(){
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

	makeAssetKeys(rowData){
		var keys = ["Name", "Model", "Quantity", "Vendor"];
		var name = rowData[0];
		var list = [];
		for (var i=0; i<keys.length; i++) {
			var columnTag = "asset-name-" + rowData[0] + " " + i;
			var value = rowData[i];
			if (value.length === 0 || value === "undefined")
				value = "N/A";
				list.push(
					<td	className="subtable-row"	key={columnTag}>
						{value}
					</td>);
		}
		return list;

	}
	makeSubRows() {
		var i;
		var list = [];
		var instances = [["test", "123"]];
		var keys = ["Name", "Model", "Quantity", "Vendor"];
		for (var i=0; i<instances.length; i++) {
			var elem;
			elem = (<TableRow
					columnKeys={keys}
					data={instances[i]}
					idTag={"testasset" + i}
					row={i}
					key={"asset-instance-" + "testasset" + " " + i}
					api={this.props.api}
					callback={this.props.callback}/>);
			list.push(elem);
		}
		return list;
	}


	render() {
	//	console.log(this.state.rows);
		var isManager = JSON.parse(localStorage.getItem('user')).role === "ADMIN"
				|| JSON.parse(localStorage.getItem('user')).role === "MANAGER";

		return (
			<div className="row">
				<div className="row maintable-container">
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
					<ItemWizard data={getEmptyPrefill()}
	          			api={this.props.api}
	          			key={"makeitem-button"}
	          			callback={this.props.callback}
									allCustomFields={this.state.allCustomFields}
									isAsset={true}/>
	          	);

		}
		return list;
	}

	makeRows(rowData) {
		var i;
		var list = [];
		for (i=0; i<rowData.length; i++) {
			list.push(
				<tr	className="accordion-toggle"	data-toggle="collapse"	data-target="#testasset" key={"name-"+rowData[0]+"-"+i}>
					{this.makeAssetKeys(rowData[i])}
				</tr>);
			list.push(
				<tr key={"instances-"+rowData[0]+"-"+i}>
					<td className="row instance-table accordion-body collapse" id="testasset">
						<table className="table table-sm ">
							<tbody>
								{this.makeSubRows()}
							</tbody>
						</table>
					</td>
				</tr>);
		}
		return list;


	}

	makeInventoryButtons(data, id) {
		var list = [];
		if (JSON.parse(localStorage.getItem('user')).role === "ADMIN" || JSON.parse(localStorage.getItem('user')).role === "MANAGER") {
			list.push(
				<div key={"cart-"+id} className="inventory-button">
					<AddToCartButton
						itemName={data.Name}
						modelName={data.Model}
						itemId={data.meta.id}
						api={this.props.api}
						ref={data.meta.id}
						role={JSON.parse(localStorage.getItem('user')).role}
						key={"request-popup-button-"+id}/>
				</div>
			);

			list.push(
				<div key={"edit-"+id} className="inventory-button">
					{this.makeEditButton(data,id)}
				</div>
			);
			if (JSON.parse(localStorage.getItem('user')).role === "ADMIN") {
				list.push(
					<div key={"delete-"+id} className="inventory-button">
						{this.makeDeleteButton(id)}
					</div>
				);
			}

			list.push(
				<div key={"detail-"+id} className="inventory-button">
					<ItemDetailView key={"detail-view-button-" + id}
									params={{itemID: id}}
									isButton={true}
									allCustomFields={this.state.allCustomFields}/>
				</div>);
			return <td className="row buttons-cell"> <div className="row align-right-inventory"> {list} </div> </td>;
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
					<ItemDetailView key={"detail-view-button-" + id}
							params={{itemID: id}}
							isButton={true}
							allCustomFields={this.state.allCustomFields}/>


					</td>);
				return list;
			}
	}

	makeDeleteButton(id) {
		return (
			<div key={"delete-td-"+id}>
				<button data-toggle="modal" data-target={"#delete-"+id} key={"delete-button-"+id}
					type="button"
					className="btn btn-sm btn-danger">
						<span className="fa fa-trash"></span>
				</button>
				{this.makeConfirmationPopup(
					"This will delete the selected item and all of its instances. Proceed?",
					"delete",
					id)}
			</div>
		);
	}

	makeEditButton(data, id) {
		return (
				<ItemEditor data={getPrefill(data)}
		          api={this.props.api}
		          callback={this.props.callback}
		          className="request-button"
		          itemId={id}
		          key={"editbutton-"+ id}
		          ref={"edit-"+id}
							allCustomFields={this.state.allCustomFields}/>
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


export default AssetTable
