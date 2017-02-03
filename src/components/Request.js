import React, { Component } from 'react';
import { RouteHandler, Link } from 'react-router';
import SubtableRow from '../SubtableRow.js';
import '../App.css';

class Request extends Component {
  constructor(props){
    super(props);
    this.state = {
			data: this.props.data
		}
  }
  render() {

    return (
      <tr key={this.state.data[0]}>
        {this.makeList(this.state.data)}
      </tr>
    );

  }
  makeList(elems) {
		var i;
		var htmlList = [];
		for (i=0; i<elems.length; i++) {
			// column tag is used as key. It is a tag for each column cell rendered.
			// Required for React DOM.
			var columnTag = this.state.data[6]._id + "-" + this.state.data[6].name + "-" + i;
			htmlList.push(<td className="subtable-row" key={columnTag}> {elems[i]} </td>);
		}
		return htmlList;
	}

  




}

export default Request;
