import React, { Component } from 'react';
import '../../App.css';
import LoanTable from './LoanTable.js';
import PaginationContainer from '../global/PaginationContainer.js';

class MyLoansPage extends Component {

	processData(responseData) {
	    var loans = responseData.data;
	    var i;
	    var loanList = [];
	    for (i=0; i<loans.length; i++) {
	      var obj = loans[i];
	        var loan = {
	        	_id: obj._id,
	        	user: obj.user,
	        	request_id: obj.request,
	        	created: obj.created,
	        	modified: obj.lastModified,
	        	items: obj.items
	        }
	        loanList.push(loan);
	      }
	    return loanList;
  	}

	render() {
		console.log(JSON.parse(localStorage.getItem('user')));
	    var url = "api/loans/?user_id=" + JSON.parse(localStorage.getItem('user'))._id;
	    console.log(url);
	    var table = LoanTable;

	    return (<PaginationContainer
	            url={url}
	            processData={data => this.processData(data)}
	            renderComponent={table}
	            showFilterBox={false}
	            showStatusFilterBox={false}
	            hasOtherParams={true}
	            id={'loan-page'}
	            rowsPerPage={10} />);
	}

}

export default MyLoansPage;