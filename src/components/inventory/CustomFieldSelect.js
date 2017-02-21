import React, { Component } from 'react';
import Select from 'react-select';

class CustomFieldSelect extends Component {
  constructor(props){
    super(props);
    this.state = {
      allFields: [],
      allFieldNames: [],
      selectedField: null,
    }
  }

  getSelectedUserId() {
    return this.state.selectedField;
  }

  clearUser() {
    this.setState({
      selectedField: null
    });
  }

  mapFields(fields) {
    return fields.map(function(field) {
      var label = field.name;
      return {label: label, value: field._id};
    });
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
    for(var i = 0; i < this.state.allFields; i++){
      if(this.state.allFields[i].name === value){
        this.setState({
          selectedField: this.state.allFields[i]
        })
      }
    }
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
