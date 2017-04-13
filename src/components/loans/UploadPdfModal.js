import React, { Component } from 'react';
import '../../App.css';

class UploadPdfModal extends Component {

  render() {
    return (
      <div>
        <button type="button"
          className="btn btn-sm btn-secondary"
          data-toggle="modal"
          data-target={"#uploadPdf-"+this.props.item_id}>
          Request Backfill
        </button>

        <div className="modal fade"
          id={"uploadPdf-"+this.props.item_id}
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
                            <input className="btn btn-sm btn-secondary inputfile" type="file" name="uploadPDF" />
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
                <button type="button" 
                        className="btn btn-secondary" 
                        data-dismiss="modal"
                        onClick={() => this.props.submitBackfillRequest()}>
                        Make Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UploadPdfModal;
