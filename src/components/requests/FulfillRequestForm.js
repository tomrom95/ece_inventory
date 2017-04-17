import React, { Component } from 'react';
import '../../App.css';
import Modal from 'react-modal';
import Select from 'react-select';

function mapInstanceNames(instances){
	var options = [];
	for(var i = 0; i < instances.length; i++){
		var instance = instances[i];
		var obj = {value: instance._id, label: instance.tag};
		options.push(obj);
	}
	return options;
}

function cleanInput(inputValue) {
    // Strip all non-number characters from the input
    return inputValue.replace(/[^0-9]/g, "");
}

class FulfillRequestForm extends Component {
  constructor(props){
    super(props);
      this.state = {
        raw_data: this.props.data,
        status: this.props.status,
        current_request: [],
				optionsMap: {},
      }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      raw_data: newProps.data,
      status: newProps.status,
    });
  }

  getOptions(item, input) {
		if(input === null){
			input = "";
		}
    return this.props.api.get('/api/inventory/'+item._id+'/instances?tag=' + input + '&page=' + 1  + '&per_page=' + 5)
      .then( (response) => {
        if(response.data.error){
          alert(response.data.error);
        }
        else{
          var instances = response.data;
          var optionsMap = this.state.optionsMap;
					optionsMap[item._id] = mapInstanceNames(instances);
					this.setState({
						optionsMap: optionsMap,
					})
        }
      });
  }
  makeFulfillModalBody(){
    //console.log(this.state.raw_data);

		var items = this.state.raw_data.Items;
		var forms = [];
		var asset_count = 0;
		for(var i = 0; i< items.length; i++){
			var item = items[i].item;
			var quantity = items[i].quantity;
			if(item.is_asset){
				asset_count++;
				var instances = [];
				for(var n = 0; n < this.state.current_request.length; n++){
					if(this.state.current_request[n].item._id === item._id){
						var instances = this.state.current_request[n].instances;
					}
				}
				forms.push(
					<li key={item._id+"-"+i} className="nav-item"> {item.name} (quantity: {quantity}) </li>
				);
				forms.push(
					<li key={item._id+"-select-"+i} className="nav-item">
						<Select
							key={item._id+"-asynch-select-"+i}
							name="form-field-name"
							multi={true}
							value={instances}
							onInputChange={this.getOptions.bind(this, item)}
							onChange={this.handleInstanceSelect.bind(this, item)}
							options={this.state.optionsMap[item._id]}
							onFocus={this.getOptions.bind(this, item)}
							/>
					</li>
				);
			}
			else{
				forms.push(
					<li key={item._id} className="nav-item"> {item.name} </li>
				);
			}


		}
		var request_body = {
			action: "FULFILL"
		}
		var title = "Choose instance(s)";
		if(asset_count === 0){
			title = "Fulfill request?";
		}
		var non_asset = (
			<div>
				<div className="modal-body">
					All items are non assets and may be disbursed
				</div>
				<div className="modal-footer">
						<button onClick={e => {this.clearInstanceForm()}} type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
						<button onClick={e => {this.fulfillRequest(request_body)}} type="button" className="btn btn-primary" >Submit</button>
				</div>
			</div>
		);
		var asset = (
			<div>
				<div className="modal-body">
					<ul key={"asset-list"} className="navbar-nav mr-auto">
						{forms}
					</ul>
				</div>
				<div className="modal-footer">
						<button onClick={e => {this.clearInstanceForm()}} type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
						<button onClick={e => {this.fulfillAssetRequest(this.state.current_request)}} type="button" className="btn btn-primary" >Submit</button>
				</div>
			</div>
		);
		var body;
		if(asset_count > 0){
			body = asset;
		}
		else{
			body = non_asset;
		}
		return(
			<div>
				<div className="modal-header">
					<h5 className="modal-title">{title}</h5>
				</div>
				{body}
			</div>

		);
	}

  clearInstanceForm(){
		this.setState({
			current_request: [],
		});
    this.props.callback();
	}

	fulfillAssetRequest( item_instances){
		var request = this.state.raw_data;
		var items = request.Items;
		var asset_ids =[];
		var instance_lists =[];
    var errors = false;
		var body = {
			action: "FULFILL",
			instances: []
		}
		for(var i = 0; i < items.length; i ++){
			var item = items[i].item;
			if(item.is_asset){
				asset_ids.push(item._id);
				var quantity = items[i].quantity;
				for(var j = 0; j < item_instances.length; j++){
					if(item_instances[j].item._id === item._id){

						var instance_ids = [];
						for(var k = 0; k < item_instances[j].instances.length; k++){
							instance_ids.push(item_instances[j].instances[k].value);
						}
						instance_lists.push(instance_ids);
					}
				}
			}

		}
		var body_instances = {};
		for(var n = 0; n < asset_ids.length; n++){
			body_instances[asset_ids[n]] = instance_lists[n];
		}
		body = {
			action: "FULFILL",
			instances: body_instances
		}
    //  console.log(this.state.row[3]);
		this.fulfillRequest(body);


	}

	handleInstanceSelect(item, event){

		var current_request = [];
		var obj = {
			item: item,
			instances: event,
		}
		//console.log(obj);

		var already_exist = false;
		for(var i = 0; i < this.state.current_request.length; i++){
			if(this.state.current_request[i].item._id !== item._id){
				current_request.push(this.state.current_request[i]);
			}
		}

		current_request.push(obj);
		//console.log(current_request);
		//console.log(current_request);
		this.setState({
			current_request: current_request,
		})

	}

  fulfillRequest( body){
    this.props.api.patch('/api/requests/' + this.state.raw_data._id,
      body
    )
    .then(function(response) {
      if(response.data.error){
        alert(response.data.error);

      }
      else{
        this.setState({
          status: "FULFILLED",
        });

        //this.clearInstanceForm();
        //this.props.callback();
        //this.forceUpdate();
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  render() {
    var body = (this.state.status === "FULFILLED") ? (
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Request Fulfilled</h5>
        </div>
        <div>
          <div className="modal-body">
            Success
          </div>
          <div className="modal-footer">
              <button onClick={e => {this.clearInstanceForm()}} type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    ) : (
			<div className="modal-content">
				{this.makeFulfillModalBody()}
			</div>
		);
    return(
			<div>
        {body}
			</div>
    );
  }

}
export default FulfillRequestForm;
