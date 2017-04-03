import React, { Component } from 'react';
import validator from 'validator';

function isInvalidFieldValue(value, type) {
  value = String(value);
  switch(type) {
    case 'LONG_STRING':
      return false;
    case 'SHORT_STRING':
      return value.length > 200;
    case 'FLOAT':
      return !validator.isFloat(value);
    case 'INT':
      return !validator.isInt(value);
    default:
      return true;
  }
}

function createAllCustomFieldMap(fields, perInstance) {
  var fieldMap = {};
  fields.forEach(function(field) {
    if (field.perInstance === perInstance) {
      fieldMap[field._id] = field;
    }
  });
  return fieldMap;
}

function createCurrentValueMap(currentValues, fieldMap) {
  var valueMap = {};
  currentValues.forEach(function(pair) {
    // filter out old fields
    if (fieldMap[pair.field]) {
      valueMap[pair.field] = pair.value;
    }
  });
  return valueMap;
}

class CustomFieldForm extends Component {
  constructor(props) {
		super(props);
    var fieldMap = createAllCustomFieldMap(props.allCustomFields || [], props.perInstance);
    var currentValueMap = createCurrentValueMap(props.currentValues || [], fieldMap)
		this.state = {
      fieldMap: fieldMap,
      currentValueMap: currentValueMap
		}
    this.handleFormChange = this.handleFormChange.bind(this);
	}

  checkForErrors() {
    var errors = "";
    var currentValues = this.state.currentValueMap;
    var fieldMap = this.state.fieldMap
    Object.keys(fieldMap).forEach(function(id) {
      if (!currentValues[id]) return;
      if (isInvalidFieldValue(currentValues[id], fieldMap[id].type)) {
        errors += "Invalid value for " + fieldMap[id].name + " of type " + fieldMap[id].type + "\n";
      }
    });
    return errors;
  }

	componentWillReceiveProps(newProps) {
    var fieldMap = createAllCustomFieldMap(newProps.allCustomFields || [], newProps.perInstance);
    var currentValueMap = createCurrentValueMap(newProps.currentValues || [], fieldMap)
		this.setState({
      fieldMap: fieldMap,
      currentValueMap: currentValueMap
		});
	}

  handleFormChange(event) {
    var id = event.target.name;
    var newValue = event.target.value;
    var currentValueMap = this.state.currentValueMap;
    currentValueMap[id] = newValue;
    this.setState({
      currentValueMap: currentValueMap
    });
  }

  getCurrentValues() {
    var currentValues = [];
    var valueMap = this.state.currentValueMap;
    Object.keys(valueMap).forEach(function(id) {
      currentValues.push({field: id, value: valueMap[id]});
    });
    return currentValues;
  }

  clearForm() {
    this.setState({
      currentValueMap: createCurrentValueMap(this.props.currentValues || [])
    });
  }

  render() {
    var formFields = [];
    Object.keys(this.state.fieldMap).forEach(function(fieldId) {
      var field = this.state.fieldMap[fieldId];
      var value = this.state.currentValueMap[fieldId];
      var typeLabel = field.type.toLowerCase().replace('_', ' ');
      var form = (
        <div className="form-group" key={fieldId}>
  			  <label htmlFor={fieldId}>{field.name + ' (' + typeLabel + ')'}</label>
          <input type="text"
    				className="form-control"
    				value={value || ""}
            name={fieldId}
            key={fieldId + '-textbox'}
    				onChange={this.handleFormChange}>
    			</input>
        </div>
      );
      formFields.push(form);
    }.bind(this));
    return (
      <div>
        {formFields}
      </div>
    );
  }
}

export default CustomFieldForm;
