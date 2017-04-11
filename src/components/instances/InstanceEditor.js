import React, { Component } from 'react';
import PaginationContainer from '../global/PaginationContainer.js';
import InstanceEditorTable from './InstanceEditorTable';
import axios from 'axios';

class InstanceEditor extends Component {

  constructor(props) {
		super(props);
		this.state = {
      	itemID: this.props.itemID,
        allCustomFields: this.props.allCustomFields
		};
	}


  componentWillReceiveProps(newProps) {
    this.setState({
      itemID: newProps.itemID,
      allCustomFields: newProps.allCustomFields
    });
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
        hasOtherParams={true}
        id={'instance-editor-' + this.state.itemID}
        rowsPerPage={5}
        extraProps={{
          allCustomFields: this.state.allCustomFields,
          itemID: this.state.itemID
        }}
      />
    );
  }
}

export default InstanceEditor
