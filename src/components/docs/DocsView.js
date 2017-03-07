import React, { Component } from 'react';
import '../../App.css';

class DocsView extends Component {


  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(newProps) {
    // this.setState({
    //   username: newProps.username,
    //   role: newProps.role
    // });
  }

  render() {
    var apikey = JSON.parse(localStorage.getItem('user')).apikey;
    return(
      <div className="container">
        <h1>Documentation</h1>
          <br/>
        <p>Your API Key: <strong>{apikey}</strong></p>
        <br/>
        <p>All guides for the ECE458 Inventory Project.</p>
        <br/>
        <div className="row docs-row">
          <a href="/guides/deployment_guide.md" download>
          <div className="docs-glyph">
            <span className="fa fa-upload" aria-hidden="true"></span>
          </div>
          <div className="docs-title">
            <h3>Deployment Guide
            </h3>
          </div>
          </a>
        </div>
        <div className="row docs-row">
          <a href="/guides/developer_guide.md" download>
          <div className="docs-glyph">
            <span className="fa fa-flask" aria-hidden="true"></span>
          </div>
          <div className="docs-title">
            <h3>Developer Guide
            </h3>
          </div>
          </a>
        </div>
        <div className="row docs-row">
          <a href="/guides/api_guide.md" download>
          <div className="docs-glyph">
            <span className="fa fa-list-alt" aria-hidden="true"></span>
          </div>
          <div className="docs-title">
            <h3>API Guide
            </h3>
          </div>
          </a>
        </div>
        <div className="row docs-row">
          <a href="/guides/api_contract.txt" download>
          <div className="docs-glyph">
            <span className="fa fa-bars" aria-hidden="true"></span>
          </div>
          <div className="docs-title">
            <h3>API Contract
            </h3>
          </div>
          </a>
        </div>
        <div className="row docs-row">
          <a href="/guides/ECE458.postman_collection.json" download>
          <div className="docs-glyph">
            <span className="fa fa-wrench" aria-hidden="true"></span>
          </div>
          <div className="docs-title">
            <h3>Postman API Collection
            </h3>
          </div>
          </a>
        </div>
      </div>
    );
  }
}

export default DocsView;
