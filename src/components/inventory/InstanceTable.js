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
    var subcolumnkeys = [];
    //columnKeys.push(<th key={"tag-key"}> Item Name </th>);
    columnKeys.push(<th key={"item-key"}> Asset Tag </th>);
    var keys = ['Tag'];
    var allCustomFields = this.state.data[0].allCustomFields;
  //  for(var i = 0; i < allCustomFields.length; i++){
    //  keys.push(allCustomFields[i].name);
    //  subcolumnKeys.push(<th key={allCustomFields[i]._id+"-key"}> {allCustomFields[i].name} </th>);
//    }
    //console.log(this.state.data);
    var instances = [];
    for(var i = 0; i < this.state.data.length; i++){
			var subrows = [];

      var instance = this.state.data[i];
			var id = instance._id;
      var rowData = (
				<tr
					data-toggle="collapse"
					data-parent="#accordion"
					href={"#instance-collapse-"+id}
					aria-expanded="true"
					key={id+"-row"}
					>
					<td className="subtable-row" key={id+"-tag-key"}>{instance.Tag}</td>
				</tr>
			);
			subrows.push(
				<tr key={instance.Tag+"-header"}>
					<td key={instance.Tag+"-custom_fields"} > FIELD </td>
					<td key={instance.Tag+"-values"} > VALUE </td>
				</tr>
			);
      for(var j = 0; j < allCustomFields.length; j++){
        //rowData.push(instance[allCustomFields[j].name]);
				if(allCustomFields[j].perInstance){
					subrows.push(
	          <tr key={instance.Tag+"-"+i+"-row-key-"+j}>
	            <td key={instance.Tag+"-"+i+"-name-key-"+j} >{allCustomFields[j].name} </td>
	            <td key={instance.Tag+"-"+i+"-value-key-"+j} >{instance[allCustomFields[j].name]}</td>
	          </tr>
	        );
				}

      }
      instances.push(rowData);
      instances.push(
        <tbody id={"instance-collapse-"+id} className="collapse" role="tabpanel" key={id+"-subrows"}>
          {subrows}
        </tbody>

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
