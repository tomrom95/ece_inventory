import React, { Component } from 'react';
import '../../App.css';



class CustomFieldListPopup extends Component {

	constructor(props) {
		super(props);
		this.state = {
      data: [],
      formIds: [],
		}
	}

  mapFields(fields) {
    return fields.map(function(field) {
      return {name: field.name, type: field.type, isPrivate: field.isPrivate, _id: field._id};
    });
  }

  componentWillReceiveProps(newProps){
    var data = this.mapFields(newProps.allCustomFields);
    this.setState({
      data: data,
    });
  }

	componentWillMount(){
    this.props.api.get('/api/customFields')
      .then(function(response) {
        if (response.error) {
          console.log(response.error);
        }
        else{
          var data = this.mapFields(response.data);
          this.setState({data: data});
        }
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      });
	}

  makeTextBox(row, field){
    var id = "editfield-form-row-"+row;
    this.state.formIds.push(id);
    var name_input = <input type="text"
          className="form-control"
          value={field.name}
          ref={field._id+"-NAME"}
          key={field._id+"-NAME"}
          onChange={e => this.handleNameChange(e, field._id)}>
        </input>
  /*  var type_input = <Select
          simpleValue
          value={field.type}
          clearable={true}
          options={types}
          ref={field_id+"-TYPE"}
          key={field_id+"-TYPE"}
          onChange={e=>this.handleTypeChange(e, field_id)}
        />*/
    var is_private = <input type="checkbox"
    			className="form-control"
          checked={field.isPrivate}
    			onChange={e=>this.handlePrivacyChange(e, field._id)}
          ref={field._id+"-PRIVACY"}
    			key={field._id+"-PRIVACY"}>
    			</input>


    return (
      <div className="form-group" key={"createform-div-row-"+row}>
        <label key={"name-row-"+row+"-"+field._id} htmlFor={"createform-row-"+row}>Name</label>
        {name_input}

        <label key={"privacy-row-"+row+"-"+field._id} htmlFor={"createform-row-"+row}>Private</label>
        {is_private}
        <div className="custom-field-buttons">
        <button type="button"
					className="btn btn-outline-primary add-button"
					key={"button-add-field"+row}
					onClick={e => this.onSubmission(field._id)}>
					Apply Changes
				</button>
        <button
          key={"delete-field"+row}
          onClick={()=>{this.deleteCustomField(field._id)}}
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
		for(var i = 0; i < this.state.data.length; i ++){
      if(this.state.data[i]._id === id){
        data[i].name = new_name;
      }
    }
		this.setState({
      data: data
		});
	}



  handleTypeChange(event, id) {
    var new_type = event;
    var data = this.state.data;
		for(var i = 0; i < this.state.data.length; i ++){
      if(this.state.data[i]._id === id){
        data[i].type = new_type;
      }
    }
		this.setState({
      data: data
		});
	}

  handlePrivacyChange(event, id) {
    var data = this.state.data;
		for(var i = 0; i < this.state.data.length; i ++){
      if(this.state.data[i]._id === id){
        data[i].isPrivate = !this.state.data[i].isPrivate;
      }
    }
		this.setState({
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
            alert("Custom Field deleted successfully.");

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
      list.push(this.makeTextBox(i, this.state.data[i]));
    }
    return list;
	}


	onSubmission(field_id) {
    var name = "";
    var isPrivate = false;
    var type = "";
    for(var j = 0; j < this.state.data.length; j++){
      if(this.state.data[j]._id === field_id){
        name = this.state.data[j].name;
        isPrivate = this.state.data[j].isPrivate;
        type = this.state.data[j].type;
      }
    }
		var new_field = {
      name: name,
      type: type,
      isPrivate: isPrivate,
    }
    if(name.length === 0){
      alert("field name must not be null");
    }
    else{
      this.props.api.put('/api/customFields/' + field_id, new_field)
  	  	.then(function(response) {
  	        if (response.data.error) {
              console.log(response.data.error);
            } else {
  						this.props.callback();
              alert("Changes applied to item");
  	        }
  	      }.bind(this))
  	      .catch(function(error) {
  	        console.log(error);
  	      }.bind(this));

    }

  }



}

export default CustomFieldListPopup
