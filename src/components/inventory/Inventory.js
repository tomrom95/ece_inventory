import React, { Component } from 'react';
import '../../App.css';
import InventorySubTable from './InventoryTable.js';
import PaginationContainer from '../global/PaginationContainer.js'
import axios from 'axios';

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
    var table = InventorySubTable;

    return (<PaginationContainer 
            url={url}
            processData={data => this.processData(data)}
            renderComponent={table} />);

  }
}

export default Inventory;
