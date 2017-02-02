import React, { Component } from 'react';
import './App.css';
import RequestPopup from './RequestPopup.js';

class SubtableRow extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: this.props.data
		}
	}

	render() {
		return (
			<tr>
				{this.makeList(this.state.data)}
				{this.makeButton()}
			</tr>
		);
	}

	makeList(elems) {
		var i;
		var htmlList = [];
		for (i=0; i<elems.length; i++) {
			var columnTag = this.props.idTag + "-" + i;
			htmlList.push(<td className="subtable-row" key={columnTag}> {elems[i]} </td>);
		}
		return htmlList;
	}

	makeButton() {
			return (<RequestPopup
						data={[ {
									Serial: "", 
									Condition: "", 
									Status: "",
									Quantity: ""
								}
							]}
						itemName={this.props.data[0]} 
						modelName={this.props.data[1]}
						itemId={this.props.idTag}
						api={this.props.api}
						ref={this.props.idTag}/>);
	}

	loadData() {
		var tableData;
		var id = this.props.idTag;
		var popupRef = this.refs[this.props.idTag];
		this.props.api.get("api/inventory/" + id)
			.then(function (response) {
    			tableData = response.data.instances;
    			//console.log(tableData);
    			popupRef.update(tableData);
  			});
	}

	componentDidMount() {
		this.loadData();
	}

}

export default SubtableRow