import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import Select from 'react-select';



const types = [
    { value: 'SHORT_STRING', label: 'SHORT_STRING' },
    { value: 'LONG_STRING', label: 'LONG_STRING' },
    { value: 'INT', label: 'INT' },
    { value: 'FLOAT', label: 'FLOAT' }];


class CustomFieldsPopup extends Component {

	constructor(props) {
		super(props);
		this.state = {
			name: "",
			type: "",
			isPrivate: false,
		}
	}



	handleInputChange(event) {
	    this.setState({
	      isPrivate: !this.state.isPrivate,
	    });
	  }

	handleTypeChange(value){
		this.setState({
			type: value,
		});
	}

	render() {
		return (
		<th>
			<button type="button"
				className="btn btn-outline-primary add-button"
				data-toggle="modal"
				data-target={"#makeCustomFieldModal"}>
				Make Field
			</button>

			<div className="modal fade"
				id={"makeCustomFieldModal"}
				tabIndex="-1"
				role="dialog"
				aria-labelledby="createLabel"
				aria-hidden="true">
			  <div className="modal-dialog" role="document">
			    <div className="modal-content">
			      <div className="modal-header">
			        <h5 className="modal-title" id="createLabel">Create New Field</h5>
			      </div>
			      <div className="modal-body">
			        {this.makeForm()}
			      </div>
			      <div className="modal-footer">
			        <button onClick={e => {this.onSubmission()}} type="button" className="btn btn-primary">Submit</button>
              <button onClick={e => {this.clearForm()}} type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
			      </div>
			    </div>
			  </div>
			</div>
		</th>
		);
	}


	makeForm(){
		var name = <input type="text"
			className="form-control"
			ref={"field_name"}
			key={"field_name"}>
			</input>
		var type = <Select
			simpleValue
			value={this.state.type}
      ref={"field_type"}
			clearable={true}
			placeholder="Choose Type"
			options={types}
			onChange={this.handleTypeChange.bind(this)}
      key={"field_type"}
		/>
		var is_private = <input type="checkbox"
			className="form-control"
      checked={this.state.isPrivate}
			onChange={this.handleInputChange.bind(this)}
			key={"field_isPrivate"}>
			</input>

		return (
			<div className="form-group" key={"createform-div-row-"}>
			  <label htmlFor={"createform-row-"}>Name</label>
			  {name}
				<label htmlFor={"createform-row-"}>Type</label>
				{type}
				<label htmlFor={"createform-row-"}>Private
        {is_private}
        </label>
			</div>
		);
	}

  clearForm() {
    this.refs.field_name.value = "";
    this.setState({
      type: "",
      isPrivate: false,
    });
  }

	onSubmission() {
		var custom_field = {
			name: this.refs.field_name.value,
			type: this.state.type,
			isPrivate: this.state.isPrivate,
		}
    if(!custom_field.name){
      alert("Must add name");
    }
    else if(!custom_field.type){
      alert("Must specify type");
    }
    else {
      this.props.api.post('/api/customFields/', custom_field)
  	  	.then(function(response) {
  	        if (response.data.error) {
          		console.log(response.data.error);
  	        } else {
              alert("Custom Field made successfully");
              this.clearForm();
  						this.props.callback();
  	        }
  	      }.bind(this))
  	      .catch(function(error) {
  	        console.log(error);
  	      }.bind(this));
    }


  }



}

export default CustomFieldsPopup
