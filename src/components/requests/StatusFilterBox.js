import React, { Component } from 'react';
import Select from 'react-select';


const statuses = [
    { value: 'PENDING', label: 'PENDING' },
    { value: 'APPROVED', label: 'APPROVED' },
    { value: 'FULFILLED', label: 'FULFILLED' },
    { value: 'DENIED', label: 'DENIED' }];

class StatusFilterBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      status: "",
    }
  }

  componentWillMount() {

  }



  filterButton() {
    var status = this.state.status;
    this.props.filterRequests(status);
  }

  handleChange(value) {
    this.setState({status: value});
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
                        <label htmlFor="model-field">Status</label>
                        <Select
                          multi
                          simpleValue
                          value={this.state.status}
                          placeholder="Choose status"
                          options={statuses}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="row">
                        <button
                          className="btn btn-primary"
                          onClick={this.filterButton.bind(this)}>
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

export default StatusFilterBox;
