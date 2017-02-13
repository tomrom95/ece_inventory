import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
import ShoppingCartItem from './components/inventory/ShoppingCartItem.js';
import './index.css';
import 'react-select/dist/react-select.css';

ReactDOM.render(<App />,
	document.getElementById('root')
);
 
// (<ShoppingCartItem Name={"Oscilloscope"} Model={"Unknown"} Vendor={"Agilent"} Quantity={10} />