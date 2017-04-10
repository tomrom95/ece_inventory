import React, { Component } from 'react';
import '../../App.css';
import TableRow from './TableRow.js';


class InstanceTable extends Component {

	constructor(props) {
		super(props);
		this.state = {
      data: props.data,
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
      data: newProps.data,
		});
	}



	render() {

    var columnKeys = [];
    columnKeys.push(<th key={"tag-key"}> Item Name </th>);
    columnKeys.push(<th key={"item-key"}> Tag </th>);
    var keys = ['Item Name', 'Tag'];
    var allCustomFields = this.state.data[0].allCustomFields;
    for(var i = 0; i < allCustomFields.length; i++){
      keys.push(allCustomFields[i].name);
      columnKeys.push(<th key={allCustomFields[i]._id+"-key"}> {allCustomFields[i].name} </th>);
    }

    var instances = [];
    for(var i = 0; i < this.state.data.length; i++){
      var instance = this.state.data[i];
      var rowData = [instance.item.name, instance.Tag];
      for(var j = 0; j < allCustomFields.length; j++){
        rowData.push(instance[allCustomFields[j].name]);
      }
      var id = instance._id;

      instances.push(
        <TableRow
  					columnKeys={keys}
  					data={rowData}
  					idTag={"instance-"+id}
  					row={i}
  					key={id+"-row"}
  					api={this.props.api}
            inventory_buttons={[]}
  					callback={this.props.callback}/>
      );

    }


    return(
      <div className="row maintable-container">
        <table className="table table-sm maintable-body">
          <thead className="thread">
            <tr>
              {columnKeys}
            </tr>
          </thead>
          <tbody>
            {instances}
          </tbody>
        </table>
      </div>
    );
	}


}


export default InstanceTable
