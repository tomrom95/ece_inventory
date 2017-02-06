import React, { Component } from 'react';
import './App.css';
import ItemWizard from './ItemWizard.js';
import ItemDetailView from './components/ItemDetailView.js';

function getPrefill(data) {
	return ({
		"Name": data[0],
		"Quantity": data[1],
		"Model Number": data[2],
		"Description": data[3],
		"Location": data[4],
		"Tags": data[5]
	});
}


class SubtableRow extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: this.props.data
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			data: newProps.data
		});
	}

	render() {
		return (
			<tr>
				{this.makeList(this.state.data)}


				<td> {this.makeButtons()} </td>
				<td> <ItemDetailView params={{itemID: this.props.idTag}} /> </td>
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

	makeButtons() {
			if(this.props.request_buttons){
				return(<td>{this.props.request_buttons}</td>);
			}
			else if(this.props.inventory_buttons){
				return (<td>{this.props.inventory_buttons}</td>);

			}

	}



	/*

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
<<<<<<< HEAD

	componentWillReceiveProps(nextProps){
		this.setState({
			data: nextProps.data
		});
	}

=======
	*/
	makeEditButton() {
		if (JSON.parse(localStorage.getItem('user')).is_admin === true) {
			return this.props.buttons;
		}
	}
	makeDeleteButton(id) {
		if (JSON.parse(localStorage.getItem('user')).is_admin === true) {
			return (
				<button onClick={()=>{this.deleteItem(this.props.idTag)}}
					type="button"
					className="btn btn-danger delete-button">
					<span className="fa fa-remove"></span>
				</button>
			);
		}
	}

	deleteItem(id) {
		this.props.api.delete('api/inventory/' + id)
		.then(function(response) {
			this.props.callback(true);
		}.bind(this));
	}
}

export default SubtableRow
