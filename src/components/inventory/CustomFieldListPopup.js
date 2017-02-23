import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import Select from 'react-select';



const types = [
    { value: 'SHORT_STRING', label: 'SHORT_STRING' },
    { value: 'LONG_STRING', label: 'LONG_STRING' },
    { value: 'INT', label: 'INT' },
    { value: 'FLOAT', label: 'FLOAT' }];


class CustomFieldListPopup extends Component {

	constructor(props) {
		super(props);
		this.state = {
      data: [],
      allFields: [],
      formIds: [],
		}
	}

  mapFields(fields) {
    return fields.map(function(field) {
      return {name: field.name, type: field.type};
    });
  }

	componentWillMount(){
    this.props.api.get('/api/customFields')
      .then(function(response) {
        if (response.error) {
          console.log(response.error);
        }
        else{
          this.setState({allFields: response.data});
          var data = this.mapFields(response.data);
          this.setState({data: data});
        }
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      });
	}

  makeTextBox(row, field, field_id){
    var id = "editfield-form-row-"+row;
    this.state.formIds.push(id);
    var name_input = <input type="text"
          className="form-control"
          value={field.name}
          ref={field_id+"-NAME"}
          key={field_id+"-NAME"}
          onChange={e => this.handleNameChange(e, field_id)}>
        </input>
    var type_input = <Select
          simpleValue
          value={field.type}
          clearable={true}
          options={types}
          ref={field_id+"-TYPE"}
          key={field_id+"-TYPE"}
          onChange={e=>this.handleTypeChange(e, field_id)}
        />


    return (
      <div className="form-group" key={"createform-div-row-"+row}>
        {name_input}
        {type_input}
        <button type="button"
					className="btn btn-outline-primary add-button"
					key={"button-add-field"+row}
					onClick={e => this.onSubmission(field_id)}>
					EDIT
				</button>
      </div>
    );
  }

  handleNameChange(event, id) {
    var new_name = event.target.value;
    var data = this.state.data;
    var allFields = this.state.allFields;
		for(var i = 0; i < this.state.allFields.length; i ++){
      if(this.state.allFields[i]._id === id){
        data[i].name = new_name;
        allFields[i].name = new_name;
      }
    }
		this.setState({
			allFields: allFields,
      data: data
		});
	}

  handleTypeChange(event, id) {
    console.log(event);
    var new_type = event;
    var data = this.state.data;
    var allFields = this.state.allFields;
		for(var i = 0; i < this.state.allFields.length; i ++){
      if(this.state.allFields[i]._id === id){
        data[i].type = new_type;
        allFields[i].type = new_type;
      }
    }
		this.setState({
			allFields: allFields,
      data: data
		});
	}


	render() {
		return (
		<th>
			<button type="button"
				className="btn btn-outline-primary add-button"
				data-toggle="modal"
				data-target={"#editCustomFieldModal"}>
				Show CFs
			</button>

			<div className="modal fade"
				id={"editCustomFieldModal"}
				tabIndex="-1"
				role="dialog"
				aria-labelledby="createLabel"
				aria-hidden="true">
			  <div className="modal-dialog" role="document">
			    <div className="modal-content">
			      <div className="modal-header">
			        <h5 className="modal-title" id="createLabel">Edit Custom Fields</h5>
			      </div>
			      <div className="modal-body">
			        {this.makeForm()}
			      </div>

			    </div>
			  </div>
			</div>
		</th>
		);
	}


	makeForm(){
    var list = []; var i;
    for (i=0; i<this.state.data.length; i++) {
      list.push(this.makeTextBox(i, this.state.data[i], this.state.allFields[i]._id));
    }
    return list;
	}


	onSubmission(field_id) {
    var name_ref = field_id+"-NAME";
    var type_ref = field_id+"-TYPE";
		var new_field = {
      name: this.refs[name_ref].value,
      type: this.refs[type_ref].value,
      isPrivate: false,
    }
		this.props.api.put('/api/customFields/' + field_id, new_field)
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

export default CustomFieldListPopup
