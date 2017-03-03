import React, { Component } from 'react';
import Select from 'react-select';

class CustomFieldSelect extends Component {
  constructor(props){
    super(props);
    this.state = {
      allFields: [],
      selectedField: null,
    }
  }


  getSelectedUserId() {
    return this.state.selectedField;
  }

  clearField() {
    this.setState({
      selectedField: null
    });
  }

  mapFields(fields) {
    return fields.map(function(field) {
      var label = field.name + " (" + field.type + ")";
      return {label: label, value: field._id};
    });
  }


  componentWillReceiveProps(newProps){
    var data = this.mapFields(newProps.allCustomFields);
    this.setState({allFields: data});
  }

  componentWillMount() {
    this.props.api.get('/api/customFields')
      .then(function(response) {
        if (response.error) {
          console.log(response.error);
        }
        var data = this.mapFields(response.data);
        this.setState({allFields: data});
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      });
  }

  handleChange(value) {
    this.setState({
      selectedField: value
    })
  }

  render() {
    return (
      <Select
        simpleValue
        value={this.state.selectedField}
        clearable={true}
        placeholder="Choose field"
        options={this.state.allFields}
        onChange={this.handleChange.bind(this)}
      />
    );
  }

}

export default CustomFieldSelect;
