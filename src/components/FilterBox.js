import React, { Component } from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';

class FilterBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      allTags: [],
      excludedTags: [],
      requiredTags: []
    }
  }

  componentWillMount() {
    this.props.api.get('/api/inventory/tags')
      .then(function(response) {
        if (response.error) {
          console.log(response.error);
        }
        console.log("FILTER BOX");
        console.log(response.data);
        this.setState({allTags: response.data});
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      });
  }

  filterButton() {
    var name = this.refs.name.value;
    var modelNumber = this.refs.model.value;
    this.props.filterItems(name, modelNumber, this.state.requiredTags, this.state.excludedTags);
  }

  handleRequiredChange(selected) {
    this.setState({requiredTags: selected});
  }

  handleExcludedChange(selected) {
    this.setState({excludedTags: selected});
  }

  render() {
    return(
          <div id="accordion" role="tablist" aria-multiselectable="true">
            <div className="card filterbox">
              <div className="card-header" role="tab" id="headingOne">
                <h5 className="mb-0">
                  <div data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    <span className="fa fa-search"></span>
                  </div>
                </h5>
              </div>

              <div id="collapseOne" className="collapse show" role="tabpanel" aria-labelledby="headingOne">

                <div className="card-block">
                  <div className="form-fields">

                        <div className="form-group row">
                          <label htmlFor="name-field">Name</label>
                          <input className="form-control" type="text" defaultValue="" ref="name" id="name-field"/>
                        </div>


                        <div className="form-group row">
                          <label htmlFor="model-field">Model</label>
                          <input className="form-control" type="text" defaultValue="" ref="model" id="model-field"/>
                        </div>

                        <div className="form-group row">
                          <label htmlFor="model-field">Require Tags</label>
                            <Typeahead
                              clearButton
                              labelKey="tag"
                              multiple
                              options={this.state.allTags}
                              onChange={this.handleRequiredChange.bind(this)}
                              placeholder="Choose tags"
                            />
                        </div>

                        <div className="form-group row">
                          <label htmlFor="model-field">Exclude Tags</label>
                            <Typeahead
                              clearButton
                              labelKey="name"
                              multiple
                              options={this.state.allTags}
                              onChange={this.handleExcludedChange.bind(this)}
                              placeholder="Choose tags"
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

export default FilterBox;
