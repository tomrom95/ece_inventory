import React, { Component } from 'react';
import '../../App.css';

class ErrorMessage extends Component {

	constructor(props) {
		super(props);
		this.state = {
			title: this.props.title,
			message: this.props.message,
			hidden: this.props.hidden,
			interval: null
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			title: newProps.title,
			message: newProps.message,
			hidden: newProps.hidden
		});
	}

	hideError() {
		this.setState({
			hidden: true
		}, function() {
			clearInterval(this.state.interval);
			this.setState({
				interval: null
			});
			this.props.hideFunction();
		}.bind(this));
	}

	render() {
		if (this.state.hidden === true) {
			return null;
		}

		if (this.state.hidden === false && this.state.interval === null) {
			this.state.interval = setInterval(function() {
				this.hideError();
			}.bind(this), 1500);
		}

		return(
			<div className="alert alert-danger alert-dismissable fade show error-box" role="alert">
			  	<button onClick={() => this.hideError()} type="button" className="close" data-dismiss="alert" aria-label="Close">
    				<span aria-hidden="true">&times;</span>
  				</button>
	  			<strong>{this.state.title}</strong> {this.state.message}
			</div>
		);
	}
}

export default ErrorMessage