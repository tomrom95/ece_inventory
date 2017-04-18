import React, { Component } from 'react';
import '../../App.css';

class UploadPdfModal extends Component {

  constructor(props) {
    super(props);
    this.state = props;
  }

  componentWillReceiveProps(newProps) {
    this.setState(newProps);
  }

  render() {
    var isFirstTime = this.state.type === "firsttime";
    return (
      <div className="loantable-button">
        <button type="button"
          className="btn btn-sm btn-secondary"
          data-toggle="modal"
          data-backdrop="static" 
          data-keyboard="false"
          data-target={"#uploadPdf-"+this.state.item_id+"-"+this.state.loan_id}>
          {isFirstTime ? "Request Backfill" : "Re-upload Attachment"}
        </button>

        <div className="modal fade"
          id={"uploadPdf-"+this.state.item_id+"-"+this.state.loan_id}
          tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editLabel">Upload a PDF</h5>
              </div>
              <div className="modal-body">
                <div className="container">
                  <div className="form-group container">
                    <div className="row">
                        <form ref='uploadForm'
                          id='uploadForm'
                          action= {'https://'+ location.hostname + '/upload/loan/' + this.props.loan_id + '/item/' + this.props.item_id}
                          target="_blank"
                          method='post'
                          encType="multipart/form-data">
                            <input className="btn btn-sm btn-secondary inputfile" 
                                   type="file" 
                                   accept="text/html,application/pdf,image/jpeg,image/gif,image/png"
                                   name="uploadPDF" />
                            <input className="btn btn-sm btn-primary" type='submit' value='Upload' />
                        </form>
                    </div>    
                  </div>

                  <div className="container">
                    <div className="row">
                      Note: You must click the Upload button after choosing a PDF in order to attach it.
                    </div>
                  </div>

                </div>
              </div>
              <div className="modal-footer">
                { isFirstTime ?
                  (<button type="button" 
                          className="btn btn-secondary" 
                          data-dismiss="modal"
                          onClick={() => this.props.submitBackfillRequest()}>
                          Submit Request
                  </button>) : 
                  (<button type="button" 
                          className="btn btn-secondary" 
                          data-dismiss="modal"
                          onClick={() => this.props.reloadTableCallback()}>
                          Close
                  </button>)
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UploadPdfModal;
