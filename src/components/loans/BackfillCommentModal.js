import React, { Component } from 'react';
import '../../App.css';

class BackfillCommentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined
    }
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    return (
      <div className="loantable-button">
        <button type="button"
          className="btn btn-sm btn-secondary"
          data-toggle="modal"
          data-target={"#backfillLeaveComment-"+this.props.loan_id}>
          Leave Note &nbsp;<span className="fa fa-comment-o"></span>
        </button>

        <div className="modal fade"
          id={"backfillLeaveComment-"+this.props.loan_id}
          tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editLabel">Leave a Comment</h5>
              </div>
              <div className="modal-body">
                <form className="container">
                  <div className="form-group row">
                    <input className="form-control" maxLength="200" type="text" value={this.state.value} onChange={e => this.handleChange(e)}/>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button onClick={() => this.commentRequest()} type="button" data-dismiss="modal" className="btn btn-primary">Submit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  commentRequest() {
    if (((this.state.value).trim()).length === 0) {
      alert("Comment cannot be blank.");
      return;
    }

    this.props.sendComment(this.state.value)();
  }

}

export default BackfillCommentModal;
