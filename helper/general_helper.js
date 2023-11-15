var FCM = require('fcm-push');
const https = require('https')

const User = require('../model/user');



function createIntegerTime(time_str)
{
	const myArray = time_str.split(":");
	var int_time = myArray[0]+myArray[1];
	return parseInt(int_time);
}

function addGMTWithLocalTime(gmt_hout,gmt_minutes,timezone_hour,timezone_minutes)
{
	//console.log('gmt_hout',gmt_hout);
	//console.log('gmt_minutes',gmt_minutes);
	//console.log('timezone_hour',timezone_hour);
	//console.log('timezone_minutes',timezone_minutes);
	var added_h = parseInt(gmt_hout) + parseInt(timezone_hour);
	var added_m = parseInt(gmt_minutes) + parseInt(timezone_minutes);
	
	//console.log('added_h',added_h);
	//console.log('added_m',added_m);
	
	if(added_m >= 60)
	{
		var h = Math.floor(added_m / 60);
		var m = added_m % 60;
	}
	else
	{
		var h = 0;
		var m = 0
	}
	
	var total_h = parseInt(added_h) + parseInt(h);
	if(total_h >= 24) {
		total_h = total_h % 24;
	}
	if(m > 0) {
		var total_m = '' + m;
		if(total_m.length < 2)
			total_m = '0' + total_m;
	} else {
		var total_m = '' + added_m;
		if(total_m.length < 2)
			total_m = '0' + total_m;
	}
	
	return total_h+':'+total_m;
}

function getGooglePlaces(latitude,longitude)
{
	const url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+latitude+','+longitude+'&key=AIzaSyA-D0BU9p64xEqJI6pQOGguMoPV5NTJ6T4';
	return new Promise((resolve, reject) => {
		https.get(url, res => {
			let data = '';
			res.on('data', chunk => {
				data += chunk;
			});
			res.on('end', () => {
				//data = JSON.parse(data);
				//console.log(data);
				resolve(JSON.parse(data));
			})
		}).on('error', err => {
			console.log(err.message);
			reject(err);
		})
	});
}
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
function getMonth(date)
{
	const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	
	const d = new Date(date);
	return monthNames[d.getMonth()];
}


var methods = {};

