import React, { Component } from 'react';
import InstanceEditorTableRow from './InstanceEditorTableRow';

class InstanceEditorTable extends Component {

  constructor(props) {
		super(props);
		this.state = {
			data: props.data,
      allCustomFields: props.allCustomFields,
      isAdding: false,
      itemID: props.itemID
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			data: newProps.data,
      allCustomFields: newProps.allCustomFields,
      itemID: newProps.itemID
		});
	}

  makeRows() {
    var list = [];
		this.state.data.forEach(function(instance) {
      list.push(
				<InstanceEditorTableRow key={"instance-editor-table-row-" + instance._id}
  			  api={this.props.api}
  			  instance={instance}
  			  callback={this.props.callback}
          allCustomFields={this.state.allCustomFields}
          existing={true}
        />
			);
    }.bind(this));
		return list;
  }

  enableAdding() {
    this.setState({
      isAdding: true
    });
  }

  disableAdding() {
    this.props.callback();
    this.setState({
      isAdding: false
    })
  }

  renderAddingRow() {
    var blankInstance = {
      item: this.state.itemID,
      tag: "",
      custom_fields: []
    };
    return (
      <InstanceEditorTableRow
        key="instance-editor-table-row-new"
        api={this.props.api}
        instance={blankInstance}
        callback={this.disableAdding.bind(this)}
        allCustomFields={this.state.allCustomFields}
        existing={false}
      />
    );
  }

  render() {
    var newRow = null;
    if (this.state.isAdding) {
      newRow = this.renderAddingRow()
    }
    return (
      <ul className="list-group list-group-flush instance-table">
        <li className="list-group-item add-instance-row">
          <button
            className="btn btn-outline-primary add-instance-button"
            onClick={this.enableAdding.bind(this)}
          >
            <span className="fa fa-plus"></span>
          </button>
        </li>
        {newRow}
        {this.makeRows()}
      </ul>
    );
  }
}

export default InstanceEditorTable
