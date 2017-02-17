import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import FilterBox from './FilterBox.js';
import ErrorMessage from './ErrorMessage.js';
import StatusFilterBox from '../requests/StatusFilterBox.js';

var filterNames = ["name", "model_number", "required_tags", "excluded_tags", "status"];

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

	componentWillReceiveNewProps(newProps) {
		this.setState({
			url: newProps.url,
			processData: newProps.processData,
			renderComponent: newProps.renderComponent,
			showFilterBox: newProps.showFilterBox,
			id: newProps.id,
			hasOtherParams: newProps.hasOtherParams
		});
	}

	componentWillMount() {
		this.instance = axios.create({
		  baseURL: 'https://' + location.hostname + ':3001',
		  headers: {'Authorization': localStorage.getItem('token')}
		});
		this.loadData(1, false);
	}

	loadData(page, justDeleted) {
	  if (page <= 0) {
	    document.getElementById("pageNum-"+this.state.id).value = this.state.page;
	    return;
	  }

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
	        document.getElementById("pageNum-"+this.state.id).value = this.state.page;
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

	      document.getElementById("pageNum-"+this.state.id).value = page;
	    }
	  }.bind(this));
	}

	previousPage() {
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

	makePageBox() {
    	return (
      	<input type="text" defaultValue={this.state.page} className="form-control pagenum-textbox" id={"pageNum-"+this.state.id}></input>
    	);
  	}

	makePageGoButton() {
		return(
		  <button type="button"
		    className="btn btn-primary"
		    onClick={e=> this.loadData(document.getElementById('pageNum-'+this.state.id).value, false)}>
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
	          {this.state.rowsPerPage + " items/page"}
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
			(<div className="row">
				<div className="col-md-4">
	                <nav aria-label="page-buttons">
	                  <ul className="pagination">
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
	                  </ul>
	                </nav>
	            </div>

	            <div className="col-md-3">
	                {this.makePerPageController()}
	            </div>

	            <div className="col-md-5 error-box" id="error-region">
	                <ErrorMessage
	                  key={"errormessage"}
	                  title={this.state.error.title}
	                  message={this.state.error.message}
	                  hidden={this.state.errorHidden}
	                  hideFunction={()=> this.state.errorHidden=true}/>
	            </div>
            </div>);

		return (
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
        callback={e => this.loadData(this.state.page, e)}
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
		        <div className="col-xs-12">

							{statusFilterBox}

		          {this.makePageControlBar()}

		          <div className="row">
		            {table}
		          </div>
		        </div>
				);

		}
		else{
			return (
					<div className="col-xs-12">

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
