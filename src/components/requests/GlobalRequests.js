import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import RequestTable from './RequestTable.js';

function processData(responseData) {
  var requests = responseData;
  var i;
  var items = [];
  for (i=0; i<requests.length; i++) {
    var obj = requests[i];
    var item = {
      "Username": obj.user.username,
      "Item": obj.item.name,
      "Time Stamp": obj.created,
      "Quantity": obj.quantity,
      "Reason": obj.reason,
      "Status": obj.status,
      "Response": obj.reviewer_comment,
      "_id": obj._id,
      "user_id": obj.user._id,
      "item_id": obj.item._id,
    };
    items.push(item);
  }
  return items;
}


class GlobalRequests extends Component {
  constructor(props){
    super(props);
    this.state = {
      initialLoad: true,
      requests: [],
      page: 1,
      rowsPerPage: 5,
    };

    if (props.rowsPerPage) {
      this.state.rowsPerPage = props.rowsPerPage;
    }

    if (props.itemID) {
      this.state.itemId = props.itemID;
    }

    if (props.status) {
      this.state.status = props.status;
    }

  }

  componentWillMount() {
    this.axiosInstance = axios.create({
      baseURL: 'https://' + location.hostname + ':3001',
      headers: {'Authorization': localStorage.getItem('token')}
    });
    /*
    var api = '/api/requests';

    if (this.props.itemID && this.props.status) {
      api += '?item_id=' + this.props.itemID + "&status=" + this.props.status;
    }

    api+="?page=1&per_page=" + this.state.rowsPerPage;

    this.axiosInstance.get(api)
    .then(function(response) {
      this.setState({requests: processData(response.data)});
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));
  */

    this.loadData(this.state.page, false);

  }

  getURL(page, rowsPerPage) {
    var url = '/api/requests/?page='
      + page
      +'&per_page='+rowsPerPage;

      if (this.state.itemId) {
        url+='&item_id=' + this.state.itemId;
      }
      if (this.state.status) {
        url+='&status=' + this.state.status;
      }
    console.log("URL IS:");
    console.log(url);
    return url;
  }

  loadData(page, justDeleted) {

      if (page <= 0) {
        document.getElementById("pageNum1").value = this.state.page;
        return;
      }

      this.axiosInstance.get(this.getURL(page, this.state.rowsPerPage))
      .then(function(response) {
        console.log(response);
        if (this.state.initialLoad) {
          this.setState({initialLoad: false});
        }
        if (response.data.length === 0) {
          if (page === 1) {
            this.setState({requests: []})
          } else {
            document.getElementById("pageNum1").value = this.state.page;
            if (justDeleted === true) {
              this.previousPage();
            }
          }
        }
        else {
          console.log("Loading page. Response length != 0");
          console.log(processData(response.data));
          this.setState({
            requests: processData(response.data),
            page: page
          });
          document.getElementById("pageNum1").value = page;
        }
      }.bind(this));
  } 

  nextPage() {
    var nextPage = this.state.page + 1;
    var loadNextPage = true;

/*
    this.axiosInstance.get(this.getURL(this.state.page, this.state.rowsPerPage))
      .then(function (response) {
        if (response.data.length > this.state.requests.length) {
          this.setState({
            requests: processData(response.data)
          })
          document.getElementById("pageNum1").value = this.state.page;
          loadNextPage = false;
        }
      }.bind(this));

*/
    if (loadNextPage === true) {
      this.axiosInstance.get(this.getURL(nextPage, this.state.rowsPerPage))
        .then(function (response) {
          if (response.data.length === 0) {
            console.log("Data length is 0");
            console.log(response.data);
            return;
          }
          else {
            this.setState({
                page: nextPage
            });
            this.loadData(nextPage);
            document.getElementById("pageNum1").value = nextPage;
          }
        }.bind(this));
    }
  }

  previousPage() {
    var prevPage = this.state.page - 1;
    if (prevPage > 0) {
      this.setState({
        page: prevPage
      });
      this.loadData(prevPage);
    }
    document.getElementById("pageNum1").value = this.state.page;
  }

  makePageBox() {
    return (
      <input type="text" defaultValue={this.state.page} className="form-control pagenum-textbox" id="pageNum1"></input>
    );
  }

  makePageGoButton() {
    return(
      <button type="button"
        className="btn btn-primary"
        onClick={e=> this.loadData(document.getElementById('pageNum1').value)}>
        GO
      </button>
    );
  }

  render() {
    if(JSON.parse(localStorage.getItem('user')).is_admin === false){
      return(<div>You are not allowed to access this page.</div>);
    }
    else if(!this.state.requests || this.state.requests.length === 0){
      return(<div className="center-text">No requests to show.</div>);
    }
    else{
      console.log("Data is:");
      console.log(this.state.requests);
      return (
        <div className="wide">
          <nav className="request-page-section" aria-label="page-buttons">
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

          <RequestTable api={this.axiosInstance} data={this.state.requests} global={true} />

        </div>
      );
    }
  }
}

export default GlobalRequests;
