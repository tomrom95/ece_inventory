import React, { Component } from 'react';
import PaginationContainer from '../global/PaginationContainer.js';
import InstanceEditorTable from './InstanceEditorTable';
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
      url += "&tag=" + searchText;
    }
    return url;
  }

  onSearch() {
    this.setState({
      searchText: this.refs.tagSearchField.value
    });
  }

  renderSearchBar() {
    return (
      <div className="row">
        <div className="col-sm-8">
          <input
            type="text"
            className="form-control form-control-compact"
            defaultValue={this.state.tag}
            ref="tagSearchField"
          />
        </div>
        <div className="col-sm-4">
          <button onClick={() => this.onSearch()} type="button" className="btn btn-sm btn-primary">
  					<span className="fa fa-search"></span>
  				</button>
        </div>
      </div>
    )
  }

  render() {
    var table = InstanceEditorTable;
    return (
      <div>
        {this.renderSearchBar()}
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
