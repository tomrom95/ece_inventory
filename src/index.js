import React from 'react';
import ReactDOM from 'react-dom';
import InventorySubTable from './InventorySubTable.js';
import ItemWizard from './ItemWizard.js';
import App from './App.js';
import './index.css';
import axios from 'axios';

var instance = axios.create({
  baseURL: 'https://' + location.hostname + ':3001'
});

//instance.defaults.headers.common['Authorization'] = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwiZ2V0dGVycyI6e30sIndhc1BvcHVsYXRlZCI6ZmFsc2UsImFjdGl2ZVBhdGhzIjp7InBhdGhzIjp7InBhc3N3b3JkX2hhc2giOiJpbml0IiwidXNlcm5hbWUiOiJpbml0IiwiaXNfYWRtaW4iOiJpbml0IiwiX192IjoiaW5pdCIsIl9pZCI6ImluaXQifSwic3RhdGVzIjp7Imlnbm9yZSI6e30sImRlZmF1bHQiOnt9LCJpbml0Ijp7Il9fdiI6dHJ1ZSwiaXNfYWRtaW4iOnRydWUsInBhc3N3b3JkX2hhc2giOnRydWUsInVzZXJuYW1lIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH19LCJpc05ldyI6ZmFsc2UsIl9kb2MiOnsiaXNfYWRtaW4iOnRydWUsIl9fdiI6MCwicGFzc3dvcmRfaGFzaCI6IiQyYSQwNSRuVHRNTDJwLnNtVUllNm81ZWlqbHdPVkdPYWd1TEZqTFk0S1NxeTFuOW1lU2dqWlVpOWxEbSIsInVzZXJuYW1lIjoiYWRtaW4iLCJfaWQiOiI1ODhmYjY5NzgwNDgxZmY4ODEwZmQ5MmEifSwiX3ByZXMiOnsiJF9fb3JpZ2luYWxfc2F2ZSI6W251bGwsbnVsbF0sIiRfX29yaWdpbmFsX3ZhbGlkYXRlIjpbbnVsbF0sIiRfX29yaWdpbmFsX3JlbW92ZSI6W251bGxdfSwiX3Bvc3RzIjp7IiRfX29yaWdpbmFsX3NhdmUiOltdLCIkX19vcmlnaW5hbF92YWxpZGF0ZSI6W10sIiRfX29yaWdpbmFsX3JlbW92ZSI6W119LCJpYXQiOjE0ODU5ODczMDcsImV4cCI6MTQ4NjA3MzcwN30.1HYA5fdpIFFrJbVYsPMyehIdClNvD9xmINoYu5kcbEs";

instance.post('/auth/login/', {
  username: "admin",
  password: "ece458duke",
})
.then(res => {
  if(res.data.token){
  	var token = res.data.token;
  	instance.defaults.headers.common['Authorization'] = token;
  	clickFunc(token);
  }
  else{
    console.log(res.data.error);
  }
})
.catch(function (error) {
  console.log(error);
});


function clickFunc(token) {
	instance.get('/api/inventory/')
    .then(function (response) {
    	renderTable(processData(response));
  	})
}

function processData(responseData) {
	var inventoryItems = responseData.data;
	var i;
	var items = [];
	for (i=0; i<inventoryItems.length; i++) {
		var obj = inventoryItems[i];
		var item = {
			"Name": obj.name,
			"Model": obj.model_number,
			"Location": obj.location,
			"Description": obj.description,
			"Quantity": obj.quantity,
			"Tags": obj.tags,
			"meta": {
				"id": obj._id,
				"hasInstanceObjects": obj.has_instance_objects
			}
		};
		console.log("id is: " + item["meta"]["id"]);
		items.push(item);
	}
	console.log(items);
	return items;
}

function renderTable(prop) {
	ReactDOM.render(
  		<InventorySubTable 
  			data={prop} 
  			hasButton={true} 
  			isInventorySubtable={true}
  			api={instance} />,
  		document.getElementById('root')
  	);

  	ReactDOM.render(<ItemWizard/>, document.getElementById('test'));
}
