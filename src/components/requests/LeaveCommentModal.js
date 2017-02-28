import React, { Component } from 'react';
import '../../App.css';

class LeaveCommentModal extends Component {
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
      <div>
        <button type="button"
          className="btn btn-sm btn-primary"
          data-toggle="modal"
          data-target={"#leaveComment-"+this.props.id}>
          Comment
        </button>

        <div className="modal fade"
          id={"leaveComment-"+this.props.id}
          tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editLabel">Leave a Comment</h5>
              </div>
              <div className="modal-body">
                <form>
                <div className="form-group row">
                  <label>Comment:</label>
                  <input className="form-control" maxLength="200" type="text" value={this.state.value} onChange={e => this.handleChange(e)}/>
                </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => console.log("")} className="btn btn-secondary" data-dismiss="modal">Cancel</button>
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
    
    this.props.api.put('/api/requests/' + this.props.request, {reviewer_comment: this.state.value})
    .then(function(response) {
      if(response.data.error){
        alert(response.data.error);
      }
      else {
        this.props.callback();
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));
  }

}

export default LeaveCommentModal;
