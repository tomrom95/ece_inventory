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
			var value = elems[i];
			if (value.length === 0 || value === "undefined") 
				value = "N/A";
			htmlList.push(<td className="subtable-row" key={columnTag}> {value} </td>);
		}
		return htmlList;
	}

	makeButton() {
			if(this.props.buttons){
				return(<div>{this.props.buttons}</div>);
			}
			return (<RequestPopup
						data={[ {
									Serial: "N/A",
									Condition: "N/A",
									Status: "N/A",
									Quantity: this.props.data[4]
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
    			popupRef.update(tableData);
  			});
	}

	componentDidMount() {
		this.loadData();
	}

}

export default SubtableRow
