import React, { Component } from 'react';
import InstanceEditorTableRow from './InstanceEditorTableRow';

class InstanceEditorTable extends Component {

  constructor(props) {
		super(props);
		this.state = {
			data: props.data,
      allCustomFields: props.allCustomFields
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			data: newProps.data,
      allCustomFields: newProps.allCustomFields
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
        />
			);
    }.bind(this));
		return list;
  }

  render() {
    return (
      <ul className="list-group list-group-flush">
        {this.makeRows()}
      </ul>
    );
  }
}

export default InstanceEditorTable
