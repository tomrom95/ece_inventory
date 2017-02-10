import React, { Component } from 'react';
import Select from 'react-select';

class TagSelector extends Component {
  constructor(props){
    super(props);
    this.state = {
      allTags: [],
      selectedTags: this.props.defaultTags
    }
  }

  getSelectedTags() {
    return this.state.selectedTags;
  }

  clearTags() {
    this.setState({
      selectedTags: []
    });
  }

  componentWillMount() {
    this.props.api.get('/api/inventory/tags')
      .then(function(response) {
        if (response.error) {
          console.log(response.error);
        }
        var data = response.data.map(function(tag) {
          return {label: tag, value: tag}
        });
        this.setState({allTags: data});
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      });
  }

  handleChange(value) {
    this.setState({selectedTags: value});
  }

  render() {
    if (this.props.disallowCustom) {
      return (
        <Select
          multi
          simpleValue
          value={this.state.selectedTags}
          placeholder="Choose tag(s)"
          options={this.state.allTags}
          onChange={this.handleChange.bind(this)}
        />
      );
    } else {
      return (
        <Select.Creatable
          multi
          simpleValue
          value={this.state.selectedTags}
          placeholder="Choose tag(s)"
          options={this.state.allTags}
          onChange={this.handleChange.bind(this)}
        />
      );
    }

  }

}

export default TagSelector;
