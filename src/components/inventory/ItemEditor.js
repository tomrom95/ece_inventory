import React, { Component } from 'react';
import '../../App.css';
import TagSelector from '../global/TagSelector.js';
import CustomFieldForm from './CustomFieldForm';
import InstanceEditor from '../instances/InstanceEditor';
import validator from 'validator';

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

class ItemEditor extends Component {

	constructor(props) {
		super(props);
		this.state = {
			originalQuantity: props.data.Quantity,
			showQuantityReason: false,
			data: props.data,
			is_asset: props.is_asset,
			allCustomFields: props.allCustomFields,
			formIds: [],
			minstock_enabled: props.data["Min Stock Enabled"],
			activated: false,
			justApplied: false,
			isAsset: props.isAsset,
			minstock_isEnabled: props.minstock_isEnabled,
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			showQuantityReason: false,
			originalQuantity: newProps.data.Quantity,
			data: newProps.data,
			isAsset: newProps.isAsset,
			allCustomFields: newProps.allCustomFields,
			formIds: getValues(newProps.data, getKeys(newProps.data)),
			minstock_enabled: newProps.data["Min Stock Enabled"],
			activated: this.state.justApplied ? true : false
		});
	}

	handleAssetChange(event){
		this.setState({
			is_asset: !this.state.is_asset,
		})
	}

	handleFormChange(event, label, index) {
		var data = this.state.data;

		if (label === 'Quantity'){
			data.Quantity = event.target.value;
			this.setState({
				data: data,
				showQuantityReason: Number(this.state.originalQuantity) !== Number(data.Quantity),
			});
		} else{
			data[label] = event.target.value;
			this.setState({data: data});
		}
	}

	makeForm() {
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

			else if (keys[i] === 'custom_fields'){
				list.push(
					<CustomFieldForm
						allCustomFields={this.props.allCustomFields}
						currentValues={vals[i]}
						perInstance={false}
						ref="customFields"
						key="customFields"/>
				);
			}
			else if((!this.props.is_asset) || !(this.props.is_asset && keys[i] === 'Quantity')){
				list.push(this.makeTextBox(i, "text", keys[i], vals[i]));
			}
		}
		list.push(
			<div className="form-group" key={"threshold-enabled-checkbox-div"}>
				<label key={"threshold-enabled-checkbox-label"} >Enable Min Threshold  </label>
				<input type="checkbox"
							checked={this.state.minstock_isEnabled}
							onChange={e=>this.handleEnableChange()}
							className="asset-checkbox"
							ref={"enable-checkbox"}
							key={"enable-checkbox"}/>
			</div>
		);
		if(!this.props.is_asset){
			list.push(
				<div className="form-group" key={"asset-checkbox-div"}>
					<label key={"asset-checkbox-label"} >Make Asset     </label>
					<input type="checkbox"
			          checked={this.state.is_asset}
			    			onChange={e=>this.handleAssetChange(e)}
								className="asset-checkbox"
			          ref={"asset-checkbox"}
			    			key={"asset-checkbox"}/>
				</div>

			)
		}

		list.push(
			<div key = {"createform-button-bar-row-"+i} className="modal-footer">
				<button type="button" onClick={() => this.props.callback()} className="btn btn-secondary" data-dismiss="modal">Cancel</button>
				<button type="button" onClick={() => this.clearForm()} className="btn btn-secondary" data-dismiss="modal">Close</button>
				<button onClick={() => this.onSubmission()} type="button" className="btn btn-primary">Apply</button>
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


	clearForm() {
	}

	makeQuantityReasonField() {
		var role = JSON.parse(localStorage.getItem("user")).role;
		var options = [];
		if (Number(this.state.data.Quantity) < Number(this.state.originalQuantity)) {
			options.push('LOSS');
			options.push('DESTRUCTION');
		} else {
			options.push('ACQUISITION')
		}
		if (role === 'ADMIN') {
			options.push('MANUAL');
		}
		options = options.map(function(text){
			return (<option key={text}>{text}</option>);
		});
		return (
			<div className="form-group" key={"reason-field-row"}>
				<label htmlFor={"reason-field"}>Reason for Quantity Change</label>
				<select id={"reason-field"} className="form-control" ref="reasonField">
					{options}
				</select>
			</div>
		);
	}

	makeTextBox(row, type, label, defaultValue){
		var id = "createform-row-"+row;
		this.state.formIds.push(id);
		var input;
		if (label === 'Quantity' && this.state.isAsset) {
			return null;
		}
		if(type === "multiselect") {
			input = <TagSelector
				disallowCustom={false}
				api={this.props.api}
				id={id}
				ref={label}
        		defaultTags={defaultValue} />
		} else {
			input = <input type={type}
				className="form-control"
				value={defaultValue}
				ref={label}
				key={id}
				onChange={e => this.handleFormChange(e, label, row)}>
				</input>
		}
		var reasonField = null;
		if (this.state.showQuantityReason && label === 'Quantity') {
			reasonField = this.makeQuantityReasonField();
		}

		return (
			<div className="form-group" key={"createform-div-row-"+row}>
			  <label htmlFor={"createform-row-"+row}>{label}</label>
			  {input}
				{reasonField}
			</div>
		);
	}

	validItem(object) {
		if (object.name.length === 0) {
			alert("Name is a required field.");
			return;
		}

		if (!this.state.isAsset) {
			if (object.quantity.length === 0) {
				alert("Quantity is a required field.");
				return;
			}
			var val = isWholeNumber(object.quantity);
	  	if (val !== true) {
	  		alert(val);
	  		return;
			}
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
		var object = {
			name: this.refs.Name.value,
 			model_number: this.refs["Model Number"].value,
  			description: this.refs.Description.value,
  			vendor_info: this.refs["Vendor Info"].value,
  			tags: tags ? tags.split(',') : [],
  			minstock_isEnabled: this.refs["minstock_enabled"].checked,
  			minstock_threshold: this.refs["Min Stock Threshold"].value
  		}

  		if (String(object.minstock_threshold).length === 0) {
  			object.minstock_threshold = undefined;
  		}

		if (!this.state.isAsset) {
			object['quantity'] = this.refs.Quantity.value;
		}

		var customFieldErrors = this.refs.customFields.checkForErrors();
		if (customFieldErrors) {
			alert(customFieldErrors);
			return;
		}
		object.custom_fields = this.refs.customFields.getCurrentValues();

		if (this.validItem(object) === true) {
			if (object.quantity) {
				object.quantity = Number(object.quantity);
			}
			if (this.refs.reasonField) {
				object.quantity_reason = this.refs.reasonField.value;
			}

      this.props.api.put('/api/inventory/'+ this.props.itemId, object)
				.then(function(response) {
					if (response.data.error) {
						alert(response.data.error.message);
					} else {
						this.props.callback();
						this.setState({
							justApplied: true
						});
						alert("Edit was successful.");
					}
				}.bind(this))
				.catch(function(error) {
					console.log(error);
				}.bind(this));
			}
  	}

  	activateView() {
  		this.setState({
  			activated: true
  		});
  	}

  	render() {
  		var button =
  				(<button type="button"
					className="btn btn-sm btn-outline-primary"
					data-toggle="modal"
					data-target={"#editModal-"+this.props.itemId}>
					<span className="fa fa-pencil"></span>
				</button>);
	    return (
			<div>
				{button}

				<div className="modal fade"
					id={"editModal-"+this.props.itemId}
					tabIndex="-1" role="dialog"
					aria-labelledby="editLabel"
					aria-hidden="true">
				  <div className="modal-dialog" role="document">
				    <div className="modal-content">
				      <div className="modal-header">
				        <h5 className="modal-title" id="editLabel">Edit Current Item</h5>
				      </div>
				      <div className="modal-body">
				        {this.makeForm()}
				      </div>
							{this.state.isAsset ?
								(<div className="modal-header">
					        <h5 className="modal-title" id="editLabel">Edit Instances</h5>
					      </div>) : null}
							{this.state.isAsset ?
								(<div className="modal-body no-pad-right">
									<InstanceEditor
										allCustomFields={this.state.allCustomFields}
										rowsPerPage={10}
										itemID={this.props.itemId}
									/>
								</div>) : null}
				    </div>
				  </div>
				</div>
			</div>
			);
	}
}

export default ItemEditor
