import React, { Component } from 'react';
import axios from 'axios';
import UserSelect from './UserSelect.js';
import UserProfile from './UserProfile.js';
import '../../App.css';

class EditUsers extends Component {

	constructor(props) {
		super(props);
		this.state = {
			userIdSelected: null,
			usernameSelected: null,
			roleSelected: null,
			actualRole: null,
			applyButtonVisible: false
		}
	}

	componentWillMount() {
		this.makeAPI();
	}

	makeAPI() {
		this.instance = axios.create({
		  baseURL: 'https://' + location.hostname + ':3001',
		  headers: {'Authorization': localStorage.getItem('token')}
		});
	}

	makeUserSelectDropdown() {
		return (
			<UserSelect callback={id => this.handleUserChange(id)} ref="userSelectBox" api={this.instance}/>
		);
	}

	makeRoleSelectDropdown() {
		if (this.state.usernameSelected === null) {
			return null;
		}
		else return (
	      <select onChange={e=>this.handleRoleChange(e)} 
	      		value={this.state.roleSelected} 
	      		id={"role-field"} 
	      		className="form-control" 
	      		ref="role">
	        <option>STANDARD</option>
	        <option>MANAGER</option>
	        <option>ADMIN</option>
	      </select>
	    );
  	}

  	makeApplyButton() {
  		if (this.state.applyButtonVisible === true) {
  			return (
				<button type="button"
		          className="btn btn-primary cart-update-button"
		          onClick={() => this.applyEdits()}>
		            Apply
	    		</button>
  			);
  		} 
  		else return null;
  	}

  	makeCancelButton() {
  		if (this.state.applyButtonVisible === true) {
  			return (
				<button type="button"
		          className="btn btn-danger cart-update-button"
		          onClick={() => this.cancelEdits()}>
		            Cancel
	    		</button>  				
  			);
  		}
  		return null;
  	}

  	makeUserProfile() {
  		if (this.state.usernameSelected!==null)
  			return (<UserProfile username={this.state.usernameSelected} role={this.state.actualRole}/>);
  	}

	handleUserChange(id) {
		this.instance.get('api/users/'+id)
		.then (function (response) {
			if (response.data.error) {
				console.log(response.data.error);
				alert(response.data.error);
				return;
			}
			this.setState({
				userIdSelected: id,
				usernameSelected: response.data.username,
				roleSelected: response.data.role,
				actualRole: response.data.role
			});
		}.bind(this));
		this.hideButtons();
	}

  	applyEdits() {
  		var params = {role: this.state.roleSelected};
  		if (JSON.parse(localStorage.getItem('user'))._id === this.state.userIdSelected) {
  			alert("Editing own privileges is disabled.");
  			this.cancelEdits();
  			return;
  		}

  		this.instance.put('/api/users/'+this.state.userIdSelected, params)
  		.then(function (response) {
  			if (response.data.error) {
  				alert(response.data.error);
  				return;
  			}
  			this.setState({
  				actualRole: response.data.role,
  				applyButtonVisible: false
  			});
  		}.bind(this));
  	}

  	cancelEdits() {
  		var id = this.state.userIdSelected;
		this.instance.get('api/users/'+id)
		.then (function (response) {
			if (response.data.error) {
				console.log(response.data.error);
				alert(response.data.error);
				return;
			}
			this.setState({
				userIdSelected: id,
				usernameSelected: response.data.username,
				roleSelected: response.data.role,
				applyButtonVisible: false
			});
		}.bind(this));
  	}

  	hideButtons() {
  		this.setState({
  			applyButtonVisible: false
  		});
  	}

	handleRoleChange(event) {
		this.setState({
			roleSelected: event.target.value,
			applyButtonVisible: true
		});
	}

	render() {
		return ( 
			<div className="container">
				<div className="row form-group">
					<h3>Edit User Credentials</h3>
				</div>
				<div className="row">
					<div className="col-md-8">
						<div className="row">
							{this.makeUserSelectDropdown()}
						</div>
						<div className="row">
							{this.makeRoleSelectDropdown()}
						</div>
						<div className="row">
							<div className="col-xs-6">
								{this.makeApplyButton()}
							</div>
							<div className="col-xs-6">
								{this.makeCancelButton()}
							</div>
			            </div>
					</div>
					<div className="col-md-4">
						{this.makeUserProfile()}
					</div>
				</div>
			</div>
		);
	}

}

export default EditUsers;