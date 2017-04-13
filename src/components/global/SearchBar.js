import React, { Component } from 'react';

class SearchBar extends Component {

  constructor(props){
    super(props);
    this.state = {
      callback: props.callback
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      callback: newProps.callback
    });
  }

  onSearch() {
    var searchText = this.refs.searchField.value;
    this.state.callback(searchText);
  }

  render() {
    return (
      <div className="row page-control-bar instance-item-row">
        <div className="col-sm-8">
          <input
            type="text"
            className="form-control form-control-compact"
            defaultValue={this.state.tag}
            ref="searchField"
          />
        </div>
        <div className="col-sm-4">
          <button onClick={() => this.onSearch()} type="button" className="btn btn-sm btn-primary">
            <span className="fa fa-search"></span>
          </button>
        </div>
      </div>
    );
  }

}

export default SearchBar;
