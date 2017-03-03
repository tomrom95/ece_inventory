import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import FilterBox from './FilterBox.js';
import ErrorMessage from './ErrorMessage.js';
import StatusFilterBox from '../requests/StatusFilterBox.js';

var filterNames = ["name", "model_number", "required_tags", "excluded_tags", "status", "user"];

function validNumber(num) {
	if (!isNaN(num)) {
		return (num > 0);
	}
	return false;
}

function isWholeNumber(num) {
	if (!validNumber(num)) {
		return "Not a valid number!";
	}
	else {
		if (Number(num) !== parseInt(num)) {
			return "Please input a whole number!";
		}
		else return true;
	}
}

class PaginationContainer extends Component {

	/*
		Props contain:
			- component that will be rendered
			- extraProps that aren't common among all components that are renderd by this class
			- data processing method to feed the component.
			- URL to query for items
	*/

	constructor(props) {
		super(props);
		this.state = {
			items: [],
			initialLoad: true,
			page: 1,
			rowsPerPage: 5,
			pageBox: 1,
			errorHidden: true,
			error: {
				title: "",
				message: ""
			},
  		filters: {
        name: "",
        model_number: "",
        excluded_tags: "",
        required_tags: "",
				status: "",
				user: props.user,
  		},
  		url: props.url,
  		processData: props.processData,
  		renderComponent: props.renderComponent,
  		showFilterBox: props.showFilterBox,
			showStatusFilterBox: props.showStatusFilterBox,
  		id: props.id,
  		hasOtherParams: props.hasOtherParams,

		};

		if (props.rowsPerPage)
			this.state.rowsPerPage = props.rowsPerPage
	}

	componentWillReceiveProps(newProps) {
		var oldUrl = this.state.url;
		this.setState({
			url: newProps.url,
			processData: newProps.processData,
			renderComponent: newProps.renderComponent,
			showFilterBox: newProps.showFilterBox,
			id: newProps.id,
			hasOtherParams: newProps.hasOtherParams
		}, function() {
			 /*
				 Only case, it seems, where new props would lead to a rerender.
				 I have to re-evaluate that statement. But for now this fixes
				 a big bug.
			 */
			if (oldUrl !== newProps.url)
				this.loadData(this.state.page, false);
		});
	}

	componentWillMount() {
		this.instance = axios.create({
		  baseURL: 'https://' + location.hostname,
		  headers: {'Authorization': localStorage.getItem('token')}
		});
		this.loadData(1, false);
	}

	loadData(page, justDeleted) {
	  this.instance.get(this.getURL(page, this.state.rowsPerPage))
	  .then(function (response) {
	    if (this.state.initialLoad) {
	      this.setState({initialLoad: false});
	    }
	    // reponse is empty:
	    if (response.data.length === 0) {
	      if (page === 1) {
	        this.setState({items: []});
	      } else {
	        this.setState({
	        	pageBox: this.state.page
	        });
	        if (justDeleted === true) {
	        	this.previousPage();
	        }
	        else {
	        	this.renderError('', "Page does not exist!");
	        }
	      }
	    }
	    // response not empty:
	    else {
	      this.setState({
	        items: this.state.processData(response),
	        page: page
	      });

	      this.setState({
	      	pageBox: page
	      });
	    }
	  }.bind(this));
	}

	previousPage() {
		var prevPage = this.state.page -1;
		if (Number(prevPage) <= 0) {
			return;
		}
		this.loadData(this.state.page - 1, false);
	}

	nextPage() {
		this.loadData(this.state.page + 1, false);
	}

	getURL(page, rowsPerPage) {
		var pageQuery = this.state.hasOtherParams ? '&page=' : '?page=';
		var url = this.state.url
		  + pageQuery + page
		  +'&per_page='+rowsPerPage;

		filterNames.forEach(function(filterName) {
		  if (this.state.filters[filterName]) {
		    url += "&" + filterName + "=" + this.state.filters[filterName];
		  }
		}.bind(this));
		return url;
	}

	filterItems(name, modelNumber, requiredTags, excludedTags) {
	    this.setState({
	      page: 1,
	      filters: {
	        name: name,
	        model_number: modelNumber,
	        required_tags: requiredTags,
	        excluded_tags: excludedTags,
					status: "",
	      }
	    }, function () {
	      this.loadData(1, false);
	    });
  	}

	filterRequests(status){
		this.setState({
			page: 1,
			filters: {
				name: "",
				model_number: "",
				required_tags: "",
				excluded_tags: "",
				status: status,
			}
		}, function () {
			this.loadData(1, false);
		});
	}

	setRowCount(numRows) {
	  	this.state.rowsPerPage = numRows;
	  	this.loadData(1, false);
	}

	onPageTextEdit(event) {
		if (isWholeNumber(event.target.value) === true || event.target.value === "") {
			this.setState({
				pageBox: event.target.value
			});
		}
		else {
			this.setState({
				pageBox: this.state.page
			})
		}
	}

