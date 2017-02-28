import React, { Component } from 'react';
import Select from 'react-select';
import UserSelect from '../user/UserSelect.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import '../../App.css';

const statuses = [
    { value: 'ITEM_EDITED', label: 'Item Edits' },
    { value: 'ITEM_CREATED', label: 'Item Creations' },
    { value: 'ITEM_DELETED', label: 'Item Deletions' },
    { value: 'REQUEST_DISBURSED', label: 'Request Disbursals' },
    { value: 'REQUEST_CREATED', label: 'Request Creations' },
    { value: 'REQUEST_EDITED', label: 'Request Edits' }
];

class LogFilterBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: null,
      itemName: null,
      timespan: null,
      type: null,
      dateFocused: false,
      startDate: null,
      endDate: null
    }
  }

  applyFilter() {
    var userId = this.state.user;
    var itemName = this.refs.itemName.value;
    var actionType = this.state.type;
    var startDate = encodeURIComponent(moment(this.state.startDate).format());
    var endDate = encodeURIComponent(moment(this.state.endDate).endOf('day').format());

    this.props.filterRequests(actionType, userId, itemName, startDate, endDate);
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

  handleStartDateChange(dateObj) {
    this.setState({
      startDate: dateObj
    });
  }


  handleEndDateChange(dateObj) {
    this.setState({
      endDate: dateObj
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
                          placeholder="Choose action type"
                          options={statuses}
                          onChange={val => this.handleTypeChange(val)} />
                      </div>
                      <div className="form-group row">
                        <label>User</label>
                        <UserSelect callback={id => this.handleUserChange(id)} ref="userSelectBox" api={this.props.api}/>
                      </div>
                      <div className="form-group row">
                          <label>Item Name</label>
                          <input className="form-control" type="text" defaultValue="" ref="itemName"/>
                      </div>

                      <div className="form-group row">
                        <label>Start Date</label>
                        <DatePicker
                            className="form-control"
                            selected={this.state.startDate}
                            onChange={date => this.handleStartDateChange(date)} />
                      </div>

                      <div className="form-group row">
                        <label>End Date</label>
                          <DatePicker
                            className="form-control"
                            selected={this.state.endDate}
                            onChange={date => this.handleEndDateChange(date)} />

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

export default LogFilterBox;
