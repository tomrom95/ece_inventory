import React, { Component } from 'react';
import '../../App.css';
import TagSelector from '../global/TagSelector.js';

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
			data: props.data,
			formIds: []
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			data: newProps.data,
			formIds: []
		});
	}

	handleFormChange(event, label) {
		var data = this.state.data;
		data[label] = event.target.value;
		this.setState({
			data: data
		});
	}

	makeForm() {
		var keys = getKeys(this.state.data);
		var vals = getValues(this.state.data, keys);
		var list = []; var i;
		for (i=0; i<keys.length; i++) {
			if (keys[i] === 'Tags') {
				list.push(this.makeTextBox(i, "multiselect", keys[i], vals[i]));
			} else {
				list.push(this.makeTextBox(i, "text", keys[i], vals[i]));
			}
		}
		return list;
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
			onChange={e => this.handleFormChange(e, label)}>
			</input>
	}

		return (
			<div className="form-group" key={"createform-div-row-"+row}>
			  <label htmlFor={"createform-row-"+row}>{label}</label>
			  {input}
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
	  		location: this.refs.Location.value,
	  		vendor_info: this.refs["Vendor Info"].value,
	  		tags: tags ? tags.split(',') : [],
	  		has_instance_objects: false
  		}

  		if (this.validItem(object) === true) {
  			object.quantity = Number(object.quantity);

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
					className="btn btn-outline-primary edit-button"
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
				        <button onClick={() => this.onSubmission()} type="button" data-dismiss="modal" className="btn btn-primary">Submit</button>
				      </div>
				    </div>
				  </div>
				</div>
			</div>
			);
	}
}

export default ItemEditor
