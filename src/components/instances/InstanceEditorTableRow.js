import React, { Component } from 'react';
import CustomFieldForm from '../inventory/CustomFieldForm';

class InstanceEditorTableRow extends Component {

	constructor(props) {
		super(props);
		this.state = {
			_id: props.instance._id,
      itemID: props.instance.item,
			tag: props.instance.tag,
			customFields: props.instance.custom_fields,
      allCustomFields: props.allCustomFields
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			_id: newProps.instance._id,
      itemID: newProps.instance.item,
			tag: newProps.instance.tag,
			customFields: newProps.instance.custom_fields,
      allCustomFields: newProps.allCustomFields
		});
	}

  onEdit() {
    var errors = this.refs.customFields.checkForErrors();
    if (errors) {
      alert(errors);
      return;
    }
    var newParams = {
      tag: this.refs.tagField.value,
      custom_fields: this.refs.customFields.getCurrentValues()
    }

    this.props.api.put(
      "api/inventory/" + this.state.itemID + "/instances/" + this.state._id,
      newParams
    )
      .then(function(response) {
        if (response.data.error) {
          alert(response.data.error);
        }
        this.props.callback();
      })
      .catch(function(error) {
        alert(error);
      });
  }

	render() {
		return (
      <li className="list-group-item">
				<div className="container loan-details">
          <div className="form-group" key="tag-field-group">
      			 <label htmlFor="tag-field-form">Tag</label>
             <input
               type="text"
               className="form-control"
               defaultValue={this.state.tag}
               ref="tagField"
               key="tag-field-form"
             />
      		</div>
          <CustomFieldForm
            allCustomFields={this.state.allCustomFields}
            currentValues={this.state.customFields}
            perInstance={true}
            ref="customFields"
          />
          <button onClick={() => this.onEdit()} type="button" className="btn btn-primary">Edit</button>
		    </div>
			</li>
    );
	}
}

export default InstanceEditorTableRow;
