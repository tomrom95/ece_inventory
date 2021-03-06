import React, { Component } from 'react';
import '../../App.css';
import GlobalRequests from './GlobalRequests.js';

class SingleRequestView extends Component {

	constructor(props) {
		super(props);
		this.state = {
			id: props.id,
			requestId: props.requestId,
			activated: false
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			id: newProps.id,
			requestId: newProps.requestId
		});
	}

	render() {
		var request = this.state.activated ? 
							<GlobalRequests
		            			notPaginated={true}
								showFilterBox={false}
								showStatusFilterBox={false}
								hasOtherParams={false}
								requestId={this.state.requestId}/> : null;
		return (
			<div>
	        	<a data-toggle="modal"
	        		href="#"
		          	data-target={"#logRequestItem-"+this.state.id}
		          	onClick={() => this.setState({activated: true})} >
		            View Request
		        </a>

		        <div className="modal fade"
		              id={"logRequestItem-"+this.state.id}
		              tabIndex="-1"
		              role="dialog">
		            <div className="modal-dialog" role="document">
		              <div className="modal-content single-request-pageview">
		              	<div className="modal-header">
		              		<h6 className="modal-title">Request Details</h6>
		              	</div>
		                <div className="modal-body single-request-item">
		                	{request}
		                </div>

		              </div>
		            </div>
		        </div>
	        </div>
        );
	}
}

export default SingleRequestView;