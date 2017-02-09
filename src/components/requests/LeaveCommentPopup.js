import React, { Component } from 'react';
import Modal from 'react-modal';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};


class LeaveCommentPopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: false,
      value: ""
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.commentRequest = this.commentRequest.bind(this);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.refs.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    return (
      <div>
        <button className="btn btn-primary btn-sm" onClick={this.openModal}>Leave Comment</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}

          style={customStyles}
          contentLabel="Example Modal"
        >

          <h2 ref="subtitle">Please leave a brief explanation</h2>


          <form>
            <input type="text" value={this.state.value} onChange={this.handleChange}/>
            <button onClick={this.commentRequest}>Save</button>
            <button onClick={this.closeModal}>Cancel</button>
          </form>
        </Modal>
      </div>
    );
  }


  commentRequest() {
    this.props.api.put('/api/requests/' + this.props.request,
      {
        reviewer_comment: this.state.value,
      }
    )
    .then(function(response) {
      if(response.data.error){
        console.log("error denying request");
      }
      else{

        console.log(response);
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }
  }

export default LeaveCommentPopup
