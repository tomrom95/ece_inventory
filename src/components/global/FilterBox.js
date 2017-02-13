import React, { Component } from 'react';
import TagSelector from './TagSelector';

class FilterBox extends Component {
  constructor(props){
    super(props);
  }

  componentWillMount() {
    this.loadData();
  }

  loadData() {
    this.props.api.get('/api/inventory/tags')
    .then(function(response) {
        if (response.error) {
          console.log(response.error);
        }
        var data = response.data.map(function(tag) {
          return {label: tag, value: tag}
        });
        this.setState({allTags: data});
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      });
  }

  filterButton() {
    var name = this.refs.name.value;
    var modelNumber = this.refs.model.value;
    var required = this.refs.required.getSelectedTags();
    var excluded = this.refs.excluded.getSelectedTags();
    this.props.filterItems(name, modelNumber, required, excluded);
  }

  handleRequiredChange(value) {
    this.setState({requiredTags: value});
  }

  handleExcludedChange(value) {
    this.setState({excludedTags: value});
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
                          <label htmlFor="name-field">Name</label>
                          <input className="form-control" type="text" defaultValue="" ref="name" id="name-field"/>
                        </div>


                        <div className="form-group row">
                          <label htmlFor="model-field">Model</label>
                          <input className="form-control" type="text" defaultValue="" ref="model" id="model-field"/>
                        </div>

                        <div className="form-group row">
                          <label htmlFor="model-field">Require Tags</label>
                            <TagSelector
                              api={this.props.api}
                              disallowCustom={true}
                              ref="required"
                            />
                        </div>

                        <div className="form-group row">
                          <label htmlFor="model-field">Exclude Tags</label>
                            <TagSelector
                              api={this.props.api}
                              disallowCustom={true}
                              ref="excluded"
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
