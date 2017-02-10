import React, { Component } from 'react';
import '../../App.css';

var filterNames = ["name", "model_number", "required_tags", "excluded_tags"];

class PaginationContainer extends Component {

	// will also be passed the component it will render as one of the props,
	// as well as some way to call a method in it.

	/*
		Props will contain:
			- component that will be rendered
			- data processing method to feed the component.
	*/
	
	constructor(props) {
		super(props);
		this.state = {
			initialLoad: true,
			page: 1,
			rowsPerPage: 5,
			errorHidde: true,
			error: {
				title: "",
				message: ""
			}
		};
	}

	componentWillMount() {
		this.instance = axios.create({
		  baseURL: 'https://' + location.hostname + ':3001',
		  headers: {'Authorization': localStorage.getItem('token')}
	});

	loadData(page, justDeleted) {
	  if (page <= 0) {
	    document.getElementById("pageNum").value = this.state.page;
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
	      	// pass down empty array to InventoryTable.
	        //this.setState({items: []})
	      } else {
	        document.getElementById("pageNum").value = this.state.page;
	        if (justDeleted === true) {
	          this.previousPage();
	        }
	      }
	    }
	    // response not empty:
	    else {
	    	// do pass down the response.
		  /*
	      this.setState({
	        items: processData(response),
	        page: page
	      });
		  */
	      document.getElementById("pageNum").value = page;
	    }
	  }.bind(this));
	}

	previousPage() {
		this.loadData(this.state.page - 1);
	}

	nextPage() {
		this.loadData(this.state.page + 1);
	}

	getURL(page, rowsPerPage) {
		var url = this.props.url
		  + page
		  +'&per_page='+rowsPerPage;
		filterNames.forEach(function(filterName) {
		  if (this.state.filters[filterName]) {
		    url += "&" + filterName + "=" + this.state.filters[filterName];
		  }
		}.bind(this));
		return url;
	}

	filterItems() {
		this.setState({
		  page: 1,
		  filters: {
		    name: this.refs.name.value,
		    model_number: this.refs.model.value,
		    required_tags: this.refs.required.value,
		    excluded_tags: this.refs.excluded.value
		  }
		}, function () {
		  this.loadData(1);
		});
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

}

export default PaginationContainer;