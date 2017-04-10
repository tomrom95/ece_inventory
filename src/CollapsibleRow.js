import React, { Component } from 'react';
import './App.css';
import TableRow from './components/inventory/TableRow.js';

class CollapsibleRow extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			itemName: props.itemName
		}
	}

	componentWillReceiveProps(newProps){
		this.state = {
			data: newProps.data,
			itemName: newProps.itemName
		}
	}

	makeAssetKeys(rowData){
		var keys = ["Name", "Model", "Quantity", "Vendor"];
		var name = rowData[0];
		var list = [];
		for (var i=0; i<keys.length; i++) {
			var columnTag = "asset-name-" + rowData[0] + " " + i;
			var value = rowData[i];
			if (value.length === 0 || value === "undefined")
				value = "N/A";
				list.push(
					<td	className="subtable-row"	key={columnTag}>
						{value}
					</td>);
		}
		return list;

	}
	makeRows() {
		var i;
		var list = [];
		var instances = [["test", "123"]];
		var keys = ["Name", "Model", "Quantity", "Vendor"];
		for (var i=0; i<instances.length; i++) {
			var elem;
			elem = (<TableRow
					columnKeys={keys}
					data={instances[i]}
					idTag={"testasset" + i}
					row={i}
					key={"asset-instance-" + "testasset" + " " + i}
					api={this.props.api}
					callback={this.props.callback}/>);
			list.push(elem);
		}
		return list;
	}



	render() {
		return (

				<tr	className="accordion-toggle"	data-toggle="collapse"	data-target="#testasset">
					{this.makeAssetKeys(this.props.data)}
					<td className="row instance-table accordion-body collapse" id="testasset">
						<table className="table table-sm maintable-body">
							<tbody>
								{this.makeRows()}
							</tbody>
						</table>
					</td>
		    </tr>


		);
	}

}

export default CollapsibleRow
