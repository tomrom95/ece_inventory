import React, { Component } from 'react';
import '../App.css';

class ErrorMessage extends Component {

	constructor(props) {
		console.log("Created!");
		super(props);
		this.state = {
			title: this.props.title,
			message: this.props.message,
			hidden: this.props.hidden
		}
	}

	componentWilLReceiveProps(newProps) {
		this.setState({
			title: newProps.title,
			message: newProps.message,
			hidden: newProps.hidden
		});
	}

	render() {
		console.log("error message rendering!");
		if (this.state.hidden === true) {
			return <div></div>;
		}

		return(
			<div className="alert alert-danger alert-dismissable fade show" role="alert">
			  	<button type="button" className="close" data-dismiss="alert" aria-label="Close">
    				<span aria-hidden="true">&times;</span>
  				</button>
	  			<strong>{this.state.title}</strong> {this.state.message}
			</div>
		);
	}
}

export default ErrorMessage;