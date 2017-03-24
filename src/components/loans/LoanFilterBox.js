import React, { Component } from 'react';
import Select from 'react-select';
import UserSelect from '../user/UserSelect.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import '../../App.css';

const statuses = [
    { value: 'OUTSTANDING', label: 'Outstanding' },
    { value: 'COMPLETE', label: 'Complete' }
];

class LoanFilterBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: null,
      itemName: null,
      type: null,
      showUserBox: props.showUserBox
    }
  }

  applyFilter() {
    var userId = this.state.user;
    var itemName = this.refs.itemName.value;
    var actionType = this.state.type;

    this.props.filterRequests(actionType, userId, itemName);
  }

  handleTypeChange(value) {
    this.setState({
      type: value
    });
  }

  handleUserChange(id) {
    this.setState({
      user: id
    });
  }

  render() {
    return(
          <div id="accordion" role="tablist" aria-multiselectable="true">
            <div className="card filterbox">
              <div className="card-header" role="tab" id="headingOne">
                <h5 className="mb-0">
                  <div data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    <span className="fa fa-search"></span>
                  </div>
                </h5>
              </div>

              <div id="collapseOne" role="tabpanel" aria-labelledby="headingOne">

                <div className="card-block">
                  <div className="form-fields">
                      <div className="form-group row">
                        <label>Type</label>
                        <Select
                          simpleValue
                          value={this.state.type}
                          placeholder="Choose status"
                          options={statuses}
                          onChange={val => this.handleTypeChange(val)} />
                      </div>

                      {this.state.showUserBox === true ?
                        (<div className="form-group row">
                          <label>User</label>
                          <UserSelect callback={id => this.handleUserChange(id)} ref="userSelectBox" api={this.props.api}/>
                        </div>) : null 
                      }

                      <div className="form-group row">
                          <label>Item Name</label>
                          <input className="form-control" type="text" defaultValue="" ref="itemName"/>
                      </div>

                      <div className="row">
                        <button
                          className="btn btn-primary"
                          onClick={() => this.applyFilter()}>
                            Filter
                        </button>
                      </div>

                  </div>
                </div>

                </div>
              </div>
            </div>
        );
  }

}

export default LoanFilterBox;
