import React, { Component } from 'react';
import '../../App.css';
import TagSelector from '../global/TagSelector.js';
import validator from 'validator';
import CustomFieldForm from './CustomFieldForm.js';

function getKeys(data) {
	return Object.keys(data);
}

function getValues(data, keys) {
	var i;
	var vals = [];
	for (i=0; i<keys.length; i++) {
		vals.push(data[keys[i]]);
	}
	return vals;
}

function validNumber(num) {
	if (!isNaN(num)) {
		return (num >= 0);
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

class ItemWizard extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			allCustomFields: props.allCustomFields,
			formIds: [],
			activated: false,
			justApplied: false,
			isAsset: false,
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			data: newProps.data,
			allCustomFields: newProps.allCustomFields,
			formIds: getValues(newProps.data, getKeys(newProps.data)),
			activated: this.state.justApplied ? true : false
		});
	}

	activateView() {
		this.setState({
			activated: true
		});
	}

	handleAssetChange() {
		this.setState({
			isAsset: !this.state.isAsset
		})
	}

	makeCheckForm() {
		var asset_checkbox =
			<input type="checkbox"
	      		checked={this.state.isAsset}
				onChange={this.handleAssetSetChange.bind(this)}
				key={"asset_checkbox"}
        		name="asset_checkbox"/>;
		return(
			<div className="form-group row customfield-maker-isprivate">
				<div className="col-xs-10">
					<label htmlFor={"createform-row-"}>Check this if item is an asset</label>
				</div>
				<div className="col-xs-2 customfield-maker-checkbox">
					{asset_checkbox}
				</div>
			</div>
		);
	}

	makeItemCreationForm() {
		var keys = getKeys(this.state.data);
		var vals = getValues(this.state.data, keys);
		var list = []; var i;

		for (i=0; i<keys.length; i++) {
			if (keys[i] === 'Tags') {
				list.push(this.makeTextBox(i, "multiselect", keys[i], vals[i]));
			}

			else if (keys[i] === 'Min Stock Enabled') {
				list.push(this.makeCheckBox("Min Stock Enabled", "minstock_enabled", this.state.minstock_enabled));
			}

			else if(keys[i] === 'custom_fields'){
				list.push(
					<CustomFieldForm
						allCustomFields={this.props.allCustomFields}
						currentValues={[]}
						perInstance={false}
						ref="customFields"
						key="customFields"/>
				);
			}
			else {
				list.push(this.makeTextBox(i, "text", keys[i], vals[i]));
			}
		}
		list.push(
			<div className="form-group" key={"asset-checkbox-div"}>
				<label key={"asset-checkbox-label"} >Make Asset </label>
				<input type="checkbox"
							checked={this.state.is_asset}
							onChange={e=>this.handleAssetChange(e)}
							className="asset-checkbox"
							ref={"asset-checkbox"}
							key={"asset-checkbox"}/>
			</div>

		);
		return list;
	}

	handleCheckboxChange(event) {
	    var value = event.target.checked;
	    this.setState({
	      minstock_enabled: value
	    });
	}	

	makeCheckBox(label, ref, value){
		return (
			<div className="row request-quantity" key={"minstock-enabled-row"} >
			  <div className="col-xs-10">
			  	<label>{label}</label>
			  </div>
			  <div className="col-xs-2 cart-checkbox">
			  	<input type={"checkbox"}
			  			id={"minstock-enabled-checkbox"}
			  			checked={value}
			  			onChange={e => this.handleCheckboxChange(e)}
			  			ref={ref}>
			  	</input>
			  </div>
			</div>
		);
	}

	makeTextBox(row, type, label, defaultValue){
		var id = "createform-row-"+row;
		this.state.formIds.push(id);
		var input;
		if(type === "multiselect") {
			input = <TagSelector
				disallowCustom={false}
				api={this.props.api}
				id={id}
				ref={label}/>
		} else {
			input = <input type={type}
				className="form-control"
				defaultValue={defaultValue}
				ref={label}
				key={id}>
				</input>
		}

		return (
			<div className="form-group" key={"createform-div-row-"+row}>
			  <label htmlFor={"createform-row-"+row}>{label}</label>
			  {input}
			</div>
		);
	}

	handleFormChange(event, label, index) {
		var data = this.state.data;

		data[label] = event.target.value;
		this.setState({
			data: data
		});
	}

	validItem(object) {
		if (object.name.length === 0) {
			alert("Name is a required field.");
			return;
		}

		if (object.quantity.length === 0) {
			alert("Quantity is a required field.");
			return;
		}

		var val = isWholeNumber(object.quantity);
  		if (val !== true) {
  			alert(val);
  			return;
		}

		var desc = object.description;
		if (desc.length > 400) {
			alert("Description must be less than 400 characters long.");
			return;
		}
		return true;
	}

	onSubmission() {
		var tags = this.refs.Tags.getSelectedTags();
		var fields = this.refs.customFields.getCurrentValues();
		var object = {
				name: this.refs.Name.value,
	  			quantity: this.refs.Quantity.value,
	 			model_number: this.refs["Model Number"].value,
	  			description: this.refs.Description.value,
	  			vendor_info: this.refs["Vendor Info"].value,
	  			tags: tags ? tags.split(',') : [],
	  			has_instance_objects: false,
				is_asset: this.state.isAsset,
				minstock_isEnabled: this.refs["minstock_enabled"].checked,
				minstock_threshold: this.refs["Min Stock Threshold"].value,
				custom_fields: fields
  		}

  		console.log(this.refs["Min Stock Threshold"].value);

  		if (this.validItem(object) === true) {
  			object.quantity = Number(object.quantity);

  			this.props.api.post('/api/inventory/', object)
			  	.then(function(response) {
			        if (response.data.error) {
		        		alert(response.data.error.errmsg);
			        } else {
			        	this.props.callback();
			        	this.clearForm();
			        	this.setState({
			        		justApplied: true
			        	});
			        	alert("Successfully created new item: " + response.data.name);
			        }
			      }.bind(this))
			      .catch(function(error) {
			        console.log(error);
			      }.bind(this));
		}
  	}

  	clearForm() {
			var data = this.state.data;
			this.setState({
				data: data,
				isAsset: false,
			});
  		var keys = getKeys(this.state.data);
			keys.forEach(function(key) {
				if(this.refs.length > 0){
					if (key === "Tags") {
						this.refs[key].clearTags();
					} else if (key === "custom_fields"){
						this.refs.customFields.clearForm();
					} else {
						this.refs[key].value = "";
					}
				}
			}.bind(this));
  	}

  	render() {

			var item_form =
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title" id="createLabel">Create New Item</h5>
					</div>
					<div className="modal-body">
						{this.makeItemCreationForm()}
					</div>
					<div className="modal-footer">
						<button type="button" onClick={this.clearForm.bind(this)} className="btn btn-secondary" data-dismiss="modal">Cancel</button>
						<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
						<button onClick={e => this.onSubmission()} type="button" className="btn btn-primary">Submit</button>
					</div>
				</div>;

			var button =
				<button type="button"
					className="btn btn-outline-primary add-button align-right"
					data-toggle="modal"
					data-target={"#createModal"}
					onMouseOver={() => this.activateView()}>
					<span className="fa fa-plus"></span>
				</button>;

			if (this.state.activated === false) {
				return <th>{button}</th>;
			}
			return (
				<th>
					{button}
					<div className="modal fade"
						id={"createModal"}
						tabIndex="-1"
						role="dialog"
						aria-labelledby="createLabel"
						aria-hidden="true">
					  <div className="modal-dialog" role="document">
					    {item_form}
					  </div>
					</div>
				</th>
			);
	}
}

export default ItemWizard
