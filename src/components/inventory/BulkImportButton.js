import React, { Component } from 'react';
import '../../App.css';
import FileInput from 'react-file-input';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import validator from 'validator';
import Popup from 'react-popup';
import JSONLint from './jsonlint.js';


class BulkImportButton extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedFile: null,
      name: "",
      preview: "",
		}
	}
  onDrop(acceptedFiles, rejectedFiles) {
    axios.get(acceptedFiles[0].preview).then(function(response){
      if(typeof response.data === "object"){
        this.setState({
          selectedFile: response.data,
          name: acceptedFiles[0].name,
          preview: acceptedFiles[0].preview
        });
      }
      else if(typeof response.data === "string"){
        var lint = JSONLint(response.data);
				if(lint.error){
					alert(lint.error);
				}
      }

    }.bind(this));

  }

  onOpenClick() {
    this.dropzone.open();
  }


	makeForm() {
    return(
      <div key={"import-form"}>
        {this.state.selectedFile ?
        <div>
          <div key={"files-preview"}>
            <h6 key={this.state.preview}> {this.state.name}</h6>
          </div>
        </div> :
        <Dropzone accept=".json" ref={(node) => { this.dropzone = node; }} onDrop={this.onDrop.bind(this)}>
            <div>Drop JSon file here or click to upload</div>
        </Dropzone>}
      </div>
    );


	}

	render() {
		var button =

      <a className="nav-link userpage-tab" href="#"
				data-toggle="modal"
				data-target={"#bulkImportModal"}>
				Import
			</a>;

		return (
		<div>
			{button}
			<div className="modal fade"
				id={"bulkImportModal"}
				tabIndex="-1"
				role="dialog"
				aria-labelledby="createLabel"
				aria-hidden="true">
			  <div className="modal-dialog" role="document">
			    <div className="modal-content">
			      <div className="modal-header">
			        <h5 className="modal-title" id="createLabel">Import from .json file</h5>
			      </div>
			      <div className="modal-body">
			        {this.makeForm()}
			      </div>
			      <div className="modal-footer">
			        <button type="button" onClick={this.clearForm.bind(this)} className="btn btn-secondary" data-dismiss="modal">Cancel</button>
			        <button onClick={e => this.onSubmission()} type="button" className="btn btn-primary">Submit</button>
			      </div>
			    </div>
			  </div>
			</div>
		</div>
		);
	}

	handleChange(event) {
   this.setState({
     selectedFile: event.target.files,
   });
	}


	onSubmission() {
    this.props.api.post('/api/inventory/import', this.state.selectedFile)
      .then(function(response) {
        if (response.data.error) {
					console.log(response.data.error);
          alert(response.data.error.errmsg);
        } else {
          this.props.callback()
          alert("items added successfully");
          this.clearForm();
        }
      }.bind(this))
      .catch(function(error) {
        console.log("fail");
        console.log(error);
      }.bind(this));
  }

	clearForm() {
    this.setState({
      selectedFile: null,
      name: "",
      preview: "",
    })
  }

}

export default BulkImportButton
