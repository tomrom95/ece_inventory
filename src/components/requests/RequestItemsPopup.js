import React, { Component } from 'react';
import '../../App.css';
import { Tooltip } from 'reactstrap';

class RequestItemsPopup extends Component {

	/*
		props will contain:
		- array of mappings from item (objects) to quantity
		- request ID
	*/

	constructor(props) {
		super(props);
		this.state = {
			items: props.items,
			reviewerComment: props.reviewerComment,
			id: props.id
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			items: newProps.items,
			reviewerComment: newProps.reviewerComment,
			id: newProps.id
		});
	}

	makeItemsList() {

		if (this.state.items.length === 0) {
    		return (<p><strong>Something went wrong!</strong></p>);
    	}

		var str = 'Items:\n';
		var i;
		for (i=0; i<this.state.items.length; i++) {
			var itemName = this.state.items[i].item.name;
			var quantity = this.state.items[i].quantity;
			var reviewerComment = '';
			if (this.state.reviewerComment)
				reviewerComment = this.state.reviewerComment;

			str += itemName + ' (' + quantity+ ')' + '\n';

			if (reviewerComment.length > 0)
				str += "\nReviewer Comment:\n" + reviewerComment;
    	}    	
    	return str;
    }

  	render() {
  		return <TooltipComponent itemList={this.makeItemsList()}
  					id={"request-detail-tooltip-"+this.state.id}/>;
  	}
}

class TooltipComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltipOpen: false
    };
  }

  toggle() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen
    });
  }

  render() {
    return (
      <td>
        <button className="btn btn-sm btn-outline-primary info-button"
        		type="button"  
        		id={this.props.id}>
        		<span className="fa fa-info"></span>
       	</button>
        <Tooltip placement="left"
        		 isOpen={this.state.tooltipOpen} 
        		 target={this.props.id} 
        		 toggle={e=> this.toggle()}
        		 autohide={false}>
          {this.props.itemList}
        </Tooltip>
      </td>
    );
  }
}

export default RequestItemsPopup;