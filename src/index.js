import React from 'react';
import ReactDOM from 'react-dom';
import InventorySubTable from './InventorySubTable.js';
import ItemWizard from './ItemWizard.js';
import App from './App.js';
import './index.css';
import axios from 'axios';


ReactDOM.render(<App />, 
	document.getElementById('root')
	);

ReactDOM.render(<ItemWizard 
		data={
			{"Name": "michael", "Model Name": "", "Description": "", "Location": "", "Tags": "", "Quantity": ""}
		}/>, 
	document.getElementById('test')
	);

