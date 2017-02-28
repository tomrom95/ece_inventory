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
      return {name: field.name, type: field.type, isPrivate: field.isPrivate};
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
    var is_private = <input type="checkbox"
    			className="form-control"
          checked={field.isPrivate}
    			onChange={e=>this.handlePrivacyChange(e, field_id)}
          ref={field_id+"-PRIVACY"}
    			key={field_id+"-PRIVACY"}>
    			</input>


    return (
      <div className="form-group" key={"createform-div-row-"+row}>
        <label key={"name-row-"+row+"-"+field_id} htmlFor={"createform-row-"+row}>Name</label>
        {name_input}
        <label key={"type-row-"+row+"-"+field_id} htmlFor={"createform-row-"+row}>Type</label>
        {type_input}
        <label key={"privacy-row-"+row+"-"+field_id} htmlFor={"createform-row-"+row}>Private
          {is_private}
        </label>
        <div className="custom-field-buttons">
        <button type="button"
					className="btn btn-outline-primary add-button"
					key={"button-add-field"+row}
					onClick={e => this.onSubmission(field_id)}>
					Apply Changes
				</button>
        <button
          key={"delete-field"+row}
          onClick={()=>{this.deleteCustomField(field_id)}}
          type="button"
          className="btn btn-danger delete-button">
          Delete
        </button>
        </div>
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

  handlePrivacyChange(event, id) {
    var check_state = event;
    var allFields = this.state.allFields;
    var data = this.state.data;
    var ref = id+"-PRIVACY";
		for(var i = 0; i < this.state.allFields.length; i ++){
      if(this.state.allFields[i]._id === id){
        allFields[i].isPrivate = !this.state.allFields[i].isPrivate;
        data[i].isPrivate = !this.state.data[i].isPrivate;
      }
    }
		this.setState({
			allFields: allFields,
      data: data,
		});
	}


  deleteCustomField(field_id){
    this.props.api.delete('/api/customFields/' + field_id)
      .then(function(response) {
          if (response.data.error) {
            alert(response.data.error);
          } else {
            this.props.callback();
            alert("CUstom Field deleted successfully.");

          }
        }.bind(this))
        .catch(function(error) {
          console.log(error);
        }.bind(this));
  }
	render() {
		return (
		<th>
			<button type="button"
				className="btn btn-outline-primary add-button"
				data-toggle="modal"
				data-target={"#editCustomFieldModal"}>
				Edit Fields
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
    var private_ref = field_id+"-PRIVACY";
    var isPrivate = false;
    for(var j = 0; j < this.state.data.length; j++){
      if(this.state.allFields[j]._id === field_id){
        isPrivate = this.state.data[j].isPrivate;
      }
    }
		var new_field = {
      name: this.refs[name_ref].value,
      type: this.refs[type_ref]._focusedOption.value,
      isPrivate: isPrivate,
    }
		this.props.api.put('/api/customFields/' + field_id, new_field)
	  	.then(function(response) {
	        if (response.data.error) {
            console.log(response.data.error);
          } else {
						this.props.callback();
            alert("changes applied to item");
	        }
	      }.bind(this))
	      .catch(function(error) {
	        console.log(error);
	      }.bind(this));

  }



}

export default CustomFieldListPopup
