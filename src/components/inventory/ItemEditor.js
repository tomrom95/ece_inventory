import React, { Component } from 'react';
import '../../App.css';
import TagSelector from '../global/TagSelector.js';
import CustomFieldSelect from './CustomFieldSelect.js';
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
			allCustomFields: props.allCustomFields,
			formIds: [],
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			showQuantityReason: false,
			originalQuantity: newProps.data.Quantity,
			data: newProps.data,
			allCustomFields: newProps.allCustomFields,
			formIds: getValues(newProps.data, getKeys(newProps.data))
		});
	}

	handleFormChange(event, label, index) {
		var data = this.state.data;

		if(label === "custom_fields"){
			data.custom_fields[index].value = event.target.value;
			this.setState({date: data});
		} else if (label === 'Quantity'){
			data.Quantity = event.target.value;
			this.setState({
				data: data,
				showQuantityReason: Number(this.state.originalQuantity) !== Number(data.Quantity),
			});
		} else{
			data[label] = event.target.value;
			this.setState({date: data});
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
			else if (keys[i] === 'custom_fields'){
				if(vals[i].length > 0){
					list.push(<div className="form-group" key={"createform-div-customfields-labelrow-"+i}>
								Custom Fields
								</div>)
					for(var j = 0; j < vals[i].length; j++){
						var field = vals[i][j];
						var label = "";
						for(var n = 0; n < this.state.allCustomFields.length; n ++){
							if(this.state.allCustomFields[n]._id === field.field){
								label = this.state.allCustomFields[n].name + " " + "(" + this.state.allCustomFields[n].type + ")";
							}
						}
						if(label !== ""){
							list.push(this.makeCustomTextBox(i, j, field, label));
							list.push(
								<button
									key={i + "delete-field" + j}
									onClick={this.deleteCustomField.bind(this, field)}
									type="button"
									className="btn btn-danger delete-button">
									X
									</button>);

							list.push(
								<button
									key={i + "edit-field-button" + j}

									onClick={this.editCustomField.bind(this, j, field)}
									type="button"
									className="btn btn-outline-primary add-button">
									Edit
								</button>);
							}

					}

				}
				list.push(this.addCustomFieldButton(i, vals[i]));


			}
			else {
				list.push(this.makeTextBox(i, "text", keys[i], vals[i]));
			}
		}

		return list;
	}



	addCustomFieldButton(row, current_fields){
		return(
			<div className="form-group" key={"createform-div-row-"+row}>
			  <label htmlFor={"createform-row-"+row}>Add custom field</label>
				<CustomFieldSelect
					api={this.props.api}
					callback={this.props.callback}
					allCustomFields={this.state.allCustomFields}
					key={"add-field-"+row}
					ref="field"/>
				<input type="text"
					className="form-control"
					ref="fieldvalue"
					key={"add-field-value"+row}
					placeholder="Value">
					</input>
				<button type="button"
					className="btn btn-outline-primary add-button"
					key={"button-add-field"+row}
					onClick={e => this.checkFieldParams(this.refs.field.state.selectedField, this.refs.fieldvalue.value, current_fields)}>
					ADD
				</button>
			</div>
		);
	}

	checkFieldParams(custom_field, value, current_fields){
		var already_exists = false;
		for(var i = 0; i < current_fields.length; i++){
			if(current_fields[i].field === custom_field){
				already_exists = true;
			}
		}

		var type = "";
		var type_mismatch = false;
		var invalid_length = false;
		var name = "";
		this.props.api.get('/api/customFields/'+custom_field)
			.then(function(response) {
					if (response.data.error) {
						alert(response.data.error);
					} else {
						var field_params = {
							field: custom_field,
							value: value
						}
						type = response.data.type;
						name = response.data.name;

						if((type === "SHORT_STRING" || type === "LONG_STRING") && !validator.isAscii(value)){
							type_mismatch = true;
						}
						else if((type === "INT" || type === "FLOAT") && !validator.isNumeric(value)){
							type_mismatch = true;
						}
						else if((type === "INT" || type === "FLOAT") && validator.isNumeric(value)){
							if(type === "INT" && value % 1 !== 0){
								type_mismatch = true;
							}
							else if(type === "FLOAT" && !validator.isFloat(value)){
								type_mismatch = true;
							}
						}
						else if (type === "SHORT_STRING" && value.length > 100) {
							invalid_length = true;
						}

						this.addField(value, already_exists, type_mismatch, field_params, invalid_length);
					}
				}.bind(this))
				.catch(function(error) {
					console.log(error);
				}.bind(this));

	}

	addField(value, already_exists, type_mismatch, field_params, invalid_length){
		if(value && !already_exists && !type_mismatch){
			this.refs.field.value = "";
			this.refs.fieldvalue.value = "";
			this.props.api.post('/api/inventory/'+ this.props.itemId+ "/customFields/",  field_params)
				.then(function(response) {
						if (response.data.error) {
							alert(response.data.error);
						} else {
							this.props.callback();
						}
					}.bind(this))
					.catch(function(error) {
						console.log(error);
					}.bind(this));
		}
		else if(already_exists) {
			alert("item already has that custom field");
		}
		else if(type_mismatch){
			alert("Not correct type");
		}
		else if (invalid_length) {
			alert("String is too long for type SHORT_STRING");
		}
		else if(!value){
			alert("field must have a value");
		}
	}


	deleteCustomField(field){
		this.props.api.delete('/api/inventory/'+ this.props.itemId+ "/customFields/" + field.field)
			.then(function(response) {
					if (response.data.error) {
						alert(response.data.error);
					} else {
						this.props.callback();

					}
				}.bind(this))
				.catch(function(error) {
					console.log(error);
				}.bind(this));

	}



	editCustomField(index, field){
		var new_value = this.state.data.custom_fields[index].value
		var body = {
			field: field.field,
			value: new_value,
		}
		var type = "";
		var type_mismatch = false;
		this.props.api.get('/api/customFields/'+field.field)
			.then(function(response) {
					if (response.data.error) {
						alert(response.data.error);
					} else {
						type = response.data.type;
						if((type === "SHORT_STRING" || type === "LONG_STRING") && !validator.isAscii(new_value)){
							type_mismatch = true;
						}
						else if((type === "INT" || type === "FLOAT") && !validator.isNumeric(new_value)){
							type_mismatch = true;
						}
						else if((type === "INT" || type === "FLOAT") && validator.isNumeric(new_value)){
							if(type === "INT" && new_value % 1 !== 0){
								type_mismatch = true;
							}
							else if(type === "FLOAT" && new_value % 1 === 0){
								type_mismatch = true;
							}
						}

						this.submitFieldEdit(type_mismatch, body, field);
					}
				}.bind(this))
				.catch(function(error) {
					console.log(error);
				}.bind(this));

	}

	submitFieldEdit(type_mismatch, body, field){
		if(!type_mismatch){
			this.props.api.put('/api/inventory/'+ this.props.itemId+ "/customFields/" + field.field, body)
				.then(function(response) {
						if (response.data.error) {
							alert(response.data.error);
						} else {
							this.props.callback();
						}
					}.bind(this))
					.catch(function(error) {
						console.log(error);
					}.bind(this));
		}
		else{
			alert("new value is incorrect type");
		}
	}



	makeCustomTextBox(row, index, field, label){
		var id = "createform-custom-row-"+row;
		this.state.formIds.push(id);
		var ref = "custom_fields";
		var input = <input type="text"
				className="form-control"
				value={field.value}
				ref={ref}
				key={id+field.field}
				onChange={e => this.handleFormChange(e, ref, index)}>
				</input>
		return (
			<div className="form-group" key={"createform-div-custom-row-"+field.field}>
				<label htmlFor={"createform-row-"+row}>{label}</label>
				{input}
			</div>
		);

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
		var object = {
				name: this.refs.Name.value,
	  		quantity: this.refs.Quantity.value,
	 			model_number: this.refs["Model Number"].value,
	  		description: this.refs.Description.value,
	  		vendor_info: this.refs["Vendor Info"].value,
	  		tags: tags ? tags.split(',') : [],
	  		has_instance_objects: false
  		}



  		if (this.validItem(object) === true) {
  			object.quantity = Number(object.quantity);

				if (this.refs.reasonField) {
					object.quantity_reason = this.refs.reasonField.value;
				}

        this.props.api.put('/api/inventory/'+ this.props.itemId, object)
			  	.then(function(response) {
			        if (response.data.error) {
			        	alert(response.data.error);
			        } else {
			        	this.props.callback();
			        }
			      }.bind(this))
			      .catch(function(error) {
			        console.log(error);
			      }.bind(this));
				}
  }

	render() {
    return (
		<div>
			<button type="button"
				className="btn btn-sm btn-outline-primary"
				data-toggle="modal"
				data-target={"#editModal-"+this.props.itemId}
				data-backdrop="static">
				<span className="fa fa-pencil"></span>
			</button>

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
			      <div className="modal-footer">
			        <button type="button" onClick={() => this.props.callback()} className="btn btn-secondary" data-dismiss="modal">Cancel</button>
			        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
			        <button onClick={() => this.onSubmission()} type="button" className="btn btn-primary">Apply</button>
			      </div>
			    </div>
			  </div>
			</div>
		</div>
		);
	}
}

export default ItemEditor
