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
      allCustomFields: props.allCustomFields,
			existing: props.existing
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			_id: newProps.instance._id,
      itemID: newProps.instance.item,
			tag: newProps.instance.tag,
			customFields: newProps.instance.custom_fields,
      allCustomFields: newProps.allCustomFields,
			existing: newProps.existing
		});
	}

  onEdit() {
    var errors = this.refs.customFields.checkForErrors();
    if (errors) {
      alert("Custom field errors: \n" + errors);
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
          alert(JSON.stringify(response.data.error));
        }
        this.props.callback();
      }.bind(this))
      .catch(function(error) {
        alert(error);
      });
  }

  onDelete() {
    this.props.api.delete(
      "api/inventory/" + this.state.itemID + "/instances/" + this.state._id,
    )
      .then(function(response) {
        if (response.data.error) {
          alert(JSON.stringify(response.data.error));
        }
        this.props.callback(true);
      }.bind(this))
      .catch(function(error) {
        alert(error);
      });
  }

	onAdd() {
		var errors = this.refs.customFields.checkForErrors();
    if (errors) {
      alert("Custom field errors: \n" + errors);
      return;
    }
    var newParams = {
      tag: this.refs.tagField.value,
      custom_fields: this.refs.customFields.getCurrentValues()
    }
    this.props.api.post(
      "api/inventory/" + this.state.itemID + "/instances",
      newParams
    )
      .then(function(response) {
        if (response.data.error) {
          alert(JSON.stringify(response.data.error));
        }
				this.clearForm();
        this.props.callback();
      }.bind(this))
      .catch(function(error) {
        alert(error);
      });
	}

	onCancel() {
		this.clearForm();
		this.props.callback();
	}

	clearForm() {
		this.refs.tagField.value = "";
		this.refs.customFields.clearForm();
	}

	renderExistingInstanceButtons() {
		return (
			<div className="col-sm-2">
				<button onClick={() => this.onDelete()} type="button" className="btn btn-sm btn-danger align-top">
					<span className="fa fa-trash"></span>
				</button>
				<button onClick={() => this.onEdit()} type="button" className="btn btn-sm btn-primary align-bottom">
					Edit
				</button>
			</div>
		);
	}

	renderNewInstanceButtons() {
		return (
			<div className="col-sm-2">
				<button onClick={() => this.onCancel()} type="button" className="btn btn-sm btn-danger align-top">
					Cancel
				</button>
				<button onClick={() => this.onAdd()} type="button" className="btn btn-sm btn-primary align-bottom">
					Add
				</button>
			</div>
		)
	}

	render() {
		return (
      <li className={"list-group-item instance-item-row" + (this.state.existing ? "" : " new-instance-form")}>
				<div className="container loan-details">
          <div className="row">
            <div className="col-sm-10">
              <div className="form-group-compact" key="tag-field-group">
          			 <label htmlFor="tag-field-form">Tag</label>
                 <input
                   type="text"
                   className="form-control form-control-compact"
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
                compact={true}
              />
            </div>
            {this.state.existing ?
							this.renderExistingInstanceButtons() :
							this.renderNewInstanceButtons()
						}
          </div>
        </div>
			</li>
    );
	}
}

export default InstanceEditorTableRow;