var methods = {
	timestamp: function() {
		console.log('Current Time in Unix Timestamp: ' + Math.floor(Date.now() / 1000));
	},
	currentDate: function() {
		console.log('Current Date is: ' + new Date().toISOString().slice(0, 10));
	},
	/**
	 * 
	 * @param {{longitude: number;lattitude:number;}} locationData Geo coordinates
	 * @param {Date|undefined|null} date Date to find if SP available or not
	 * @param {number|undefined|null} time Time to find if SP available or not
	 * @returns {string[]}
	 */
	getAllSp: async function(locationData, bdate=null, time=null,cat_subcat_id,param,booking_time_int) {
		//console.log(locationData);
		//console.log(date);
		//console.log(time);
		if(param == 'cat') {
			var cat_subcat_details = await Category.findOne({ "_id" : cat_subcat_id }).exec();
		} else {
			var cat_subcat_details = await SubCategory.findOne({ "_id" : cat_subcat_id }).exec();
		}
		//console.log(cat_subcat_details);
		
		var a = new Date().getTime();
		var date = new Date(a);
		var utc_hour = date.getUTCHours();       // GMT Hour 
		var utc_minutes = date.getUTCMinutes();  // GMT Minutes
		
		var timezone_value = cat_subcat_details.timezone_value;
		var n = new Date(0,0);
		n.setSeconds(+timezone_value * 60 * 60);
		var converted_timezone_val = (n.toTimeString().slice(0, 8));
		//console.log(converted_timezone_val);
		
		var converted_timezone_val_arr = converted_timezone_val.split(":");
		var converted_timezone_val_hour = converted_timezone_val_arr[0];
		var converted_timezone_val_minutes = converted_timezone_val_arr[1];
		
		//console.log(converted_timezone_val_hour);
		//console.log(converted_timezone_val_minutes);
		
		var local_time = addGMTWithLocalTime(utc_hour,utc_minutes,converted_timezone_val_hour,converted_timezone_val_minutes);
		//console.log(local_time);
		var local_time_int = createIntegerTime(local_time);
		//console.log(local_time_int);
		//return false;
		if(local_time_int >= cat_subcat_details.start_time_int && local_time_int <= cat_subcat_details.end_time_int)
		{
			var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var current_day = days[ (bdate || new Date()).getDay() ].toLowerCase();;
			//console.log('day',current_day);
			
			var d = bdate || new Date();
			var hour = (d.getHours()<10?'0':'') + d.getHours();
			var minute = (d.getMinutes()<10?'0':'') + d.getMinutes();
			var hour_minute = hour+':'+minute;
			//console.log(hour_minute);
			
			var time_int = createIntegerTime(hour_minute);
			//console.log(time_int);
			
			let location_docs = await SpWorkingArea.find({},'location').exec();
			sp_location = location_docs.map(z=>z.location);
			
			var google_places_details = await getGooglePlaces(locationData.lattitude,locationData.longitude);
			const google_places_details_array = google_places_details.results;
			google_places = google_places_details_array.map(x=>x.formatted_address);
			console.log(google_places);
			for (var i = 0; i < google_places.length; i++)
			{
				for(var s = 0; s < sp_location.length; s++)
				{
					if(google_places[i] == sp_location[s]) {
						var sp_place = sp_location[s];
						break;
					}
				}
			}
			console.log('sp_place',sp_place); //return false;
			let sp_id_docs_area_wise = await SpWorkingArea.find({ "location": sp_place }).exec();
			let sp_id_array_area_wise = sp_id_docs_area_wise.map(loca_data => loca_data.service_provider_id);
			console.log('xxxxx',sp_id_array_area_wise); //return false;
			var query = {};
			query.service_provider_id = { $in: sp_id_array_area_wise };
			query[current_day] = 1;
			if(time!=null) {
				query[`${current_day}_from_time`]={ $lte: booking_time_int };
				query[`${current_day}_to_time`]={ $gte: booking_time_int };
			}
			//console.log(query);
			
			let sp_docs_hour_wise = await WorkingHours.find(query).exec();
			//console.log('sp_docs_hour_wise',sp_docs_hour_wise);
			let sp_id_array_hour_wise = sp_docs_hour_wise.map(hour_data => hour_data.service_provider_id);
			console.log('sssss',sp_id_array_hour_wise);
			
			if(sp_id_array_hour_wise.length) {
				// For 30min calculations
				var expiry_time = new Date(new Date().getTime() + 30*60000);
				var expiry_time_stamp = expiry_time.getTime();
			} else {
				var expiry_time = new Date(new Date().getTime() + 30*60000);
				var expiry_time_stamp = expiry_time.getTime();
			}
			console.log('[sp_id_array_hour_wise,expiry_time_stamp]',[sp_id_array_hour_wise,expiry_time_stamp]);
			return [sp_id_array_hour_wise,expiry_time_stamp];
		}
		else
		{
			var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var current_day = days[ (bdate || new Date()).getDay() ].toLowerCase();;
			//console.log('day',current_day);
			
			var d = bdate || new Date();
			var hour = (d.getHours()<10?'0':'') + d.getHours();
			var minute = (d.getMinutes()<10?'0':'') + d.getMinutes();
			var hour_minute = hour+':'+minute;
			//console.log(hour_minute);
			
			var time_int = createIntegerTime(hour_minute);
			//console.log(time_int);
			let location_docs = await SpWorkingArea.find({},'location').exec();
			sp_location = location_docs.map(z=>z.location);
			
			var google_places_details = await getGooglePlaces(locationData.lattitude,locationData.longitude);
			const google_places_details_array = google_places_details.results;
			google_places = google_places_details_array.map(x=>x.formatted_address);
			//console.log(google_places);
			for (var i = 0; i < google_places.length; i++)
			{
				for(var s = 0; s < sp_location.length; s++)
				{
					if(google_places[i] == sp_location[s]) {
						var sp_place = sp_location[s];
						break;
					}
				}
			}
			
			//console.log('sp_place',sp_place); return false;
			let sp_id_docs_area_wise = await SpWorkingArea.find({ "location": sp_place }).exec();
			let sp_id_array_area_wise = sp_id_docs_area_wise.map(loca_data => loca_data.service_provider_id);
			//console.log(sp_id_array_area_wise); return false;
			var query = {};
			query.service_provider_id = { $in: sp_id_array_area_wise };
			let sp_docs_hour_wise = await WorkingHours.find(query).exec();
			//console.log('sp_docs_hour_wise',sp_docs_hour_wise);
			let sp_id_array_hour_wise = sp_docs_hour_wise.map(hour_data => hour_data.service_provider_id);
			//console.log(sp_id_array_hour_wise);
			
			
			// next day + remaining hours calculations
			var future_date = new Date(); 
			future_date.setDate(future_date.getDate() + 1);
			console.log('future_date',future_date); // future date
			
			var formatted_date = formatDate(future_date);
			//console.log('formatted_date',formatted_date);
			
			//then I have to get the end time of cat/subcat
			//console.log(cat_subcat_details.end_time);
			var cat_subcat_end_time = cat_subcat_details.end_time;
			var cat_subcat_end_time_unit = cat_subcat_details.end_time_unit;
			
			const myArray = cat_subcat_end_time.split(":");
			if(cat_subcat_end_time_unit == 'PM') {
				var hour24format = parseInt(myArray[0]) + 12;
			} else {
				var hour24format = myArray[0];
			}
			if(sp_id_array_hour_wise.length) {
				//console.log(hour24format);
				var expiry_time_stamp  = new Date(formatted_date).getTime() + (parseInt(hour24format)*60*60*1000) + (30*60*1000);
				console.log(expiry_time_stamp);
				//return false;
			} else {
				//var expiry_time_stamp = 0;
				var expiry_time_stamp = new Date(formatted_date).getTime() + (parseInt(hour24format)*60*60*1000) + (30*60*1000);
			}
			return [sp_id_array_hour_wise,expiry_time_stamp];
		}
	},
	checkCardExists: async function(stripe_customer_id,fingerprint) {
		return new Promise((resolve, reject) => {
			UserCard.findOne({ "stripe_customer_id": stripe_customer_id, "fingerprint": fingerprint }).exec().then((doc) => {
				if (doc) {
					resolve(doc);
				} else {
					resolve('not_exists');
				}
			}).catch((e) => {
				throw e;
			});
		})
	},
	checkCardWithCustomerId: async function(stripe_customer_id) {
		return new Promise((resolve, reject) => {
			UserCard.findOne({ "stripe_customer_id": stripe_customer_id }).exec().then((doc) => {
				if (doc) {
					resolve(doc);
				} else {
					resolve('not_exists');
				}
			}).catch((e) => {
				throw e;
			});
		})
	},
	getZonePrice: async function(param, id, latitude, longitude) {
		if(param == 'cat') {
			const zone_docs = await ZoneCatSubcatPrice.find({"cat_id":id},'zone_id').exec();
			if(zone_docs.length > 0) {
				//console.log(zone_docs);
				zone_ids = zone_docs.map(m=>m.zone_id);
				//console.log(zone_ids);
				const places_docs = await ZonePlace.find({ "zone_id": {$in: zone_ids}},'place_name').exec();
				zone_places = places_docs.map(z=>z.place_name);
				//console.log(zone_places);
				//https://maps.googleapis.com/maps/api/geocode/json?latlng=25.243850,55.300658&sensor=true&key=AIzaSyA-D0BU9p64xEqJI6pQOGguMoPV5NTJ6T4
					
					var google_places_details = await getGooglePlaces(latitude,longitude);
					const google_places_details_array = google_places_details.results;
					google_places = google_places_details_array.map(x=>x.formatted_address);
					//console.log(google_places); return false;
					
					for (var i = 0; i < google_places.length; i++)
					{
						//console.log(google_places[i]);
						for(var s = 0; s < zone_places.length; s++)
						{
							if(google_places[i] == zone_places[s]) {
								var user_place = zone_places[s];
								break;
							}
						}
					}
					//console.log('user_places',user_place); return false;
					if(user_place) {
						const zone_id_docs =  await ZonePlace.findOne({ "place_name": user_place}).exec();
						//console.log(zone_id_docs);
						
						const prices_docs =  await ZoneCatSubcatPrice.findOne({ "zone_id": zone_id_docs.zone_id, "cat_id":id}).exec();
						//console.log(prices_docs);
						return prices_docs;
					} else {
						return 'no_zone';
					}
			} else {
				return 'no_zone';
			}
		} else {
			let zone_docs = await ZoneCatSubcatPrice.find({"sub_cat_id":id}).exec();
			if(zone_docs.length > 0) {
				zone_ids = zone_docs.map(m=>m.zone_id);
				const places_docs = await ZonePlace.find({ "zone_id": {$in: zone_ids}},'place_name').exec();
				zone_places = places_docs.map(z=>z.place_name);
				
				var google_places_details = await getGooglePlaces(latitude,longitude);
				const google_places_details_array = google_places_details.results;
				google_places = google_places_details_array.map(x=>x.formatted_address);
				
				for (var i = 0; i < google_places.length; i++)
				{
					//console.log(google_places[i]);
					for(var s = 0; s < zone_places.length; s++)
					{
						if(google_places[i] == zone_places[s]) {
							var user_place = zone_places[s];
							break;
						}
					}
				}
				//console.log('user_places',user_place); return false;
				if(user_place) {
					const zone_id_docs =  await ZonePlace.findOne({ "place_name": user_place}).exec();
					//console.log(zone_id_docs);
					
					const prices_docs =  await ZoneCatSubcatPrice.findOne({ "zone_id": zone_id_docs.zone_id, "sub_cat_id":id}).exec();
					//console.log(prices_docs);
					return prices_docs;
				} else {
					return 'no_zone';
				}
			} else {
				return 'no_zone';
			}
		}
	},
	getPlaceWiseCategory: async function(latitude, longitude, cat_subcat_status) {
		console.log(latitude);
		console.log(longitude);
		
		let place_docs = await CatSubcatAreaPlace.find({},'place_name').exec();
		cat_places = place_docs.map(z=>z.place_name);
		console.log('cat_places',cat_places);
		
		var google_places_details = await getGooglePlaces(latitude,longitude);
		const google_places_details_array = google_places_details.results;
		google_places = google_places_details_array.map(x=>x.formatted_address);
		console.log('google_places',google_places);
		
		for (var i = 0; i < google_places.length; i++)
		{
			for(var s = 0; s < cat_places.length; s++)
			{
				if(google_places[i] == cat_places[s]) {
					var user_place = cat_places[s];
					break;
				}
			}
		}
		//console.log('user_place',user_place); return false;
		if(cat_subcat_status == 1) {
			let cat_id_docs = await CatSubcatAreaPlace.find({"place_name":user_place, "sub_category_id":""}).exec();
			cat_id_arr = cat_id_docs.map(y=>y.category_id);
			//console.log('cat_id_arr',cat_id_arr);
			return cat_id_arr; //returning the category ids
		} else {
			let subcat_id_docs = await CatSubcatAreaPlace.find({"place_name":user_place, "sub_category_id":{ $ne: "" }}).exec();
			subcat_id_arr = subcat_id_docs.map(y=>y.sub_category_id);
			//console.log('subcat_id_arr',subcat_id_arr);
			return subcat_id_arr; //returning the sub category ids
		}
	},
	chkCatSubcatExists: async function(latitude, longitude, cat_subcat_id, param) {
		console.log(latitude);
		console.log(longitude);
		
		let place_docs = await CatSubcatAreaPlace.find({},'place_name').exec();
		cat_places = place_docs.map(z=>z.place_name);
		
		var google_places_details = await getGooglePlaces(latitude,longitude);
		const google_places_details_array = google_places_details.results;
		google_places = google_places_details_array.map(x=>x.formatted_address);
		
		for (var i = 0; i < google_places.length; i++)
		{
			for(var s = 0; s < cat_places.length; s++)
			{
				if(google_places[i] == cat_places[s]) {
					var user_place = cat_places[s];
					break;
				}
			}
		}
		//console.log('user_place',user_place); return false;
		if(param == 'cat') {
			let cat_docs = await CatSubcatAreaPlace.findOne({"place_name":user_place, "category_id":cat_subcat_id}).exec();
			if(cat_docs) {
				return 'exists';
			} else {
				return 'not_exists';
			}
		} else {
			let sub_cat_docs = await CatSubcatAreaPlace.findOne({"place_name":user_place, "sub_category_id":cat_subcat_id}).exec();
			if(sub_cat_docs) {
				return 'exists';
			} else {
				return 'not_exists';
			}
		}
	},
	chkHoliday: async function(booking_date, latitude, longitude) {
		var google_places_details = await getGooglePlaces(latitude,longitude);
		const google_places_details_array = google_places_details.results[0].address_components;
		//console.log(google_places_details_array);
		for(var i=0; i<google_places_details_array.length; i++)
		{
			if (google_places_details_array[i].types[0] == "locality")
			{
				var city = google_places_details_array[i].long_name;
				break;
			}
		}
		console.log(city);
		let holiday_doc = await Holiday.findOne({"city":city, "holiday_date":booking_date}).exec();
		if(holiday_doc) {
			return 'exists';
		} else {
			return 'not_exists';
		}
	},
	chkPromoCode: async function(latitude, longitude) {
		var google_places_details = await getGooglePlaces(latitude,longitude);
		const google_places_details_array = google_places_details.results[0].address_components;
		//console.log(google_places_details_array);
		for(var i=0; i<google_places_details_array.length; i++)
		{
			if (google_places_details_array[i].types[0] == "locality")
			{
				var city = google_places_details_array[i].long_name;
				break;
			}
		}
		console.log(city);
		return city;
	},
	getSPBookingAreaWise: async function(booking_details) {
		let location_docs = await SpWorkingArea.find({},'location').exec();
		sp_location = location_docs.map(z=>z.location);
		
		//console.log('sp_location',sp_location); //return false;
		
		var google_places_details = await getGooglePlaces(booking_details.latitude,booking_details.longitude);
		const google_places_details_array = google_places_details.results;
		google_places = google_places_details_array.map(x=>x.formatted_address);
		
		//console.log('google_places',google_places); return false;
		
		for (var i = 0; i < google_places.length; i++)
		{
			for(var s = 0; s < sp_location.length; s++)
			{
				if(google_places[i] == sp_location[s]) {
					var sp_place = sp_location[s];
					break;
				}
			}
		}
		let sp_id_docs_area_wise = await SpWorkingArea.find({ "location": sp_place }).exec();
		let sp_id_array_area_wise = sp_id_docs_area_wise.map(loca_data => loca_data.service_provider_id);
		return sp_id_array_area_wise;
	},
	getAllSpTest: async function(locationData, bdate=null, time=null,cat_subcat_id,param,booking_time_int) {
		//console.log(locationData);
		//console.log(date);
		//console.log(time);
		if(param == 'cat') {
			var cat_subcat_details = await Category.findOne({ "_id" : cat_subcat_id }).exec();
		} else {
			var cat_subcat_details = await SubCategory.findOne({ "_id" : cat_subcat_id }).exec();
		}
		//console.log('booking_time_int',booking_time_int);
		//console.log(cat_subcat_details); //return false;
		
		var a = new Date().getTime();
		var date = new Date(a);
		var utc_hour = date.getUTCHours();       // GMT Hour 
		var utc_minutes = date.getUTCMinutes();  // GMT Minutes
		
		var timezone_value = cat_subcat_details.timezone_value;
		var n = new Date(0,0);
		n.setSeconds(+timezone_value * 60 * 60);
		var converted_timezone_val = (n.toTimeString().slice(0, 8));
		//console.log(converted_timezone_val);
		
		var converted_timezone_val_arr = converted_timezone_val.split(":");
		var converted_timezone_val_hour = converted_timezone_val_arr[0];
		var converted_timezone_val_minutes = converted_timezone_val_arr[1];
		
		//console.log(converted_timezone_val_hour);
		//console.log(converted_timezone_val_minutes);
		
		var local_time = addGMTWithLocalTime(utc_hour,utc_minutes,converted_timezone_val_hour,converted_timezone_val_minutes);
		//console.log(local_time);
		var local_time_int = createIntegerTime(local_time);
		//console.log(local_time_int);
		
		//return false;
		
		if(local_time_int >= cat_subcat_details.start_time_int && local_time_int <= cat_subcat_details.end_time_int)
		{
			console.log('eseche');
			var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var current_day = days[ (bdate || new Date()).getDay() ].toLowerCase();;
			//console.log('day',current_day);
			
			var d = bdate || new Date();
			var hour = (d.getHours()<10?'0':'') + d.getHours();
			var minute = (d.getMinutes()<10?'0':'') + d.getMinutes();
			var hour_minute = hour+':'+minute;
			//console.log(hour_minute);
			
			var time_int = createIntegerTime(hour_minute);
			//console.log(time_int);
			
			let location_docs = await SpWorkingArea.find({},'location').exec();
			sp_location = location_docs.map(z=>z.location);
			
			var google_places_details = await getGooglePlaces(locationData.lattitude,locationData.longitude);
			const google_places_details_array = google_places_details.results;
			google_places = google_places_details_array.map(x=>x.formatted_address);
			//console.log(google_places);
			for (var i = 0; i < google_places.length; i++)
			{
				for(var s = 0; s < sp_location.length; s++)
				{
					if(google_places[i] == sp_location[s]) {
						var sp_place = sp_location[s];
						break;
					}
				}
			}
			//console.log('sp_place',sp_place); return false;
			let sp_id_docs_area_wise = await SpWorkingArea.find({ "location": sp_place }).exec();
			let sp_id_array_area_wise = sp_id_docs_area_wise.map(loca_data => loca_data.service_provider_id);
			//console.log(sp_id_array_area_wise); return false;
			
			var query = {};
			query.service_provider_id = { $in: sp_id_array_area_wise };
			query[current_day] = 1;
			if(time!=null) {
				query[`${current_day}_from_time`]={ $lte: booking_time_int };
				query[`${current_day}_to_time`]={ $gte: booking_time_int };
			}
			//console.log(query);
			
			let sp_docs_hour_wise = await WorkingHours.find(query).exec();
			//console.log('sp_docs_hour_wise',sp_docs_hour_wise);
			let sp_id_array_hour_wise = sp_docs_hour_wise.map(hour_data => hour_data.service_provider_id);
			//console.log(sp_id_array_hour_wise);
			
			// For 30min calculations
			var expiry_time = new Date(new Date().getTime() + 30*60000);
			var expiry_time_stamp = expiry_time.getTime();
			
			return [sp_id_array_hour_wise,expiry_time_stamp];
			
		}
		else
		{
			console.log('aseni');
			var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var current_day = days[ (bdate || new Date()).getDay() ].toLowerCase();;
			//console.log('day',current_day);
			
			var d = bdate || new Date();
			var hour = (d.getHours()<10?'0':'') + d.getHours();
			var minute = (d.getMinutes()<10?'0':'') + d.getMinutes();
			var hour_minute = hour+':'+minute;
			//console.log(hour_minute);
			
			var time_int = createIntegerTime(hour_minute);
			//console.log(time_int);
			
			let location_docs = await SpWorkingArea.find({},'location').exec();
			sp_location = location_docs.map(z=>z.location);
			
			var google_places_details = await getGooglePlaces(locationData.lattitude,locationData.longitude);
			const google_places_details_array = google_places_details.results;
			google_places = google_places_details_array.map(x=>x.formatted_address);
			//console.log(google_places);
			for (var i = 0; i < google_places.length; i++)
			{
				for(var s = 0; s < sp_location.length; s++)
				{
					if(google_places[i] == sp_location[s]) {
						var sp_place = sp_location[s];
						break;
					}
				}
			}
			//console.log('sp_place',sp_place); return false;
			let sp_id_docs_area_wise = await SpWorkingArea.find({ "location": sp_place }).exec();
			let sp_id_array_area_wise = sp_id_docs_area_wise.map(loca_data => loca_data.service_provider_id);
			//console.log(sp_id_array_area_wise); return false;
			var query = {};
			query.service_provider_id = { $in: sp_id_array_area_wise };
			let sp_docs_hour_wise = await WorkingHours.find(query).exec();
			//console.log('sp_docs_hour_wise',sp_docs_hour_wise);
			let sp_id_array_hour_wise = sp_docs_hour_wise.map(hour_data => hour_data.service_provider_id);
			//console.log(sp_id_array_hour_wise);
			
			// next day + remaining hours calculations
			var future_date = new Date(); 
			future_date.setDate(future_date.getDate() + 1);
			console.log('future_date',future_date); // future date
			
			var formatted_date = formatDate(future_date);
			//console.log('formatted_date',formatted_date);
			
			//then I have to get the end time of cat/subcat
			//console.log(cat_subcat_details.end_time);
			var cat_subcat_end_time = cat_subcat_details.end_time;
			var cat_subcat_end_time_unit = cat_subcat_details.end_time_unit;
			
			const myArray = cat_subcat_end_time.split(":");
			if(cat_subcat_end_time_unit == 'PM') {
				var hour24format = parseInt(myArray[0]) + 12;
			} else {
				var hour24format = myArray[0];
			}
			//console.log(hour24format);
			var expiry_time_stamp  = new Date(formatted_date).getTime() + (parseInt(hour24format)*60*60*1000) + (30*60*1000);
			console.log(expiry_time_stamp);
			//return false;
			return [sp_id_array_hour_wise,expiry_time_stamp];
		}
	},
	chkPromoCodeZone: async function(latitude, longitude, city) {
		const zone_details = await Zone.findOne({ "city": city }).exec();
		if(zone_details) {
			const zone_place_details = await ZonePlace.find({ "zone_id": zone_details._id }).exec();
			let zone_place_array = zone_place_details.map(place_data => place_data.place_name);
			//console.log(zone_place_array);
			
			var google_places_details = await getGooglePlaces(latitude,longitude);
			const google_places_details_array = google_places_details.results;
			google_places = google_places_details_array.map(x=>x.formatted_address);
			//console.log(google_places);
			var z_place = '';
			for (var i = 0; i < google_places.length; i++)
			{
				for(var s = 0; s < zone_place_array.length; s++)
				{
					if(google_places[i] == zone_place_array[s]) {
						var z_place = zone_place_array[s];
						break;
					}
				}
			}
			//console.log('z_place',z_place);
			if(z_place == '') {
				//console.log('not_exists');
				return 'not_exists';
			} else {
				//console.log('exists');
				return 'exists';
			}
		} else {
			//console.log('not_exists');
			return 'not_exists';
		}
	},
	chkRescheduleDate: async function(booking_details) {
		//console.log('booking_details',booking_details);
		var booking_date = booking_details.booking_date;
		var maxLength = 3;
		var max_iteration = 30;
		var date_array = [];
		
		for(i=0; i<=max_iteration; i++)
		{
			var next_date = new Date(booking_date);
			next_date.setDate(next_date.getDate()+1);
			var formated_next_date = formatDate(next_date);
			//console.log(formated_next_date);
			var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var current_day = days[ (new Date(formated_next_date)).getDay() ].toLowerCase();
			
			var query = {};
			query.service_provider_id = booking_details.accepted_by;
			query[current_day] = 1;
			
			let sp_docs = await WorkingHours.findOne(query).exec();
			if(sp_docs) {
				if(maxLength == date_array.length) { break; }
				//var query2 = {};
				//query2.accepted_by = booking_details.accepted_by;
				//query2.booking_date = formated_next_date;
				//var sp_b_doc = await Booking.findOne(query2).exec();
				//if(!sp_b_doc) {
					date_array.push(formated_next_date);
				//}
			}
			var booking_date = formated_next_date;
		}
		console.log(date_array);
		return date_array;
	},
	getCurrentTimeBookingTimeDistance: async function(cat_subcat_details,booking_date,booking_time) {
		var booking_date_time = booking_date+' '+booking_time;
		var booking_date_time_timestamp = new Date(booking_date_time).getTime();
		//console.log(booking_date_time_timestamp); return false;
		
		var timezone_value = cat_subcat_details.timezone_value;
		var n = new Date(0,0);
		n.setSeconds(+timezone_value * 60 * 60);
		var converted_timezone_val = (n.toTimeString().slice(0, 8));
		//console.log(converted_timezone_val); return false;
		
		var converted_timezone_val_arr = converted_timezone_val.split(":");
		var converted_timezone_val_hour = converted_timezone_val_arr[0];
		var converted_timezone_val_minutes = converted_timezone_val_arr[1];
		//console.log(converted_timezone_val_hour);
		//console.log(converted_timezone_val_minutes);
		
		var a = new Date().getTime();
		var date = new Date(a);
		var utc_hour = date.getUTCHours();       // GMT Hour 
		var utc_minutes = date.getUTCMinutes();  // GMT Minutes
		
		console.log(utc_hour);
		console.log(utc_minutes);
		
		var local_time = addGMTWithLocalTime(utc_hour,utc_minutes,converted_timezone_val_hour,converted_timezone_val_minutes);
		//console.log('local_time',local_time); return false;
		
		const d2 = new Date();
		const result = d2.toUTCString();
		//console.log(result);
		var utc_date = ''+new Date(result).getDate();
		if(utc_date.length < 2) {
			utc_date = '0'+utc_date;
		}
		var utc_month = ''+(new Date(result).getMonth() + 1);
		if(utc_month.length < 2) {
			utc_month = '0'+utc_month;
		}
		var utc_year = new Date(result).getFullYear();
		//console.log('ccc',utc_year+'-'+utc_month+'-'+utc_date); return false;
		var local_date = utc_year+'-'+utc_month+'-'+utc_date+' '+local_time;
		//console.log('ccc',local_date); return false;
		var local_date_timestamp = new Date(local_date).getTime();
		//console.log('local_date_timestamp',local_date_timestamp);
		//console.log('booking_date_time_timestamp',booking_date_time_timestamp); return false;
		var diff =(booking_date_time_timestamp - local_date_timestamp) / 1000;
		diff /= (60 * 60);
		//console.log('diff',diff);
		var hour_difference = Math.abs(diff);
		//var hour_difference = Math.round(diff);
		console.log('hour_difference',hour_difference); //return false;
		return hour_difference;
	},
	getCurrentTimeBookingTimeDistanceInMinutes: async function(cat_subcat_details,booking_date,booking_time) {
		var booking_date_time = booking_date+' '+booking_time;
		var booking_date_time_timestamp = new Date(booking_date_time).getTime();
		
		var timezone_value = cat_subcat_details.timezone_value;
		var n = new Date(0,0);
		n.setSeconds(+timezone_value * 60 * 60);
		var converted_timezone_val = (n.toTimeString().slice(0, 8));
		
		var converted_timezone_val_arr = converted_timezone_val.split(":");
		var converted_timezone_val_hour = converted_timezone_val_arr[0];
		var converted_timezone_val_minutes = converted_timezone_val_arr[1];
		
		var a = new Date().getTime();
		var date = new Date(a);
		var utc_hour = date.getUTCHours();       // GMT Hour 
		var utc_minutes = date.getUTCMinutes();  // GMT Minutes
		
		var local_time = addGMTWithLocalTime(utc_hour,utc_minutes,converted_timezone_val_hour,converted_timezone_val_minutes);
		//console.log('local_time',local_time); return false;
		
		const d2 = new Date();
		const result = d2.toUTCString();
		//console.log(result);
		var utc_date = ''+new Date(result).getDate();
		if(utc_date.length < 2) {
			utc_date = '0'+utc_date;
		}
		var utc_month = ''+(new Date(result).getMonth() + 1);
		if(utc_month.length < 2) {
			utc_month = '0'+utc_month;
		}
		var utc_year = new Date(result).getFullYear();
		var local_date = utc_year+'-'+utc_month+'-'+utc_date+' '+local_time;
		var local_date_timestamp = new Date(local_date).getTime();
		
		var diff =(booking_date_time_timestamp - local_date_timestamp) / 1000 / 60;
		return [diff,local_date,local_date_timestamp];
	},
	getTimer: async function(booking_id) {
		let booking_doc = await Booking.findOne({ "_id": booking_id}).exec();
		if(booking_doc) {
			//console.log('xxx',booking_doc.hour);
			var today = new Date();
			today.setHours(today.getHours() + parseInt(booking_doc.hour));
			//console.log('ccc',today);
			
			var countDownDate = new Date(today).getTime();
			
			var x = setInterval(function() {
				var now = new Date().getTime();
				var distance = countDownDate - now;
    
				// Time calculations for days, hours, minutes and seconds
				var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
				var seconds = Math.floor((distance % (1000 * 60)) / 1000);
				
				//console.log(hours + "h " + minutes + "m " + seconds + "s ");
				//return hours + "h " + minutes + "m " + seconds + "s ";
				
				if (distance < 0) {
					clearInterval(x);
					//document.getElementById("demo").innerHTML = "EXPIRED";
					console.log('EXPIRED');
					return 'EXPIRED';
				}
			}, 1000);
		}
	},
	/*chkBookingExists: async function(service_provider_id, booking_id, booking_date, booking_time, total_hour, price_status) {
		let booking_docs = await Booking.find({ "booking_date":booking_date, "accepted_by": service_provider_id }).exec();
		console.log('price_status',price_status);
		if(price_status == 1)
		{
			if(booking_docs.length > 0)
			{
				for (let i = 0; i < booking_docs.length; i++)
				{
					if(booking_docs[i].aq_status == 2) {
						return 'exists2';
					}
					var existing_booking_date_time = booking_docs[i].booking_date+' '+booking_docs[i].booking_time;
					var existing_booking_date_time_timestamp = new Date(existing_booking_date_time).getTime();
					//one hour before timestamp
					var onehourmiliseconds = (1/2) * 3600 * 1000; //later changed it to half hour
					var checking_start_timestamp = new Date(existing_booking_date_time_timestamp - onehourmiliseconds).getTime();
					
					var booking_hour = parseInt(booking_docs[i].hour) + (1/2); //half hour added
					var booking_miliseconds = booking_hour * 3600 * 1000;
					var checking_end_timestamp = new Date(existing_booking_date_time_timestamp + booking_miliseconds).getTime();
					
					var applying_booking_start_date_time = booking_date+' '+booking_time;
					var applying_booking_start_timestamp = new Date(applying_booking_start_date_time).getTime();
					
					var applying_booking_hour = parseInt(total_hour);
					var applying_booking_miliseconds = applying_booking_hour * 3600 * 1000;
					var applying_booking_end_timestamp = new Date(applying_booking_start_timestamp + applying_booking_miliseconds).getTime();
					
					if((applying_booking_start_timestamp >= checking_start_timestamp && applying_booking_start_timestamp <= checking_end_timestamp) || (applying_booking_end_timestamp >= checking_start_timestamp && applying_booking_end_timestamp <= checking_end_timestamp))
					{
						return 'exists1';
					}
				}
				return 'not exists';
			}
			else
			{
				return 'not exists';
			}
		}
		else
		{
			if(booking_docs.length > 0)
			{
				return 'fixed exists';
			}
			else
			{
				return 'not exists';
			}
		}
	},*/
	chkBookingExists: async function(service_provider_id, booking_id, booking_date, booking_time, total_hour, price_status, fixed_price_hour) {
		console.log('price_status',price_status);
		let booking_docs = await Booking.find({ "booking_date":booking_date, "accepted_by": service_provider_id, "booking_status":{ $nin: [2,4] } }).exec();
		console.log('booking_docs',booking_docs);
		if(booking_docs.length > 0)
		{
			for (let i = 0; i < booking_docs.length; i++)
			{
				if(booking_docs[i].param == 'cat') {
					var cat_subcat_details = await Category.findOne({ "_id" : booking_docs[i].cat_subcat_id }).exec();
				} else {
					var cat_subcat_details = await SubCategory.findOne({ "_id" : booking_docs[i].cat_subcat_id }).exec();
				}
				
				var existing_booking_date_time = booking_docs[i].booking_date+' '+booking_docs[i].booking_time;
				var existing_booking_date_time_timestamp = new Date(existing_booking_date_time).getTime();
				//one hour before timestamp
				var onehourmiliseconds = (1/2) * 3600 * 1000; //later changed it to half hour
				var checking_start_timestamp = new Date(existing_booking_date_time_timestamp - onehourmiliseconds).getTime();
				
				if(cat_subcat_details.price_status == 1) {
					var booking_hour = parseInt(booking_docs[i].hour) + (1/2); //half hour added
					var booking_miliseconds = booking_hour * 3600 * 1000;
					var checking_end_timestamp = new Date(existing_booking_date_time_timestamp + booking_miliseconds).getTime();
				} else if(cat_subcat_details.price_status == 2) {
					console.log(cat_subcat_details.fixed_price_hour);
					var booking_hour = parseInt(cat_subcat_details.fixed_price_hour) + (30); //30 minutes added.
					console.log(booking_hour);
					var booking_miliseconds = booking_hour * 60000;
					console.log(booking_miliseconds);
					var checking_end_timestamp = new Date(existing_booking_date_time_timestamp + booking_miliseconds).getTime();
				}
				
				var applying_booking_start_date_time = booking_date+' '+booking_time;
				var applying_booking_start_timestamp = new Date(applying_booking_start_date_time).getTime();
				if(price_status == 1) {
					var applying_booking_hour = parseInt(total_hour);
					var applying_booking_miliseconds = applying_booking_hour * 3600 * 1000;
					var applying_booking_end_timestamp = new Date(applying_booking_start_timestamp + applying_booking_miliseconds).getTime();
				} else if(price_status == 2) {
					var applying_booking_hour = parseInt(fixed_price_hour); //in minutes
					var applying_booking_miliseconds = applying_booking_hour * 60000;
					var applying_booking_end_timestamp = new Date(applying_booking_start_timestamp + applying_booking_miliseconds).getTime();
				}
				
				if((applying_booking_start_timestamp >= checking_start_timestamp && applying_booking_start_timestamp <= checking_end_timestamp) || (applying_booking_end_timestamp >= checking_start_timestamp && applying_booking_end_timestamp <= checking_end_timestamp))
				{
					return 'exists1';
				}
			}
			return 'not exists';
		}
		else
		{
			return 'not exists';
		}
	},
	getCurrentTimeWithTimeZone: async function(cat_subcat_details) {
		var timezone_value = cat_subcat_details.timezone_value;
		var n = new Date(0,0);
		n.setSeconds(+timezone_value * 60 * 60);
		var converted_timezone_val = (n.toTimeString().slice(0, 8));
		//console.log(converted_timezone_val);
		var converted_timezone_val_arr = converted_timezone_val.split(":");
		var converted_timezone_val_hour = converted_timezone_val_arr[0];
		var converted_timezone_val_minutes = converted_timezone_val_arr[1];
		
		var a = new Date().getTime();
		var date = new Date(a);
		var utc_hour = date.getUTCHours();       // GMT Hour 
		var utc_minutes = date.getUTCMinutes();  // GMT Minutes
		
		var local_time = addGMTWithLocalTime(utc_hour,utc_minutes,converted_timezone_val_hour,converted_timezone_val_minutes);
		
		const d2 = new Date();
		const result = d2.toUTCString();
		var utc_date = ''+new Date(result).getDate();
		if(utc_date.length < 2) {
			utc_date = '0'+utc_date;
		}
		var utc_month = ''+(new Date(result).getMonth() + 1);
		if(utc_month.length < 2) {
			utc_month = '0'+utc_month;
		}
		var utc_year = new Date(result).getFullYear();
		//var local_date = utc_year+'-'+utc_month+'-'+utc_date+' '+local_time;
		var local_date = utc_date+'-'+utc_month+'-'+utc_year+' '+local_time;
		return local_date;
	},
	chkTimeAvailableForExtension: async function(booking_date,service_provider_id,end_timestamp,time_extension,booking_id) {
		console.log('booking_date',booking_date);
		console.log('service_provider_id',service_provider_id);
		let booking_docs = await Booking.find({ "booking_date":booking_date, "accepted_by": service_provider_id, "booking_status":{ $ne: 2 }, "_id":{ $ne: booking_id } }).exec();
		console.log('booking_docs',booking_docs);
		if(booking_docs.length > 0)
		{
			//var extension_time_miliseconds = parseInt(time_extension) * 60 * 1000;
			//var after_added_ex_time = (parseInt(end_timestamp) + extension_time_miliseconds);
			//console.log('after_added_ex_time',after_added_ex_time);
			
			var current_booking_end_timestamp = end_timestamp;
			console.log('current_booking_end_timestamp',current_booking_end_timestamp);
			
			for(let i = 0; i < booking_docs.length; i++)
			{
				var existing_booking_date_time = booking_docs[i].booking_date+' '+booking_docs[i].booking_time;
				console.log('existing_booking_date_time',existing_booking_date_time);
				var existing_booking_date_time_timestamp = new Date(existing_booking_date_time).getTime();
				console.log('existing_booking_date_time_timestamp',existing_booking_date_time_timestamp);
				
				var diff = (existing_booking_date_time_timestamp - current_booking_end_timestamp) / 1000 / 60;
				console.log('diff',diff);
				console.log('time_extension',time_extension);
				if(time_extension == 30)
				{
					if(diff >=0 && diff <= 59)
					{
						return 'exists';
					}
				}
				if(time_extension == 60)
				{
					if(diff >=0 && diff <= 89)
					{
						return 'exists';
					}
				}
			}
			return 'not exists';
		}
		else
		{
			return 'not exists';
		}
	},
	getPlaceWiseQueryCategory: async function(latitude, longitude) {
		//console.log(latitude);
		//console.log(longitude);
		
		let place_docs = await QueryCategoryAreaPlace.find({},'place_name').exec();
		cat_places = place_docs.map(z=>z.place_name);
		//console.log('cat_places',cat_places);
		
		var google_places_details = await getGooglePlaces(latitude,longitude);
		const google_places_details_array = google_places_details.results;
		google_places = google_places_details_array.map(x=>x.formatted_address);
		//console.log('google_places',google_places);
		
		for (var i = 0; i < google_places.length; i++)
		{
			for(var s = 0; s < cat_places.length; s++)
			{
				if(google_places[i] == cat_places[s]) {
					var user_place = cat_places[s];
					break;
				}
			}
		}
		
		let cat_id_docs = await QueryCategoryAreaPlace.find({"place_name":user_place}).exec();
		cat_id_arr = cat_id_docs.map(y=>y.category_id);
		return cat_id_arr;
	},
	saveSPTransaction: async function(transactionData) {
		var wallet_details = await Wallet.findOne({ "user_id" : transactionData.user_id }).exec();
		
		var month = await getMonth(transactionData.only_date);
		var d = new Date(transactionData.only_date);
		var year = d.getFullYear();
		
		if(wallet_details) {
			var existing_amount = wallet_details.total_money;
			var wallet_status = 1;
		} else {
			var existing_amount = 0;
			var wallet_status = 0;
		}
		
		if(wallet_status == 1) {
			var added_money = (wallet_details.total_money) + parseInt(transactionData.transact_money);
			Wallet.updateOne({"user_id": transactionData.user_id }, { 
				total_money: added_money,
				last_transact_date_time: transactionData.date_time,
				currency: transactionData.currency,
			}).exec();
		} else {
			var wallet_data = new Wallet({
				user_id: transactionData.user_id,
				user_type: transactionData.user_type,
				total_money: transactionData.transact_money,
				last_transact_date_time: transactionData.date_time,
				currency: transactionData.currency,
			});
			wallet_data.save();
		}
		
		const transact_data = new WalletTransact({
			user_id: transactionData.user_id,
			user_type: transactionData.user_type,
			transact_money: transactionData.transact_money,
			currency: transactionData.currency,
			booking_id: transactionData.booking_id,
			booking_type: transactionData.booking_type,
			transact_date_time: transactionData.transact_date_time,
			transact_type: transactionData.transact_type,
			payment_type: transactionData.payment_type,
			date_time: transactionData.date_time,
			only_date: transactionData.only_date,
			month: month,
			year: year,
			description: transactionData.description,
		});
		transact_data.save();
	},
	getLanguage: async function(user_id,data_arr) {
		//console.log(data_arr.length);
		var user_data = await User.findOne({"_id":user_id}).exec();
		//console.log('user_data',user_data);
		if(user_data.language == 'eng') {
			var language = 'english';
		} else {
			var language = 'arabic';
		}
		//console.log('language',language);
		language_array = [];
		
		for(i=0; i < data_arr.length; i++)
		{
			let lan_docs = await Language.findOne({"slug":data_arr[i]},language).exec();
			if(language == 'english') {
				language_array.push(lan_docs.english);
			} else {
				language_array.push(lan_docs.arabic);
			}
		}
		//console.log('language_array',language_array);
		return language_array;
	},
	getLanguageAdmin: async function(user_id,data_arr) {
		//console.log(data_arr.length);
		var user_data = await Admin.findOne({"_id":user_id}).exec();
		//console.log('user_data',user_data);
		if(user_data.language == 'eng') {
			var language = 'english';
		} else {
			var language = 'arabic';
		}
		//console.log('language',language);
		language_array = [];
		
		for(i=0; i < data_arr.length; i++)
		{
			let lan_docs = await Language.findOne({"slug":data_arr[i]},language).exec();
			if(language == 'english') {
				language_array.push(lan_docs.english);
			} else {
				language_array.push(lan_docs.arabic);
			}
		}
		//console.log('language_array',language_array);
		return language_array;
	}
};

module.exports = methods;