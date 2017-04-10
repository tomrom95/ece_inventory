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
        "Description": obj.description,
        "Quantity": obj.quantity,
        "Vendor": obj.vendor_info,
        "Tags": obj.tags,
        "custom_fields": obj.custom_fields,
        "meta": {
          "id": obj._id,
          "isAsset": obj.is_asset
        }
      };
      items.push(item);
    }
    return items;
  }

  render() {
    var url = "api/inventory/";
    var table = InventoryTable;
    return (
        <div>
          <PaginationContainer
              url={url}
              processData={data => this.processData(data)}
              renderComponent={table}
              showFilterBox={true}
              showStatusFilterBox={false}
              hasOtherParams={false}
              id={'inventory-page'}
              rowsPerPage={15} />

          </div>);

  }
}

export default Inventory;
