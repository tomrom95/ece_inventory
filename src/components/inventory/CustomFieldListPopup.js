import React, { Component } from 'react';
import '../../App.css';



class CustomFieldListPopup extends Component {

	constructor(props) {
		super(props);
		this.state = {
      data: [],
      formIds: [],
      changed: [],
      activated: false,
      justApplied: false
		}
	}

  mapFields(fields) {
    return fields.map(function(field) {
      return {
        name: field.name,
        type: field.type,
        isPrivate: field.isPrivate,
        _id: field._id,
				perInstance: field.perInstance
       };
    });
  }

  componentWillReceiveProps(newProps){
    var data = this.mapFields(newProps.allCustomFields);
    this.setState({
      data: data,

      activated: this.state.justApplied ? true : false
    });
  }

	componentWillMount(){



    //this.loadData();
	}


  loadData() {
    this.props.api.get('/api/customFields')
    .then(function(response) {
      if (response.error) {
        console.log(response.error);
      }
      else{
        var data = this.mapFields(response.data);
        this.setState({
          data: data,
          activated: true,
          changed: []
        });
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

    var is_private = <input type="checkbox"
          checked={field.isPrivate}
    			onChange={e=>this.handlePrivacyChange(e, field._id)}
					className="form-checkbox"
          ref={field._id+"-PRIVACY"}
    			key={field._id+"-PRIVACY"}>
    			</input>
		var perInstance =
			<input type="checkbox"
	      checked={field.perInstance}
				className="form-checkbox"
				onChange={null}
				disabled="disabled"
	      ref={field._id+"-perinstance"}
				key={field._id+"-perinstance"}>
			</input>


    return (
      <div className="customfield-item" key={"customfield-wrapper-"+row}>
        <div className="card" key={"customfield-card-"+row}>
          <div className="card-block" key={"customfield-cardblock-"+row}>
            <div className="row">
              <div className="col-md-10">
                <div className="form-group" key={"createform-div-row-"+row}>
                  <label key={"name-row-"+row+"-"+field._id} htmlFor={"createform-row-"+row}>Name</label>
                  {name_input}
                </div>
              </div>
              <div className="col-md-2">
                <button
                    key={"delete-field"+row}
                    onClick={()=>{this.deleteCustomField(field._id)}}
                    type="button"
                    className="btn btn-sm btn-danger delete-button">
                    <span className="fa fa-remove"></span>
                </button>
              </div>
            </div>

            <div className="form-group row">
              <div className="col-sm-8">
								<div className="row">
									<label key={"privacy-row-"+row+"-"+field._id} htmlFor={field._id+"-PRIVACY"}>Private</label>
		              {is_private}
								</div>
                <div className="row">
									<label key={"perInstance-row-"+row+"-"+field._id} htmlFor={field._id+"-perinstance"}>Per Instance</label>
		               {perInstance}
								</div>
              </div>
							<div className="col-sm-4 customfield-apply">
                  {
                    this.state.changed[row] === true ?
                    <button type="button"
                      className="btn btn-sm btn-outline-primary"
                      key={"button-add-field"+row}
                      onClick={e => this.onSubmission(field._id)}>
                      Apply
                    </button> : null
                  }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleNameChange(event, id) {
    var new_name = event.target.value;
    var data = this.state.data;
    var changed = this.state.changed;
		for(var i = 0; i < this.state.data.length; i ++){
      if(this.state.data[i]._id === id){
        data[i].name = new_name;
        changed[i] = true;
      }
    }
		this.setState({
      data: data,
      changed: changed
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
    var changed = this.state.changed;
		for(var i = 0; i < this.state.data.length; i ++){
      if(this.state.data[i]._id === id){
        data[i].isPrivate = !this.state.data[i].isPrivate;
        changed[i] = true;
      }
    }
		this.setState({
      data: data,
      changed: changed
		});
	}

  deleteCustomField(field_id){
    this.props.api.delete('/api/customFields/' + field_id)
      .then(function(response) {
          if (response.data.error) {
            alert(response.data.error);
          } else {
            this.setState({
              activated: true,
              justApplied: true
            });
            this.props.callback();
          }
        }.bind(this))
        .catch(function(error) {
          console.log(error);
        }.bind(this));
  }

	makeForm(){
    if (this.state.data.length === 0) {
      return <div>No custom fields defined!</div>;
    }
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

              var changed = this.state.changed;
              for (var i=0; i<this.state.data.length; i++) {
                if (this.state.data[i]._id === field_id) {
                  changed[i] = false;
                }
              }
              this.setState({
                justApplied: true,
                changed: changed
              });
  	        }
  	      }.bind(this))
  	      .catch(function(error) {
  	        console.log(error);
  	      }.bind(this));



    }
  }

  render() {
    var button =
      <a className="nav-link userpage-tab" href="#"
        data-toggle="modal"
        data-target={"#editCustomFieldModal"}
        onMouseOver={() => this.loadData()}
        onClick={() => this.loadData()}>
        Edit Fields
      </a>

    if (this.state.activated === false) {
      return (<div>{button}</div>);
    }

    return (
    <div>
      {button}
      <div className="modal fade"
        id={"editCustomFieldModal"}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="createLabel"
        aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content customfield-editor-modal">
            <div className="modal-header">
              <h5 className="modal-title" id="createLabel">Edit Custom Fields</h5>
            </div>
            <div className="modal-body">
              {this.makeForm()}
            </div>
            <div className="modal-footer">
            { this.state.data.length === 0 ? null :
                <button type="button"
                    className="btn btn-secondary"
                    data-dismiss="modal"
                    onClick={() => this.loadData()}>
                  Cancel
                </button>
            }
                <button type="button"
                    data-dismiss="modal"
                    className={"btn btn-primary"}>
                    Close
                </button>
            </div>

          </div>
        </div>
      </div>
    </div>
    );
  }
}

export default CustomFieldListPopup
