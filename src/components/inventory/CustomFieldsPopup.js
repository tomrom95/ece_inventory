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
		this.handleInputChange = this.handleInputChange.bind(this);
	}



	handleInputChange(event) {
	    const value = event.target.checked;

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
			        <button onClick={e => {this.onSubmission()}} type="button" data-dismiss="modal" className="btn btn-primary">Submit</button>
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
			ref="field_name"
			key={1}>
			</input>
		var type = <Select
			simpleValue
			value={this.state.type}
			clearable={true}
			placeholder="Choose Type"
			options={types}
			onChange={this.handleTypeChange.bind(this)}
		/>
		var is_private = <input type="checkbox"
			className="form-control"
			onChange={this.handleInputChange}
			key={3}>
			</input>

		return (
			<div className="form-group" key={"createform-div-row-"}>
			  <label htmlFor={"createform-row-"}>Name</label>
			  {name}
				<label htmlFor={"createform-row-"}>Type</label>
				{type}
				<label htmlFor={"createform-row-"}>Private</label>
				{is_private}
			</div>
		);
	}


	onSubmission() {
		var custom_field = {
			name: this.refs.field_name.value,
			type: this.state.type,
			isPrivate: this.state.isPrivate,
		}
		this.props.api.post('/api/customFields/', custom_field)
	  	.then(function(response) {
	        if (response.data.error) {
        		console.log(response.data.error);
	        } else {
						console.log(response);
						this.props.callback();
	        }
	      }.bind(this))
	      .catch(function(error) {
	        console.log(error);
	      }.bind(this));

  }



}

export default CustomFieldsPopup
