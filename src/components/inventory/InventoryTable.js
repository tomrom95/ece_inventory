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
import BulkImportButton from './BulkImportButton.js';
import ImportHelpButton from './ImportHelpButton.js';
import MinQuantityEditor from './MinimumQuantityEditor.js';

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
		"Vendor Info": data["Vendor"],
		"Tags": data["Tags"],
		"custom_fields": data["custom_fields"]
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
		"custom_fields": ""
	});
}

class InventoryTable extends Component {

	constructor(props) {
		super(props);
		this.state = {
			columnKeys: getKeys(this.props.data),
			rows: getValues(this.props.data, getKeys(this.props.data)),
			allCustomFields: [],
			checked: localStorage.getItem("itemsChecked") ? JSON.parse(localStorage.getItem("itemsChecked")) : {},
			itemsCheckedNames: {},
			checkboxesVisible: false
		}
	}

	componentDidMount() {
		this.clearCheckedBoxes();
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
		this.props.api.get('/api/inventory/tags')
      .then(function(response) {
        if (response.data.error) {
          console.log(response.data.error);
        }
        this.setState({allTags: response.data});
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

	render() {

		var isManager = JSON.parse(localStorage.getItem('user')).role === "ADMIN"
				|| JSON.parse(localStorage.getItem('user')).role === "MANAGER";

		var minQtyEditor = this.state.checkboxesVisible ? 
							(<li className="nav-item userpage-tab-container">
								<MinQuantityEditor itemsChecked={this.state.checked}
									   itemsCheckedNames={this.state.itemsCheckedNames} 
									   key={"min-qty-editor"}
									   api={this.props.api}
									   clearCheckboxes={() => this.clearCheckedBoxes()} />
						    </li>) : null;	

		return (
			<div className="row">
				<div className="col-md-12">
		            <ul className="nav nav-links inventorypage-tabs-container">
		            { isManager === false ? null :
		              <li className="nav-item userpage-tab-container">
		                    <CustomFieldsPopup
										api={this.props.api}
										key={"makefields-button"}
										callback={this.setCustomFields.bind(this)}/>
		              </li>
		          	}

	            	{ isManager === false ? null :
		              <li className="nav-item userpage-tab-container">
		                    <CustomFieldListPopup
										api={this.props.api}
										key={"editfields-button"}
										callback={this.setCustomFields.bind(this)}
										allCustomFields={this.state.allCustomFields}/>
		              </li>
		          	}


		              <li className="nav-item userpage-tab-container">
	                    	<ShoppingCart api={this.props.api} key={"shopping-cart-button"}/>
		              </li>
						{ isManager === false ? null :
							<li className="nav-item userpage-tab-container">
										<BulkImportButton
							key={"bulkimport-button"}
							api={this.props.api}
							callback={this.props.callback}/>
							</li>

						}
						{ isManager === false ? null :
							<li className="nav-item userpage-tab-container">
								<ImportHelpButton />
							</li>
						}
		            </ul>

		            { isManager ? 
			            (<ul className="nav nav-links inventorypage-tabs-container">
			              <li className="nav-item userpage-tab-container">
		                    <a className="nav-link userpage-tab" href="#"
								onClick={() => this.toggleCheckboxes()}>
								{this.state.checkboxesVisible ? "Hide Checkboxes" : "Select Multiple"}
							</a>
			              </li>
			              {minQtyEditor}
			            </ul>) : null }
		        </div>

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
									allCustomFields={this.state.allCustomFields}/>
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
		var list = [];
		if (JSON.parse(localStorage.getItem('user')).role === "ADMIN" || JSON.parse(localStorage.getItem('user')).role === "MANAGER") {
			
			if (this.state.checkboxesVisible === true) {
				list.push(<div key={"checkbox-div-"+id}>
					      	<input key={"checkbox-"+id} 
					      		   type="checkbox" 
					      		   className="form-check-input inventory-checkbox"
					      		   onChange={e => this.handleCheckedChange(e, id, data.Name)}
					      		   checked={this.state.checked[id] || false} />
					  	  </div>);
			}

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
									allCustomFields={this.state.allCustomFields}
									allTags={this.state.allTags}
					/>
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
							allCustomFields={this.state.allCustomFields}
							allTags={this.state.allTags} />

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
							isAsset={data.meta.isAsset}
		          api={this.props.api}
		          callback={this.props.callback}
		          className="request-button"
		          itemId={id}
		          key={"editbutton-"+ id}
		          ref={"edit-"+id}
							allCustomFields={this.state.allCustomFields}
							is_asset={data.meta.isAsset}

							allTags={this.state.allTags}/>
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

	toggleCheckboxes() {
		if (this.state.checkboxesVisible === true) {
			this.clearCheckedBoxes();
		}

		this.setState({
			checkboxesVisible: !this.state.checkboxesVisible
		});
	}

	handleCheckedChange(event, itemId, itemName) {
	    var checked = event.target.checked;
	    this.setCheckedItemInLocalStorage(itemId, checked);
	    var itemsCheckedNames = this.state.itemsCheckedNames;
	    itemsCheckedNames[itemName] = checked;
	    this.setState({
	    	itemsCheckedNames: itemsCheckedNames
	    })
	}

	setCheckedItemInLocalStorage(itemId, checked) {		
		if (!localStorage.getItem("checkedItems")) {
			this.clearCheckedBoxes();
		}
		var checkedItems = localStorage.getItem("checkedItems");
		var itemsJson = JSON.parse(checkedItems);
		itemsJson[itemId] = checked;
		localStorage.setItem("checkedItems", JSON.stringify(itemsJson));
		this.setState({
			checked: JSON.parse(localStorage.getItem("checkedItems"))
		});
	}

	clearCheckedBoxes() {
		localStorage.setItem("checkedItems", "{}");
		this.setState({
			checked: {},
			checkboxesVisible: false
		});
	}

}


export default InventoryTable
