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
      <tr>
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
      if(elems[i] != 'Status'){
  			var columnTag = this.state._id + "-" + this.state.user_id + "-" + i;
  			htmlList.push(<td className="subtable-row" key={columnTag}> {elems[i]} </td>);
      }
		}
    htmlList.push(<td className="subtable-row" key={this.state._id}> {elems.Status} </td>)
		return htmlList;
	}

  setStatus
}

export default Request;
