import React, { Component } from 'react';
import './App.css';
import CollapsibleRow from './CollapsibleRow.js';
import axios from 'axios';
import https from 'https';
var instance = axios.create({
  baseURL: 'https://colab-sbx-115.oit.duke.edu:3001',
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

var token="JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwiZ2V0dGVycyI6e30sIndhc1BvcHVsYXRlZCI6ZmFsc2UsImFjdGl2ZVBhdGhzIjp7InBhdGhzIjp7InBhc3N3b3JkX2hhc2giOiJpbml0IiwidXNlcm5hbWUiOiJpbml0IiwiaXNfYWRtaW4iOiJpbml0IiwiX192IjoiaW5pdCIsIl9pZCI6ImluaXQifSwic3RhdGVzIjp7Imlnbm9yZSI6e30sImRlZmF1bHQiOnt9LCJpbml0Ijp7Il9fdiI6dHJ1ZSwiaXNfYWRtaW4iOnRydWUsInBhc3N3b3JkX2hhc2giOnRydWUsInVzZXJuYW1lIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH19LCJpc05ldyI6ZmFsc2UsIl9kb2MiOnsiaXNfYWRtaW4iOnRydWUsIl9fdiI6MCwicGFzc3dvcmRfaGFzaCI6IiQyYSQwNSRGN1BtOUpMSUY1YVluMG43dTF4Sm1PNXBCd0c4OVd5aFl6R3B3SkI1b21TdGQ4Um04LkRiNiIsInVzZXJuYW1lIjoidGVzdCIsIl9pZCI6IjU4ODkwMGExNTczMzhmZDBkNzIyZDc1MyJ9LCJfcHJlcyI6eyIkX19vcmlnaW5hbF9zYXZlIjpbbnVsbCxudWxsXSwiJF9fb3JpZ2luYWxfdmFsaWRhdGUiOltudWxsXSwiJF9fb3JpZ2luYWxfcmVtb3ZlIjpbbnVsbF19LCJfcG9zdHMiOnsiJF9fb3JpZ2luYWxfc2F2ZSI6W10sIiRfX29yaWdpbmFsX3ZhbGlkYXRlIjpbXSwiJF9fb3JpZ2luYWxfcmVtb3ZlIjpbXX0sImlhdCI6MTQ4NTg4ODc2NiwiZXhwIjoxNDg1OTc1MTY2fQ.do9GTV7W_l7PKILsZ3zqCC7J_LUczgLuDzqd8pW1zqc";
/*
instance.post('/auth/login/', {
  username: "admin",
  password: "ece458duke",
})
.then(res => {
  if(res.data.token){
  	token = res.data.token;
  	console.log(token);
  }
  else{
    console.log(res.data.error);
  }
})
.catch(function (error) {
  console.log(error);
});
*/

function clickFunc() {
	//console.log(token);
  console.log("ClickFunc clicked");
	instance.get('/api/inventory/', {
    	headers: {
    		"Content-Type": "application/x-www-form-urlencoded",
      	"Authorization": token
    	}
    })
    .then(function (response) {
    	console.log(response);
  	})
}

class AccordionTable extends Component {

	constructor(props) {
		super(props);

		// props will include number of rows,
		// number of columns, and names of columns.
	}

	render() {
		return (
			<div className="panel panel-default main-table">
				<div className="panel-heading inventory-table-heading">
					<div className="row">
						<div className="col-xs-10"> Item Name </div>
						<div className="col-xs-2"> Quantity </div>
					</div>
				</div>
				<div className="panel-group" id="accordion">
					<CollapsibleRow itemName={"Oscilloscope"} qty={10} />
					<CollapsibleRow itemName={"Voltmeter"} qty={11} />
					<CollapsibleRow itemName={"LED"} qty={12} />
					<a onClick={e=>clickFunc()}> Test </a>
				</div>
			</div>
		);
	}


}

export default AccordionTable
