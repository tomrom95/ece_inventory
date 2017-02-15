import React, { Component } from 'react';

const statuses = ["PENDING", "APPROVED", "FULFILLED", "DENIED"];

class StatusFilterBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      requests: this.props.requests
    }
  }

  componentWillMount() {

  }



  filterButton() {
    var status = this.refs.status.value;
    this.props.filterRequests(status);
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
                        <input className="form-control" type="text" defaultValue="" ref="status" id="name-field"/>
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
