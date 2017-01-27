import React, { Component } from 'react';
import '../App.css';
import NavBar from './NavBar.js';
var list = require('react-simple-list');

function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    <li key={number.toString()}>
      {number}
    </li>
  );
  return (
    <ul>{listItems}</ul>
  );
}

const numbers = [1, 2, 3, 4, 5];

class CurrentOrders extends Component {
	render(){
		return(
			<div>
				<NavBar />,
				<NumberList numbers={numbers} />
			</div>
		);
	}
}

export default CurrentOrders;
