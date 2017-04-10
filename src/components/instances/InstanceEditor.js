import React, { Component } from 'react';
import PaginationContainer from '../global/PaginationContainer.js';
import InstanceEditorTable from './InstanceEditorTable';
import axios from 'axios';

class InstanceEditor extends Component {

  constructor(props) {
		super(props);
		this.state = {
      	itemID: this.props.itemID
		};
	}

  componentWillReceiveProps(newProps) {
    this.setState({itemID: newProps.itemID});
  }

  processData(data) {
    return data.data;
  }

  makeURL() {
    return 'api/inventory/' + this.state.itemID + '/instances?in_stock=true';
  }

  render() {
    var table = InstanceEditorTable;
    return (
      <PaginationContainer
        url={this.makeURL()}
        processData={data => this.processData(data)}
        renderComponent={table}
        showFilterBox={false}
        showStatusFilterBox={false}
        hasOtherParams={false}
        id={'instance-editor-' + this.state.itemID}
        rowsPerPage={this.props.rowsPerPage}
        extraProps={{allCustomFields: this.props.allCustomFields}}
      />
    );
  }
}

export default InstanceEditor