	makePageBox() {
    	return (
      	<input 
      		type="text"
      		onChange={e => this.onPageTextEdit(e)} 
      		value={this.state.pageBox} 
      		className="form-control pagenum-textbox" 
      		ref={"pageNum-"+this.state.id}
      		id={"pageNum-"+this.state.id}>
  		</input>
    	);
  	}

	makePageGoButton() {
		return(
		  <button type="button"
		    className="btn btn-primary"
		    onClick={e=> this.loadData(this.refs["pageNum-"+this.state.id].value, false)}>
		    GO
		  </button>
		);
	}

	renderError(title, message) {
	    this.setState({
	      errorHidden: false,
	      error: {
	        title: title,
	        message: message
	      }
	    });
	}

	makePerPageController() {
	    return(
	      <div className="btn-group">
	        <button type="button" className="btn btn-primary dropdown-toggle perpage-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	          {this.state.rowsPerPage + " results/page"}
	        </button>
	        <div className="dropdown-menu rowcount-dropdown">
	          <a onClick={()=>this.setRowCount(5)} className="dropdown-item" href="#">
	            {5}
	          </a>
	          <a onClick={()=>this.setRowCount(10)} className="dropdown-item" href="#">
	            {10}
	          </a>
	          <a onClick={()=>this.setRowCount(15)} className="dropdown-item" href="#">
	            {15}
	          </a>
	          <a onClick={()=>this.setRowCount(20)} className="dropdown-item" href="#">
	            {20}
	          </a>
	          <a onClick={()=>this.setRowCount(25)} className="dropdown-item" href="#">
	            {25}
	          </a>
	          <a onClick={()=>this.setRowCount(30)} className="dropdown-item" href="#">
	            {30}
	          </a>
	          <a onClick={()=>this.setRowCount(35)} className="dropdown-item" href="#">
	            {35}
	          </a>
	          <a onClick={()=>this.setRowCount(40)} className="dropdown-item" href="#">
	            {40}
	          </a>
	          <a onClick={()=>this.setRowCount(45)} className="dropdown-item" href="#">
	            {45}
	          </a>
	          <a onClick={()=>this.setRowCount(50)} className="dropdown-item" href="#">
	            {50}
	          </a>
	        </div>
	      </div>
	      );
	}

	makePageControlBar() {
		var pageControlBar =  this.state.items.length === 0 ? null :
			(<div className="row page-control-bar">
				<div className="col-md-6">
	                <nav aria-label="page-buttons">
	                  <ul className="pagination">
	                  	<li className="page-item">
	                  	</li>
	                    <li className="page-item">
	                      <a onClick={e=> this.previousPage()} className="page-link" href="#">
	                        <span className="fa fa-chevron-left"></span>
	                      </a>
	                    </li>
	                    <li className="page-item">
	                      <a onClick={e=> this.nextPage()} className="page-link" href="#">
	                        <span className="fa fa-chevron-right"></span>
	                      </a>
	                    </li>
	                    <li className="page-item">{this.makePageBox()}</li>
	                    <li className="page-item">{this.makePageGoButton()}</li>
	                    <li className="page-item">{this.makePerPageController()}</li>
	                  </ul>
	                </nav>
	            </div>

	            <div className="col-md-6" id="error-region">
	                <ErrorMessage
	                  key={"errormessage"}
	                  title={this.state.error.title}
	                  message={this.state.error.message}
	                  hidden={this.state.errorHidden}
	                  hideFunction={()=> this.state.errorHidden=true}/>
	            </div>
            </div>);

		return (this.props.hidePageControlBar ? null :
          	  pageControlBar
	    );
	}

	render() {
	  var table = null;
		var TableComp = this.state.renderComponent;
		var filterBox = this.state.showFilterBox ?
						(<div className="col-md-3">
								<FilterBox
			              		api={this.instance}
			              		filterItems={this.filterItems.bind(this)}/>
		        	</div>)
		        : null;

		var statusFilterBox = this.state.showStatusFilterBox ?
						(<div className="col-md-3">
							<StatusFilterBox filterRequests={this.filterRequests.bind(this)}/>
						</div>)
						: null;

    if (this.state.initialLoad) {
      table = (<div></div>);
    } else if (this.state.items.length === 0) {
      table = (<div className="center-text">No items found.</div>);
    } else {
      table = (<TableComp
        data={this.state.items}
        api={this.instance}
        callback={justDeleted => this.loadData(this.state.page, justDeleted)}
        {...this.props.extraProps} />);
    }

    if (filterBox !== null) {

	    return (
	      <div className="row inventory-page">

	       	{filterBox}

	        <div className="col-md-9">

	          {this.makePageControlBar()}

	          <div className="row">
	            {table}
	          </div>
	        </div>
	      </div>
	    );
		}
		else if(statusFilterBox != null){

				return (
		        <div className="row">

				  {statusFilterBox}

				  <div className="col-md-9">
			          {this.makePageControlBar()}
			          <div className="row">
			            {table}
			          </div>
		          </div>
		        </div>
				);

		}
		else{
			return (
					<div>
						{this.makePageControlBar()}

						<div className="row">
							{table}
						</div>
					</div>
			);
		}
	}
}

export default PaginationContainer;
