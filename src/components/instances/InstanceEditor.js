import React, { Component } from 'react';
import PaginationContainer from '../global/PaginationContainer.js';
import InstanceEditorTable from './InstanceEditorTable';
import SearchBar from '../global/SearchBar';
import axios from 'axios';

class InstanceEditor extends Component {

  constructor(props) {
		super(props);
		this.state = {
      	itemID: this.props.itemID,
        allCustomFields: this.props.allCustomFields,
        searchText: ""
		};
	}


  componentWillReceiveProps(newProps) {
    this.setState({
      itemID: newProps.itemID,
      allCustomFields: newProps.allCustomFields,
      searchText: ""
    });
  }

  processData(data) {
    return data.data;
  }

  makeURL() {
    var url = 'api/inventory/' + this.state.itemID + '/instances?in_stock=true';
    if (this.state.searchText) {
      url += "&tag=" + this.state.searchText;
    }
    return url;
  }

  onSearch(text) {
    this.setState({
      searchText: text
    });
  }

  render() {
    var table = InstanceEditorTable;
    return (
      <div>
        <SearchBar callback={this.onSearch.bind(this)} />
        <PaginationContainer
          url={this.makeURL()}
          processData={data => this.processData(data)}
          renderComponent={table}
          showFilterBox={false}
          showStatusFilterBox={false}
          hasOtherParams={true}
          id={'instance-editor-' + this.state.itemID}
          rowsPerPage={5}
          extraProps={{allCustomFields: this.state.allCustomFields}}
        />
      </div>
    );
  }
}

export default InstanceEditor
