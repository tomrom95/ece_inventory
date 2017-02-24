import React, { Component } from 'react';
import '../../App.css';
import InventoryTable from './InventoryTable.js';
import PaginationContainer from '../global/PaginationContainer.js'

class Inventory extends Component {

  processData(responseData) {
    var inventoryItems = responseData.data;
    var i;
    var items = [];
    for (i=0; i<inventoryItems.length; i++) {
      var obj = inventoryItems[i];
      var item = {
        "Name": obj.name,
        "Model": obj.model_number,
        "Location": obj.location,
        "Description": obj.description,
        "Quantity": obj.quantity,
        "Vendor": obj.vendor_info,
        "Tags": obj.tags,
        "Custom Fields": obj.custom_fields,
        "meta": {
          "id": obj._id,
          "hasInstanceObjects": obj.has_instance_objects
        }
      };
      items.push(item);
    }
    return items;
  }

  render() {
    var url = "api/inventory/";
    var table = InventoryTable;

    return (<PaginationContainer
            url={url}
            processData={data => this.processData(data)}
            renderComponent={table}
            showFilterBox={true}
            showStatusFilterBox={false}
            hasOtherParams={false}
            id={'inventory-page'}
            rowsPerPage={10} />);

  }
}

export default Inventory;
