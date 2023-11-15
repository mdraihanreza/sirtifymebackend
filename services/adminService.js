let async = require("async");
let jwt = require('jsonwebtoken');
let nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const config = require('../config');
let moment = require('moment');
var Jimp = require('jimp');
var ffmpeg = require('ffmpeg');
const https = require('https')

const fs = require('fs');
const pdf = require('html-pdf');
const puppeteer = require('puppeteer')
let gm = require('gm');
const db = config.db;

let local_siteurl = 'http://localhost/';
let staging_siteurl = 'https://sirtifymebackend.elvirainfotech.org/';
//let transporter = nodemailer.createTransport('smtps://avijit.team@gmail.com:avijit_team@smtp.gmail.com');
/*let transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'rahul.brainium@gmail.com',
		pass: 'hnkbnbjabsajocbz'
	}
});*/

let notificationPage = require('../helper/notification');
var generalHelper = require('../helper/general_helper');
const User = require('../model/user');
const UserLicense = require('../model/user_license');
const UserAdditonalLicense = require('../model/user_additional_license');
const UserCertificate = require('../model/user_certificate');
const UserAdditonalCertificate = require('../model/user_additional_certificate');
const UserEmployement = require('../model/user_employement');
const UserMedicalHistory = require('../model/user_medical_history');
const UserEducation = require('../model/user_education');
const UserReference = require('../model/user_reference');
const LegalQuestion = require('../model/legal_question');
const UserLegalQuestionAnswer = require('../model/user_legal_question_answer');
const CMS = require('../model/cms');
const PrivacyPolicy = require('../model/PrivacyPolicy');
const Admin = require('../model/admin');
const FAQ = require('../model/faq');
const Testimonial = require('../model/testimonial');
const Dreamjob = require('../model/dreamjob');
const ConnectionRequest = require('../model/connection_request');
const UserAdditionalEducation = require('../model/user_additional_education');
const UserAdditionalEmployment = require('../model/user_additional_employement');
const ContactUs = require('../model/contactus');


// Create thumbnail from video 
function makeThumimg2(files, vpath, tpath) {
	/*var proc = new ffmpeg('/path/to/your_movie.avi')
  .takeScreenshots({
	  count: 1,
	  timemarks: [ '600' ] // number of seconds
	}, '/path/to/thumbnail/folder', function(err) {
	console.log('screenshots were saved')
  });*/
	console.log('<<vpath>>', vpath);
	console.log('<<tpath>>', tpath);
	let filename = "videothumb" + Date.now() + ".jpg";

	//console.log('<<filename>>',filename);
	/*var proc = new ffmpeg(vpath)
	.takeScreenshots({
		count: 1,
		timemarks: [ '5' ], // number of seconds
		filename: filename,
		size: '500x500'
	  }, tpath, function(err) {
	  console.log('screenshots were saved')
	});*/
	/*ffmpeg(vpath)
	 .screenshots({
	   timestamps: [30.5, '50%', '01:10.123'],
	   filename: filename,
	   folder: tpath,
	   size: '320x240'
	 });*/
	try {
		var process = new ffmpeg(vpath);
		//console.log('<<processprocessprocess>>>',process);
		process.then(function (video) {
			//console.log('<<pppppp>>>',video);
			// Callback mode
			video.fnExtractFrameToJPG(tpath, {
				frame_rate: 1,
				number: 5,
				file_name: filename //'my_frame_%t_%s'
			}, function (error, files) {
				if (!error)
					console.log('Frames: ' + files);
				console.log('++++++++ok++++ ');
			});
		}, function (err) {
			console.log('Error: ' + err);
		});
	} catch (e) {
		console.log(e.code);
		console.log(e.msg);
		console.log('*+++***else********');
	}
	return filename;
}

function makeThumimg(vpath, tpath) {
	console.log('<vpath>', vpath);
	let filename = "videothumb" + Date.now() + ".jpg";
	try {
		console.log("1", vpath);
		var process = new ffmpeg(vpath);
		console.log("2");
		process
			.then(function (video) {
				/* video.fnExtractFrameToJPG(tpath, {
					 every_n_frames : 1
				 }) //myCallbackFunction()
				 /*)*/



				video.fnExtractFrameToJPG(tpath, {
					frame_rate: 1,
					number: 1,
					file_name: filename//'abc.jpg'
				}, function (error, files) {
					if (!error) {
						//	console.log('Frames: ' + files);

					} else {
						// console.log('error: ' + error);
					}
				});


			})
			.catch(function (err) {
				//console.log("3");
				//console.log('Error: ' + err);
				//console.log("4");
			})
	} catch (e) {
		//console.log("5");
		//console.log(e.code);
		// console.log(e.msg);
	}
	console.log("6");
	return filename;
}
//Create token while sign in
function createToken(admin) {
	let tokenData = {
		id: admin._id,
		email: admin.email.toLowerCase()
	};
	let token = jwt.sign(tokenData, config.secretKey, {
		//expiresIn: '48h'
	});
	return token;
}


function escapeForRegex(str) {
	if (!str) return '';
	//let result=str.replace(/[\\\(\)\{\}\[\]\^\$\*\+]/g,'');
	//result = result.replace(/\./g,'\\.');
	//return result;
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createTimestamp(datetime) {
	var n = new Date(datetime);
	var d = n.getTime();
	return d;
}

function createIntegerTime(time_str, time_unit) {
	//console.log(time_str); return false;
	const myArray = time_str.split(":");
	if (time_unit == 'PM') {
		var hour = parseInt(myArray[0]) + 12;
	} else {
		var hour = myArray[0];
	}
	var int_time = hour + myArray[1];
	return parseInt(int_time);
}
function convertTimeTo12(time_str) {
	const myArray = time_str.split(":");
	if (myArray[0] <= 12) {
		var new_time = myArray[0].concat(":", myArray[1]);
	} else {
		var hour = ((parseInt(myArray[0]) + 11) % 12 + 1);
		var hour = (hour < 10 ? '0' : '') + hour;
		var new_time = hour.concat(":", myArray[1]);
	}
	return new_time;
}
function getDatesBetweenTwoDates(startDate, stopDate) {
	console.log('startDate', startDate);
	for (var arr = [], dt = new Date(startDate); dt <= new Date(stopDate); dt.setDate(dt.getDate() + 1)) {
		arr.push(new Date(dt));
	}
	return arr;
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






function addGMTWithLocalTime(gmt_hout, gmt_minutes, timezone_hour, timezone_minutes) {
	var added_h = parseInt(gmt_hout) + parseInt(timezone_hour);
	var added_m = parseInt(gmt_minutes) + parseInt(timezone_minutes);

	if (added_m >= 60) {
		var h = Math.floor(added_m / 60);
		var m = added_m % 60;
	}
	else {
		var h = 0;
		var m = 0
	}

	var total_h = parseInt(added_h) + parseInt(h);
	if (m > 0) {
		var total_m = '' + m;
		if (total_m.length < 2)
			total_m = '0' + total_m;
	} else {
		var total_m = '' + added_m;
		if (total_m.length < 2)
			total_m = '0' + total_m;
	}

	return total_h + ':' + total_m;
}

function timeStampToDateTime(timestamp) {
	console.log('timestamp', timestamp);
	var date = new Date(timestamp);
	return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}
function getMonth(date)
{
	const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	
	const d = new Date(date);
	return monthNames[d.getMonth()];
}


let adminService = {
	adminLogin: function (loginData, callback) {
		async.waterfall([
			function (nextcb) {
				if (!loginData.hasOwnProperty('email') || loginData.email.trim() == '') {
					callback({ success: false, type: "Validation error", message: "Valid username/email is required." });
				} else if (!loginData.hasOwnProperty('password') || loginData.password.trim() == '') {
					callback({ success: false, type: "Validation error", message: "Password is required." });
				} else {
					nextcb(null, loginData);
				}
			},
			function (loginData, nextcb) {
				var query = {};
				query['$or'] = [
					{ user_name: loginData.email },
					{ email: loginData.email },
				];
				query.status = 1;

				Admin.findOne(query).exec().then((docs) => {
					if (docs) {
						if (!bcrypt.compareSync(loginData.password, docs.password)) {
							console.log('cccccccccccc');
							callback({ success: false, type: "Validation error", message: "Invalid login credentials." });
						} else {
							let token = createToken(docs);
							nextcb(null, token, docs);
						}
					} else {
						callback({ success: false, type: "Validation error", message: "Invalid login credentials." });
					}
				}).catch((e) => {
					throw e;
				});
			}
		],
		function (err, token, adminDetails) {
			if (err) {
				callback({ success: false, message: "Some internal error has occured", Error: err });
			} else {
				callback({ success: true, message: "Login Successful", adminData: adminDetails, token: token });
			}
		});
	},
	// generatePassword: async function (loginData, callback) {
	// 	console.log('loginData',loginData);
	// 	let password_hash = bcrypt.hashSync(loginData.password, 10);
	// 	console.log('password_hash',password_hash);
	// },

	adminProfile: async function (authData, callback) {
		let docs = await Admin.findOne({ "_id": authData.id }).exec();
		if (docs) {
			callback({ success: true, message: "Admin data fetched", data: docs });
		} else {
			callback({ success: false, type: "Critical error", message: "Valid user not found with supplied token." });
		}
	},
	saveFAQ: async function (authData, faqData, callback) {
		if (faqData.question == '') {
			callback({success: false,type:"Validation error",message: "Question is required." });
			return false;
		}
		if (faqData.answer == '') {
			callback({success: false,type:"Validation error",message: "Answer is required." });
			return false;
		}

		const faq_data = new FAQ({
			question: faqData.question,
			answer: faqData.answer
		});
		faq_data.save();

		callback({ success: true, message: 'FAQ saved successfully' });
	},
	saveQuestion: async function (authData, legalData, callback) {
		if (legalData.question == '') {
			callback({success: false,type:"Validation error",message: "Question is required." });
			return false;
		}
		
		const legal_data = new LegalQuestion({
			question: legalData.question
		});
		legal_data.save();

		callback({ success: true, message: 'Question added successfully' });
	},
	saveprivacy: async function (authData, privacyData, callback) {
		console.log(privacyData,'privacyData')
		if (privacyData.content == '') {
			callback({success: false,type:"Validation error",message: "content is required." });
			return false;
		}else{
		
			const PrivacyPolicyData = new PrivacyPolicy({
			content: privacyData.content,
			slug: privacyData.slug
		});
			console.log(PrivacyPolicyData,'privacy_data')
		PrivacyPolicyData.save();

		callback({ success: true, message: 'Data added successfully' });
		}
		
		
	},
	getQuestionList: async function (authData, callback) {
		var question_list = await LegalQuestion.find({}).exec();
		if(question_list.length > 0)
		{
			var question_arr = [];
			for(var i = 0; i < question_list.length; i++)
			{
				question_arr.push({
					question_id: question_list[i]._id,
					question: question_list[i].question.slice(0,20)+'...',
				})
			}
			callback({ success: true, message: "Question list fetched", data: question_arr });
		}
		else
		{
			callback({ success: false, message: "No data found" });
		}
	},
   deleteQuestion: async function (authData, question_id, callback) {
	  if(!question_id) {
			callback({ success: false, message: "Question_id id required" });
		}
	  await LegalQuestion.deleteOne({"_id": question_id }).exec();

		callback({ success: true, message: "Question deleted successfully" });
	},
	saveTestimoial: async function (authData, testimonialData, docFile, callback) {
		if(testimonialData.name == '') {
			callback({success: false, type:"Validation error", message: "Name is required." });
			return false;
		}
		if(testimonialData.designation == '') {
			callback({success: false, type:"Validation error", message: "Designation is required." });
			return false;
		}
		if(testimonialData.testimonial == '') {
			callback({success: false, type:"Validation error", message: "testimonial is required." });
			return false;
		}

		if(docFile.image.name.trim() != '') {
			var ext = docFile.image.name.slice(docFile.image.name.lastIndexOf('.'));
			var image = "image"+ '1' + Date.now() + ext;
			var folderpath = 'public/testimonial/';

			docFile.image.mv(folderpath + image);
		}

		const t_data = new Testimonial({
			name: testimonialData.name,
			designation: testimonialData.designation,
			testimonial: testimonialData.testimonial,
			image: image
		});
		t_data.save();
		
		callback({ success: true, message: 'Testimonial saved successfully' });
	},
	getTestimonialList: async function (authData, callback) {
		var testimonial_list = await Testimonial.find({}).exec();
		if(testimonial_list.length > 0)
		{
			var testimonial_arr = [];
			for(var i = 0; i < testimonial_list.length; i++)
			{
				var p_image = staging_siteurl+'public/testimonial/'+testimonial_list[i].image;

				testimonial_arr.push({
					testimonial_id: testimonial_list[i]._id,
					name: testimonial_list[i].name,
					designation: testimonial_list[i].designation,
					testimonial: testimonial_list[i].testimonial.slice(0,100)+'...',
					image: p_image
				})
			}
			callback({ success: true, message: "Testimonial list fetched", data: testimonial_arr });
		}
		else
		{
			callback({ success: false, message: "No data found" });
		}
	},
	getContactUs: async function (authData, callback) {
		var ContactUs_list = await ContactUs.find({}).exec();
		if(ContactUs_list.length > 0)
		{
			var ContactUs_arr = [];
			for(var i = 0; i < ContactUs_list.length; i++)
			{
				

				ContactUs_arr.push({
					contact_id: ContactUs_list[i]._id,
					name: ContactUs_list[i].name,
					email: ContactUs_list[i].email,
					phone_no: ContactUs_list[i].phone_no,
					comment: ContactUs_list[i].comment
					
				})
			}
			console.log(ContactUs_arr);
			callback({ success: true, message: "Contact us list fetched", data: ContactUs_arr });
		}
		else
		{
			callback({ success: false, message: "No data found" });
		}	
	},
	getTestimonialDetailsById: async function (authData, testimonial_id, callback) {
		if(!testimonial_id || testimonial_id == '') {
			callback({ success: false, message: "Testimonial id required" });
		}
		var testimonial_list = await Testimonial.findOne({ "_id": testimonial_id }).exec();
		if(testimonial_list) {
			var p_image = staging_siteurl+'public/testimonial/'+testimonial_list.image;

			const testimonial_obj = {
				testimonial_id: testimonial_list._id,
				name: testimonial_list.name,
				designation: testimonial_list.designation,
				testimonial: testimonial_list.testimonial,
				image: p_image
			}
			callback({ success: true, message: "Testimonial details fetched", data: testimonial_obj });
		} else {
			callback({ success: false, message: "No data found" });
		}
	},
	updateTestimoial: async function (authData, testimonialData, docFile, callback) {
		if(testimonialData.testimonial_id == '') {
			callback({success: false, type:"Validation error", message: "Testimonial id is required." });
			return false;
		}
		if(testimonialData.name == '') {
			callback({success: false, type:"Validation error", message: "Name is required." });
			return false;
		}
		if(testimonialData.designation == '') {
			callback({success: false, type:"Validation error", message: "Designation is required." });
			return false;
		}
		if(testimonialData.testimonial == '') {
			callback({success: false, type:"Validation error", message: "testimonial is required." });
			return false;
		}
		if(docFile) {
			if(docFile.image.name.trim() != '') {
				var ext = docFile.image.name.slice(docFile.image.name.lastIndexOf('.'));
				var image = "image"+ '1' + Date.now() + ext;
				var folderpath = 'public/testimonial/';
				docFile.image.mv(folderpath + image);

				Testimonial.updateOne({ "_id": testimonialData.testimonial_id },{
					"image": image
				}).exec();
			}
		}
		Testimonial.updateOne({ "_id": testimonialData.testimonial_id },{
			"name": testimonialData.name,
			"designation": testimonialData.designation,
			"testimonial": testimonialData.testimonial,
			"dom": new Date(),
		}).exec();

		callback({ success: true, message: 'Testimonial updated successfully' });
	},
	deleteTestimonial: async function (authData, testimonial_id, callback) {
		if(!testimonial_id) {
			callback({ success: false, message: "Testimonial id required" });
		}
		await Testimonial.deleteOne({"_id": testimonial_id }).exec();

		callback({ success: true, message: "Testimonial deleted successfully" });
	},
	getDreamjobList: async function (authData, callback) {
		var dreamjob_list = await Dreamjob.find({}).exec();
		if(dreamjob_list.length > 0)
		{
			var dreamjob_arr = [];
			for(var i = 0; i < dreamjob_list.length; i++)
			{
				var p_image = staging_siteurl+'public/dreamjob/'+dreamjob_list[i].image;

				dreamjob_arr.push({
					dreamjob_id: dreamjob_list[i]._id,
					name: dreamjob_list[i].name,
					designation: dreamjob_list[i].designation,
					image: p_image
				})
			}
			callback({ success: true, message: "Dreamjob list fetched", data: dreamjob_arr });
		}
		else
		{
			callback({ success: false, message: "No data found" });
		}
	},
	getDreamjobDetailsById: async function (authData, dreamjob_id, callback) {
		if(!dreamjob_id || dreamjob_id == '') {
			callback({ success: false, message: "Dream Job id required" });
		}
		var dreamjob_list = await Dreamjob.findOne({ "_id": dreamjob_id }).exec();
		if(dreamjob_list) {
			var p_image = staging_siteurl+'public/dreamjob/'+dreamjob_list.image;

			const dreamjob_obj = {
				dreamjob_id: dreamjob_list._id,
				name: dreamjob_list.name,
				designation: dreamjob_list.designation,
				image: p_image
			}
			callback({ success: true, message: "Dreamjob details fetched", data: dreamjob_obj });
		} else {
			callback({ success: false, message: "No data found" });
		}
	},
	updateDreamjob: async function (authData, dreamjobData, docFile, callback) {
		if(dreamjobData.dreamjob_id == '') {
			callback({success: false, type:"Validation error", message: "Dreamjob id is required." });
			return false;
		}
		if(dreamjobData.name == '') {
			callback({success: false, type:"Validation error", message: "Name is required." });
			return false;
		}
		if(dreamjobData.designation == '') {
			callback({success: false, type:"Validation error", message: "Designation is required." });
			return false;
		}
		
		if(docFile) {
			if(docFile.image.name.trim() != '') {
				var ext = docFile.image.name.slice(docFile.image.name.lastIndexOf('.'));
				var image = "image"+ '1' + Date.now() + ext;
				var folderpath = 'public/dreamjob/';
				docFile.image.mv(folderpath + image);

				Dreamjob.updateOne({ "_id": dreamjobData.dreamjob_id },{
					"image": image
				}).exec();
			}
		}
		Dreamjob.updateOne({ "_id": dreamjobData.dreamjob_id },{
			"name": dreamjobData.name,
			"designation": dreamjobData.designation,
			"dom": new Date(),
		}).exec();

		callback({ success: true, message: 'Dreamjob updated successfully' });
	},
	deleteDreamjob: async function (authData, dreamjob_id, callback) {
		if(!dreamjob_id) {
			callback({ success: false, message: "Dreamjob id required" });
		}
		await Dreamjob.deleteOne({"_id": dreamjob_id }).exec();

		callback({ success: true, message: "Dreamjob deleted successfully" });
	},
	// providerList: async function (authData, search_word, user_type, page, limit, callback) {
	// 	if(!page || page === 0) {
	// 		callback({ success: false, message: "Page is mandatory" });
	// 		return false;
	// 	}
	// 	if(!limit || limit === 0) {
	// 		callback({ success: false, message: "Limit is mandatory" });
	// 		return false;
	// 	}
	// 	var query = {};
	// 	if(search_word) {
	// 		var search_val = escapeForRegex(search_word).replace(/\s+/g, '|');
	// 		query['$or'] = [
	// 			{ name: new RegExp(search_val, 'gi') },
	// 			{ email: new RegExp(search_val, 'gi') },
	// 		];
	// 	}
	// 	if(user_type && user_type > 0) {
	// 		query.user_type = { "$in": user_type };
	// 	} else {
	// 		query.user_type = { "$in": [1,2,3] };
	// 	}

	// 	var providers = await User.find(query)
	// 					.limit(limit * 1)
	// 					.skip((page - 1) * limit)
	// 					.exec();

	// 	const total_provider_count = await User.countDocuments(query);

	// 	if(providers.length > 0)
	// 	{
	// 		var p_data = [];
	// 		for(var i = 0; i < providers.length; i++) {
	// 			if(providers[i].user_type == 1) {
	// 				var designation = 'Physican Assistant';
	// 			} else if(providers[i].user_type == 2) {
	// 				var designation = 'Nurse';
	// 			} else if(providers[i].user_type == 3) {
	// 				var designation = 'Physican';
	// 			}

	// 			if(providers[i].profile_picture == null) {
	// 				var profile_img = null;
	// 			} else {
	// 				var profile_img = staging_siteurl+'public/profile_image/'+providers[i].profile_picture;
	// 			}

	// 			var employment_data = await UserEmployement.findOne({"user_id": providers[i]._id}).sort({"_id":-1}).exec();
	// 			if(employment_data) {
	// 				var company_name = employment_data.job_name;
	// 			} else {
	// 				var company_name = "";
	// 			}
				
	// 			p_data.push({
	// 				_id: providers[i]._id,
	// 				user_type: providers[i].user_type,
	// 				name: providers[i].name,
	// 				email: providers[i].email,
	// 				phone_no: providers[i].mobile_no,
	// 				designation: designation,
	// 				profile_img: profile_img,
	// 				company_name: company_name,
	// 			});
	// 		}
	// 		callback({ success: true, message: "Provider list fetched", data: p_data, totalPages: Math.ceil(total_provider_count / limit), currentPage: page });
	// 	}
	// 	else
	// 	{
	// 		callback({ success: false, message: "No data found" });
	// 	}
	// },
	providerList: async function (authData, search_word, user_type, callback) {
		var query = {};
		if(search_word) {
			var search_val = escapeForRegex(search_word).replace(/\s+/g, '|');
			query['$or'] = [
				{ name: new RegExp(search_val, 'gi') },
				{ email: new RegExp(search_val, 'gi') },
			];
		}
		if(user_type && user_type > 0) {
			query.user_type = { "$in": user_type };
		} else {
			query.user_type = { "$in": [1,2,3] };
		}

		var providers = await User.find(query).exec();

		if(providers.length > 0)
		{
			var p_data = [];
			for(var i = 0; i < providers.length; i++) {
				if(providers[i].user_type == 1) {
					var designation = 'Physican Assistant';
				} else if(providers[i].user_type == 2) {
					var designation = 'Nurse';
				} else if(providers[i].user_type == 3) {
					var designation = 'Physican';
				}

				if(providers[i].profile_picture == null) {
					var profile_img = staging_siteurl+'public/no_image.png';
				} else {
					var profile_img = staging_siteurl+'public/profile_image/'+providers[i].profile_picture;
				}

				var employment_data = await UserEmployement.findOne({"user_id": providers[i]._id}).sort({"_id":-1}).exec();
				if(employment_data) {
					var company_name = employment_data.job_name;
				} else {
					var company_name = "";
				}
				
				p_data.push({
					_id: providers[i]._id,
					user_type: providers[i].user_type,
					name: providers[i].name,
					email: providers[i].email,
					phone_no: providers[i].mobile_no,
					designation: designation,
					profile_img: profile_img,
					company_name: company_name,
				});
			}
			callback({ success: true, message: "Provider list fetched", data: p_data});
		}
		else
		{
			callback({ success: false, message: "No data found" });
		}
	},
	ProviderConnectionData: async function (authData,non_provider_id, callback) {
    var connection_details = await ConnectionRequest.find({ "non_provider_id":non_provider_id }).exec();
    if(connection_details.length > 0)
    {
        var connection_arr = [];
        for(var i = 0; i < connection_details.length; i++)
        {
            var user_details = await User.findOne({ "_id": connection_details[i].provider_id }).exec();
            var user_name = user_details.name;
            var email = user_details.email;
            var mobile_no = user_details.mobile_no;
            if(user_details.profile_picture == null) {
                var profile_img = null;
            } else {
                var profile_img = staging_siteurl+'public/profile_image/'+user_details.profile_picture;
            }

            if(user_details.user_type == 1) {
                var designation = 'Physican Assistant';
            } else if(user_details.user_type == 2) {
                var designation = 'Nurse';
            } else if(user_details.user_type == 3) {
                var designation = 'Physican';
            }

            connection_arr.push({
                connection_id: connection_details[i]._id,
                provider_id: connection_details[i].provider_id,
                non_provider_id: connection_details[i].non_provider_id,
                user_name: user_name,
				connection_status: connection_details[i].connection_status,
                email: email,
                profile_img: profile_img,
                designation: designation,
                mobile_no: mobile_no,
            });
        }
        callback({ success: true, message: "Connection list", data: connection_arr});
    }
    else
    {
        callback({ success: false, message: "No data found" });
    }
},
	viewProviderPersonalDetails: async function (authData, user_id, callback) {
		User.findOne({ "_id": user_id }).exec().then((docs) => {
			if(docs) 
			{
				if(docs.profile_picture == null) {
					var profile_img = null;
				} else {
					var profile_img = staging_siteurl+'public/profile_image/'+docs.profile_picture;
				}
	
				var user_profile_data = {
					user_id: docs._id,
					name: docs.name,
					email: docs.email,
					mobile_no: docs.mobile_no,
					country_code: docs.country_code,
					only_mobile_no: docs.only_mobile_no,
					profile_picture: profile_img,
					user_type: docs.user_type,
				};
				callback({ success: true, message: 'User details', data: user_profile_data });
			}
			else
			{
				callback({ success: false,type:"Critical error",message: "No data found." });
			}
		}).catch((e) => {
			callback({ success: false,type:"Server error",message: "Error in user findings.",Eorror: e });
		});
	},
	viewProviderLicensureDetails: async function (authData, user_id, callback) {
		if(!user_id || user_id == "") {
			callback({success: false,type:"Critical error",message: "User id required."});
		}
		var user_lisence_data = await UserLicense.findOne({ "user_id": user_id }).exec();
		if(user_lisence_data) {
			if(user_lisence_data.national_license_file == null) {
				var national_license_file = null;
			} else {
				var national_license_file = staging_siteurl+'public/national_license_file/'+user_lisence_data.national_license_file;
			}
			if(user_lisence_data.state_license_file == null) {
				var state_license_file = null;
			} else {
				var state_license_file = staging_siteurl+'public/state_license_file/'+user_lisence_data.state_license_file;
			}
			if(user_lisence_data.cds_license_file == null) {
				var cds_license_file = null;
			} else {
				var cds_license_file = staging_siteurl+'public/cds_license_file/'+user_lisence_data.cds_license_file;
			}
			if(user_lisence_data.dea_license_file == null) {
				var dea_license_file = null;
			} else {
				var dea_license_file = staging_siteurl+'public/dea_license_file/'+user_lisence_data.dea_license_file;
			}

			var license_data = {
				user_id: user_lisence_data.user_id,
				national_license_file: national_license_file,
				national_license_issue_date: user_lisence_data.national_license_issue_date,
				national_license_expiry_date: user_lisence_data.national_license_expiry_date,
				national_license_status: user_lisence_data.national_license_status, 
				state_license_file: state_license_file,
				state_license_issue_date: user_lisence_data.state_license_issue_date,
				state_license_expiry_date: user_lisence_data.state_license_expiry_date,
				state_license_status: user_lisence_data.state_license_status,
				cds_license_file: cds_license_file,
				cds_license_issue_date: user_lisence_data.cds_license_issue_date,
				cds_license_expiry_date: user_lisence_data.cds_license_expiry_date,
				cds_license_status: user_lisence_data.cds_license_status,
				dea_license_file: dea_license_file,
				dea_license_issue_date: user_lisence_data.dea_license_issue_date,
				dea_license_expiry_date: user_lisence_data.dea_license_expiry_date,
				dea_license_status: user_lisence_data.dea_license_status,
			};

			var user_additional_lisence_data = await UserAdditonalLicense.find({"user_id": user_id }).exec();
			
			var additional_license_result = [];
			if(user_additional_lisence_data.length > 0)
			{
				for (var i = 0; i < (user_additional_lisence_data.length); i++) {
					var license_file = staging_siteurl+'public/additional_license/'+user_additional_lisence_data[i].license_file;
					additional_license_result.push({
						additiona_license_id: user_additional_lisence_data[i]._id,
						license_file : license_file,
						license_name: user_additional_lisence_data[i].license_name,
						license_issue_date: user_additional_lisence_data[i].license_issue_date,
						license_expiry_date: user_additional_lisence_data[i].license_expiry_date,
					});
				}
			}
			callback({ success: true, message: 'License details', data: license_data, additional_data: additional_license_result });
		} else {
			callback({ success: false,type:"Critical error", message: "Data not found." });
		}
	},
	viewProviderCertificateDetails: async function (authData, user_id, callback) {
		if(!user_id || user_id == "") {
			callback({success: false,type:"Critical error",message: "User id required."});
		}
		var user_certificate_data = await UserCertificate.findOne({ "user_id": user_id }).exec();
		if(user_certificate_data) {
			if(user_certificate_data.bls_file == null) {
				var bls_file = null;
			} else {
				var bls_file = staging_siteurl+'public/certificate/'+user_certificate_data.bls_file;
			}
			if(user_certificate_data.acls_file == null) {
				var acls_file = null;
			} else {
				var acls_file = staging_siteurl+'public/certificate/'+user_certificate_data.acls_file;
			}
			if(user_certificate_data.pls_file == null) {
				var pls_file = null;
			} else {
				var pls_file = staging_siteurl+'public/certificate/'+user_certificate_data.pls_file;
			}

			var license_data = {
				user_id: user_certificate_data.user_id,
				bls_file: bls_file,
				bls_issue_date: user_certificate_data.bls_issue_date,
				bls_expiry_date: user_certificate_data.bls_expiry_date,
				bls_status: user_certificate_data.bls_status,
				acls_file: acls_file,
				acls_issue_date: user_certificate_data.acls_issue_date,
				acls_expiry_date: user_certificate_data.acls_expiry_date,
				acls_status: user_certificate_data.acls_status,
				pls_file: pls_file,
				pls_issue_date: user_certificate_data.pls_issue_date,
				pls_expiry_date: user_certificate_data.pls_expiry_date,
				pls_status: user_certificate_data.pls_status
			};
			//console.log(license_data);
			var user_additional_certificate_data = await UserAdditonalCertificate.find({"user_id": user_id }).exec();
			
			var additional_certifcate_result = [];
			if(user_additional_certificate_data.length > 0)
			{
				for (var i = 0; i < (user_additional_certificate_data.length); i++) {
					var certificate_file = staging_siteurl+'public/certificate/'+user_additional_certificate_data[i].certificate_file;
					additional_certifcate_result.push({
						additional_certificate_id: user_additional_certificate_data[i]._id,
						certificate_file : certificate_file,
						certificate_issue_date: user_additional_certificate_data[i].certificate_issue_date,
						certificate_expiry_date: user_additional_certificate_data[i].certificate_expiry_date,
						certificate_name: user_additional_certificate_data[i].certificate_name,
					});
				}
			}
			callback({ success: true, message: 'Certificate details', data: license_data, additional_data: additional_certifcate_result });
		} else {
			callback({ success: false,type:"Critical error",message: "No data found." });
		}
	},
	viewProviderEmploymentDetails: async function (authData, user_id, callback) {
	var user_employment_data = await UserEmployement.findOne({ "user_id": user_id }).exec();
		console.log(user_id,'user_id')
	if(user_employment_data)
	{
		const emp_details = {
			employement_id: user_employment_data._id,
			c_job_name: user_employment_data.c_job_name,
			c_job_from_year : user_employment_data.c_job_from_year,
		}
		var user_additional_employement_data = await UserAdditionalEmployment.find({ "user_id": user_id }).exec();
		
		var additional_employement_result = [];
		if(user_additional_employement_data.length > 0)
		{
			for (var i = 0; i < (user_additional_employement_data.length); i++) {
				additional_employement_result.push({
					additional_employement_id: user_additional_employement_data[i]._id,
					job_name: user_additional_employement_data[i].job_name,
					employment_start_date: user_additional_employement_data[i].employment_start_date,
					employment_end_date: user_additional_employement_data[i].employment_end_date,
				});
			}
		}
		callback({ success: true, message: 'Employment details fetched', data: emp_details,additional_data:additional_employement_result });
	}
	else
	{
		callback({ success: false, message: 'No data found' });
	}
},
	viewProviderEducationDetails: async function (authData, user_id, callback) {
		var edu_data = await UserEducation.findOne({ "user_id": user_id }).exec();
		if(edu_data)
		{	
			const edu_details = {
				education_id: edu_data._id,
				ug_institute_name: edu_data.ug_institute_name,
				ug_from_year : edu_data.ug_from_year,
				ug_to_year : edu_data.ug_to_year,
				g_institute_name: edu_data.g_institute_name,
				g_from_year: edu_data.g_from_year,
				g_to_year: edu_data.g_to_year,
				g_status:  edu_data.g_status,
				med_institue_name: edu_data.med_institue_name,
				med_school_from_year: edu_data.med_school_from_year,
				med_school_to_year: edu_data.med_school_to_year,
				med_status: edu_data.med_status,
			};

			var user_additional_education_data = await UserAdditionalEducation.find({ "user_id": user_id }).exec();
			
			var additional_education_result = [];
			if(user_additional_education_data.length > 0)
			{
				for (var i = 0; i < (user_additional_education_data.length); i++) {
					additional_education_result.push({
						additional_education_id: user_additional_education_data[i]._id,
						education_name: user_additional_education_data[i].education_name,
						edu_name: user_additional_education_data[i].edu_name,
						from_year: user_additional_education_data[i].from_year,
						to_year: user_additional_education_data[i].to_year,
					});
				}
			}
			callback({ success: true, message: 'Education details fetched', data: edu_details, additional_data: additional_education_result });
		}
		else
		{
			callback({ success: false, message: 'No data found' });
		}
	},
	viewProviderLegalHistoryDetails: async function (authData, user_id, callback) {
		var ques_data = await LegalQuestion.find({}).exec();
		if(ques_data.length > 0)
		{
			var q_data = [];
			for(var i = 0; i < ques_data.length; i++) {
				var ans_exist = await UserLegalQuestionAnswer.findOne({ "user_id": user_id, "question_id": ques_data[i]._id }).exec();
				if(ans_exist) {
					var answer = ans_exist.answer;
					var explain = ans_exist.explain;
				} else {
					var answer = "";
					var explain = "";
				}
				q_data.push({
					_id: ques_data[i]._id,
					question: ques_data[i].question,
					answer: answer,
					explain:explain,
				});
			}
			callback({ success: true, message: 'Question fetched', data: q_data });
		}
		else
		{
			callback({ success: false, message: 'No data found' });
		}
	},
	viewProviderMedicalHistoryDetails: async function (authData, user_id, callback) {
		var user_medical_data = await UserMedicalHistory.findOne({ "user_id": user_id }).exec();
		if(user_medical_data)
		{
			var covid_certificate = staging_siteurl+'public/medical/'+user_medical_data.covid_certificate;
			var flu_certificate = staging_siteurl+'public/medical/'+user_medical_data.flu_certificate;
			var tetanus = staging_siteurl+'public/medical/'+user_medical_data.tetanus;
			var mmr_vaccine = staging_siteurl+'public/medical/'+user_medical_data.mmr_vaccine;
			var hepatitis_vaccine = staging_siteurl+'public/medical/'+user_medical_data.hepatitis_vaccine;
			
			const medical_history_data = {
				medical_id: user_medical_data._id,
				covid_certificate : covid_certificate,
				flu_certificate : flu_certificate,
				tetanus: tetanus,
				mmr_vaccine: mmr_vaccine,
				hepatitis_vaccine: hepatitis_vaccine,
				covid_date_1: user_medical_data.covid_date_1,
				covid_date_2: user_medical_data.covid_date_2,
				covid_date_2_status: user_medical_data.covid_date_2_status,
				covid_date_3: user_medical_data.covid_date_3,
				covid_date_3_status: user_medical_data.covid_date_3_status,
				covid_date_4: user_medical_data.covid_date_4,
				covid_date_4_status: user_medical_data.covid_date_4_status,
				flu_date: user_medical_data.flu_date,
				tetanus_date: user_medical_data.tetanus_date,
				mmr_immune: user_medical_data.mmr_immune,
				hepatitis_immune: user_medical_data.hepatitis_immune,
			};
			
			callback({ success: true, message: 'Medical details fetched', data: medical_history_data });
		}
		else
		{
			callback({ success: false, message: 'No data found' });
		}
	},
	viewProviderReferences: async function (authData, user_id, callback) {
		var ref_data = await UserReference.findOne({ "user_id": user_id }).exec();
		if(ref_data)
		{	
			const ref_details = {
				reference_id: ref_data._id,
				first_reference : ref_data.first_reference,
				second_reference : ref_data.second_reference,
				third_reference: ref_data.third_reference
			};
			
			callback({ success: true, message: 'Reference details fetched', data: ref_details });
		}
		else
		{
			callback({ success: false, message: 'No data found' });
		}
	},
	getUserCount: async function (authData, callback) {
		var hospital_count = await User.countDocuments({ "user_type":5 }).exec();
		if(hospital_count) {
			var hospital_counts = hospital_count;
		} else {
			var hospital_counts = 0;
		}
		var private_recruiter_count = await User.countDocuments({ "user_type":4 }).exec();
		if(private_recruiter_count) {
			var private_recruiter_count = private_recruiter_count;
		} else {
			var private_recruiter_count = 0;
		}
		var physican_count = await User.countDocuments({ "user_type":3 }).exec();
		if(physican_count) {
			var physican_count = physican_count;
		} else {
			var physican_count = 0;
		}
		
		var physican_assistant_count = await User.countDocuments({ "user_type":1 }).exec();
		if(physican_assistant_count) {
			var physican_assistant_count = physican_assistant_count;
		} else {
			var physican_assistant_count = 0;
		}
		var nurse_count = await User.countDocuments({ "user_type":2 }).exec();
		if(nurse_count) {
			var nurse_count = nurse_count;
		} else {
			var nurse_count = 0;
		}
		var third_party_count = await User.countDocuments({ "user_type":6 }).exec();
		if(third_party_count) {
			var third_party_count = third_party_count;
		} else {
			var third_party_count = 0;
		}

		callback({ success: true, message: 'User count fetched', hospital_counts: hospital_counts, private_recruiter_count: private_recruiter_count, physican_count: physican_count, physican_assistant_count: physican_assistant_count, nurse_count: nurse_count, third_party_count: third_party_count });
 
	},
	updateProviderPersonalDetails: async function (personalData, docFile, authData, callback) {
		if (personalData.name == '') {
			callback({success: false,type:"Validation error",message: "Valid email is required" });
			return false;
		}
		if (personalData.country_code == '') {
			callback({success: false,type:"Validation error",message: "Country code is required." });
			return false;
		}
		if (personalData.only_mobile_no == '') {
			callback({success: false,type:"Validation error",message: "Only mobile number is required." });
			return false;
		}
		if (personalData.user_id == '') {
			callback({success: false,type:"Validation error",message: "User id is required." });
			return false;
		}

		var mobile_no = personalData.country_code + personalData.only_mobile_no;

		if(docFile!=null) {
			if(docFile.profile_image) {
				if(docFile.profile_image.name.trim() != '') {
					var ext = docFile.profile_image.name.slice(docFile.profile_image.name.lastIndexOf('.'));
					var profile_image_name = "profile"+ '1' + Date.now() + ext;
					var folderpath = 'public/profile_image/';
		
					docFile.profile_image.mv(folderpath + profile_image_name);

					User.updateOne({ "_id": personalData.user_id },{
						"profile_picture": profile_image_name
					}).exec();
				}
			}
			if(docFile.cv) {
				if(docFile.cv.name.trim() != '') {
					var ext = docFile.cv.name.slice(docFile.cv.name.lastIndexOf('.'));
					var cv_name = "cv"+ '1' + Date.now() + ext;
					var folderpath = 'public/cv/';
	
					docFile.cv.mv(folderpath + cv_name);

					User.updateOne({ "_id": personalData.user_id },{
						"cv": cv_name,
					}).exec();
				}
			}
		}

		User.updateOne({ "_id": personalData.user_id },{
			"name": personalData.name,
			"country_code": personalData.country_code,
			"only_mobile_no": personalData.only_mobile_no,
			"mobile_no": mobile_no,
			"dom": new Date()
		}).exec();

		callback({ success: true, message: 'Personal details updated successfully' });
	},
	updateProviderLicenseDetails: async function (LicenseData, docFile, authData, callback) {
		console.log(LicenseData,'LicenseData')
		if (LicenseData.national_license_issue_date == '' && LicenseData.national_license_expiry_date == '' &&                                       LicenseData.state_license_issue_date == '' && LicenseData.state_license_expiry_date == '' && LicenseData.cds_license_issue_date == '' && LicenseData.cds_license_expiry_date == ''&& LicenseData.dea_license_issue_date == '' && LicenseData.dea_license_expiry_date == '' ) {
			callback({ success: false, type: "Validation error", message: " above fields required" });
			return false;
		}
		var nlid = LicenseData.national_license_issue_date
		var nled = LicenseData.national_license_expiry_date
		var slid = LicenseData.state_license_issue_date
		var sled = LicenseData.state_license_expiry_date
		var clid = LicenseData.cds_license_issue_date
		var cled = LicenseData.cds_license_expiry_date
		var dlid = LicenseData.dea_license_issue_date
		var dled = LicenseData.dea_license_expiry_date
			
		var nls="Yes"
			var sls="Yes"
			var cls="Yes"
			var dls="Yes"
                if(LicenseData.national_license_status=='false') {
					var nls="No"
					var nlid=""
					var nled=""
					
				}
			 if(LicenseData.state_license_status=='false') {
					var sls="No"
					var slid=""
					var sled=""
					
				}
			 if(LicenseData.cds_license_status=='false') {
					var cls="No"
					var clid=""
					var cled=""
					
				}
			 if(LicenseData.dea_license_status=='false') {
					var dls="No"
					var dlid=""
					var dled=""
					
				}
		if (LicenseData.user_id == '') {
			callback({success: false,type:"Validation error",message: "User id is required." });
			return false;
		}

		if(docFile) {
			if(docFile.national_license_file && nls !="No") {
				if(docFile.national_license_file.name.trim() != '') {
					var ext = docFile.national_license_file.name.slice(docFile.national_license_file.name.lastIndexOf('.'));
					var national_license_file = "national_license_file"+ '1' + Date.now() + ext;
					var folderpath = 'public/national_license_file/';
		
					docFile.national_license_file.mv(folderpath + national_license_file);

					UserLicense.updateOne({ "user_id": LicenseData.user_id },{
						"national_license_file": national_license_file
					}).exec();
				}
			}
			if(docFile.state_license_file && sls !="No") {
				if(docFile.state_license_file.name.trim() != '') {
					var ext = docFile.state_license_file.name.slice(docFile.state_license_file.name.lastIndexOf('.'));
					var state_license_file = "state_license_file"+ '1' + Date.now() + ext;
					var folderpath = 'public/state_license_file/';
		
					docFile.state_license_file.mv(folderpath + state_license_file);

					UserLicense.updateOne({ "user_id": LicenseData.user_id },{
						"state_license_file": state_license_file
					}).exec();
				}
			}
			if(docFile.cds_license_file && cls !="No") {
				if(docFile.cds_license_file.name.trim() != '') {
					var ext = docFile.cds_license_file.name.slice(docFile.cds_license_file.name.lastIndexOf('.'));
					var cds_license_file = "cds_license_file"+ '1' + Date.now() + ext;
					var folderpath = 'public/cds_license_file/';
		
					docFile.cds_license_file.mv(folderpath + cds_license_file);

					UserLicense.updateOne({ "user_id": LicenseData.user_id },{
						"cds_license_file": cds_license_file
					}).exec();
				}
			}
			if(docFile.dea_license_file && dls !="No") {
				if(docFile.dea_license_file.name.trim() != '') {
					var ext = docFile.dea_license_file.name.slice(docFile.dea_license_file.name.lastIndexOf('.'));
					var dea_license_file = "dea_license_file"+ '1' + Date.now() + ext;
					var folderpath = 'public/dea_license_file/';
		
					docFile.dea_license_file.mv(folderpath + dea_license_file);

					UserLicense.updateOne({ "user_id": LicenseData.user_id },{
						"dea_license_file": dea_license_file
					}).exec();
				}
			}
		}

		UserLicense.updateOne({ "user_id": LicenseData.user_id },{
			"national_license_issue_date": nlid,
				"national_license_expiry_date":nled,
				"national_license_status": nls,
				"state_license_issue_date": slid,
				"state_license_expiry_date": sled,
				"state_license_status": sls,
				"cds_license_issue_date": clid,
				"cds_license_expiry_date": cled,
				"cds_license_status": cls,
				"dea_license_issue_date": dlid,
				"dea_license_expiry_date": dled,
				"dea_license_status": dls,
		}).exec();

		callback({ success: true, message: 'License details updated successfully' });
	},
	updateProviderAdditionalLicenseDetails: async function (LicenseData, docFile, authData, callback) {
		
		if (LicenseData.license_name == '') {
			callback({success: false,type:"Validation error",message: "Addtional license name is required" });
			return false;
		}
		if (LicenseData.license_issue_date == '') {
			callback({success: false,type:"Validation error",message: "Additional license issue date is required" });
			return false;
		}
		if (LicenseData.license_expiry_date == '') {
			callback({success: false,type:"Validation error",message: "Additional license expire date is required." });
			return false;
		}
		if (LicenseData.user_id == '') {
			callback({success: false,type:"Validation error",message: "User id is required." });
			return false;
		}

		if(docFile) {
			if(docFile.license_file) {
				if(docFile.license_file.name.trim() != '') {
					var ext = docFile.license_file.name.slice(docFile.license_file.name.lastIndexOf('.'));
					var license_file = "license_file"+ '1' + Date.now() + ext;
					var folderpath = 'public/additional_license/';
		
					docFile.license_file.mv(folderpath + license_file);
				}
			}
		}
		const license_data = new UserAdditonalLicense({
			user_id: LicenseData.user_id,
			license_file: license_file,
			license_name: LicenseData.license_name,
			license_issue_date: LicenseData.license_issue_date,
			license_expiry_date: LicenseData.license_expiry_date
		});
		license_data.save();

		callback({ success: true, message: 'Additional license details updated successfully' });
	},
	updateProviderCertificateDetails: async function (certificateData, docFile, authData, callback) {
		
		if (certificateData.bls_issue_date == '' && certificateData.bls_expiry_date == '' &&                                       certificateData.acls_issue_date == '' && certificateData.acls_expiry_date == '' && certificateData.pls_issue_date == '' && certificateData.pls_expiry_date == '') {
			callback({ success: false, type: "Validation error", message: " above fields required" });
			return false;
		}
		//console.log('certificateData',certificateData);
	  var bid = certificateData.bls_issue_date
    var bed = certificateData.bls_expiry_date
    var aid = certificateData.acls_issue_date
    var aed = certificateData.acls_expiry_date
    var pid = certificateData.pls_issue_date
    var ped = certificateData.pls_expiry_date
    
    
        var bls="Yes"
        var acls="Yes"
        var pls="Yes"
        
            if(certificateData.bls_status=='false') {
                var bls="No"
                var bid =""
                var bed =""
                
            }
         if(certificateData.acls_status=='false') {
                var acls="No"
                var aid =""
                var aed =""
            }
         if(certificateData.pls_status=='false') {
                var pls="No"
                var pid =""
                var ped =""
            }
    
		if (certificateData.user_id == '') {
			callback({success: false,type:"Validation error",message: "User id is required." });
			return false;
		}

		if(docFile) {
			if(docFile.bls_file && bls !="No") {
				if(docFile.bls_file.name.trim() != '') {
					var ext = docFile.bls_file.name.slice(docFile.bls_file.name.lastIndexOf('.'));
					var bls_file = "bls_file"+ '1' + Date.now() + ext;
					var folderpath = 'public/certificate/';
		
					docFile.bls_file.mv(folderpath + bls_file);

					UserCertificate.updateOne({ "user_id": certificateData.user_id },{
						"bls_file": bls_file
					}).exec();
				}
			}
			if(docFile.acls_file && acls !="No") {
				if(docFile.acls_file.name.trim() != '') {
					var ext = docFile.acls_file.name.slice(docFile.acls_file.name.lastIndexOf('.'));
					var acls_file = "acls_file"+ '1' + Date.now() + ext;
					var folderpath = 'public/certificate/';
		
					docFile.acls_file.mv(folderpath + acls_file);

					UserCertificate.updateOne({ "user_id": certificateData.user_id },{
						"acls_file": acls_file
					}).exec();
				}
			}
			if(docFile.pls_file && pls !="No") {
				if(docFile.pls_file.name.trim() != '') {
					var ext = docFile.pls_file.name.slice(docFile.pls_file.name.lastIndexOf('.'));
					var pls_file = "pls_file"+ '1' + Date.now() + ext;
					var folderpath = 'public/certificate/';
		
					docFile.pls_file.mv(folderpath + pls_file);

					UserCertificate.updateOne({ "user_id": certificateData.user_id },{
						"pls_file": pls_file
					}).exec();
				}
			}
		}
		UserCertificate.updateOne({ "user_id": certificateData.user_id },{
			 "bls_issue_date": bid,
            "bls_expiry_date": bed,
            "bls_status": bls,
            "acls_issue_date": aid,
            "acls_expiry_date": aed,
            "acls_status": acls,
            "pls_issue_date": pid,
            "pls_expiry_date": ped,
            "pls_status": pls,
		}).exec();

		callback({ success: true, message: 'Certificate details updated successfully' });
	},
	updateProviderAdditionalCertificateDetails: async function (certificateData, docFile, authData, callback) {
		if (certificateData.certificate_name == '') {
			callback({success: false,type:"Validation error",message: "Certificate name is required" });
			return false;
		}
		if (certificateData.certificate_issue_date == '') {
			callback({success: false,type:"Validation error",message: "Certificate issue date is required" });
			return false;
		}
		if (certificateData.certificate_expiry_date == '') {
			callback({success: false,type:"Validation error",message: "Certificate expire date is required." });
			return false;
		}
		if (certificateData.user_id == '' || certificateData.user_id == null || certificateData.user_id == 'undefined') {
			callback({success: false,type:"Validation error",message: "User id is required." });
			return false;
		}

		if(docFile) {
			if(docFile.certificate_file) {
				if(docFile.certificate_file.name.trim() != '') {
					var ext = docFile.certificate_file.name.slice(docFile.certificate_file.name.lastIndexOf('.'));
					var certificate_file = "a_certificate_file"+ '1' + Date.now() + ext;
					var folderpath = 'public/certificate/';
					docFile.certificate_file.mv(folderpath + certificate_file);
				}
			}
		}

		const certificate_data = new UserAdditonalCertificate({
			user_id: certificateData.user_id,
			certificate_file: certificate_file,
			certificate_name: certificateData.certificate_name,
			certificate_issue_date: certificateData.certificate_issue_date,
			certificate_expiry_date: certificateData.certificate_expiry_date
		});
		certificate_data.save();

		callback({ success: true, message: 'Additional certificate details updated successfully' });
	},
	updateProviderEmploymentDetails: async function (employmentData, authData, callback) {
	if (employmentData.c_job_name == '' && employmentData.c_job_from_year == '' ) {
		callback({ success: false, type: "Validation error", message: " above fields required" });
		return false;
	}

	if (employmentData.user_id == '') {
		callback({success: false,type:"Validation error",message: "User id is required." });
		return false;
	}

	UserEmployement.updateOne({ "user_id": employmentData.user_id },{
		"c_job_name": employmentData.c_job_name,
		"c_job_from_year": employmentData.c_job_from_year,
		"dom": new Date()
	}).exec();

	callback({ success: true, message: 'Employment details updated successfully' });
      },
   updateProviderAdditionalEmploymentDetails: async function (employmentData, authData, callback) {
	if (employmentData.job_name == '') {
		callback({success: false,type:"Validation error",message: "Job name is required." });
		return false;
	}
	if (employmentData.employment_start_date == '') {
		callback({success: false,type:"Validation error",message: "From year is required." });
		return false;
	}
	if (employmentData.employment_end_date == '') {
		callback({success: false,type:"Validation error",message: "To year is required." });
		return false;
	}
	if (employmentData.user_id == '') {
		callback({success: false,type:"Validation error",message: "User id is required." });
		return false;
	}
	const emp_data = new UserAdditionalEmployment({
		user_id: employmentData.user_id,
		job_name: employmentData.job_name,
		employment_start_date: employmentData.employment_start_date,
		employment_end_date: employmentData.employment_end_date
	});
	emp_data.save();

	callback({ success: true, message: 'Additional Employment details updated successfully' });
},
	updateProviderMedicalHistory: async function (medicalData, docFile, authData, callback) {
		         var cd2s="Yes"
                  var cd3s="Yes"
                  var cd4s="Yes"
				  console.log(medicalData,'medicalData')
		  if(medicalData.covid_date_2_status=='false') {
                var cd2s="No"
            }
         if(medicalData.covid_date_3_status=='false') {
                var cd3s="No"
            }
         if(medicalData.covid_date_4_status=='false') {
                var cd4s="No"
            }

		if(docFile) {
			if(docFile.covid_certificate) {
				if(docFile.covid_certificate.name.trim() != '') {
					var ext = docFile.covid_certificate.name.slice(docFile.covid_certificate.name.lastIndexOf('.'));
					var covid_certificate = "covid_certificate"+ '1' + Date.now() + ext;
					var folderpath = 'public/medical/';
		
					docFile.covid_certificate.mv(folderpath + covid_certificate);

					UserMedicalHistory.updateOne({ "user_id": medicalData.user_id },{
						"covid_certificate": covid_certificate
					}).exec();
				}
			}
			if(docFile.flu_certificate) {
				if(docFile.flu_certificate.name.trim() != '') {
					var ext = docFile.flu_certificate.name.slice(docFile.flu_certificate.name.lastIndexOf('.'));
					var flu_certificate = "flu_certificate"+ '1' + Date.now() + ext;
					var folderpath = 'public/medical/';
		
					docFile.flu_certificate.mv(folderpath + flu_certificate);

					UserMedicalHistory.updateOne({ "user_id": medicalData.user_id },{
						"flu_certificate": flu_certificate
					}).exec();
				}
			}
			if(docFile.tetanus) {
				if(docFile.tetanus.name != '') {
					var ext = docFile.tetanus.name.slice(docFile.tetanus.name.lastIndexOf('.'));
					var tetanus = "tetanus"+ '1' + Date.now() + ext;
					var folderpath = 'public/medical/';
		
					docFile.tetanus.mv(folderpath + tetanus);

					UserMedicalHistory.updateOne({ "user_id": medicalData.user_id },{
						"tetanus": tetanus
					}).exec();
				}
			}
			if(docFile.mmr_vaccine) {
				if(docFile.mmr_vaccine.name != '') {
					var ext = docFile.mmr_vaccine.name.slice(docFile.mmr_vaccine.name.lastIndexOf('.'));
					var mmr_vaccine = "mmr_vaccine"+ '1' + Date.now() + ext;
					var folderpath = 'public/medical/';
		
					docFile.mmr_vaccine.mv(folderpath + mmr_vaccine);

					UserMedicalHistory.updateOne({ "user_id": medicalData.user_id },{
						"mmr_vaccine": mmr_vaccine
					}).exec();
				}
			}
			if(docFile.hepatitis_vaccine) {
				if(docFile.hepatitis_vaccine.name.trim() != '') {
					var ext = docFile.hepatitis_vaccine.name.slice(docFile.hepatitis_vaccine.name.lastIndexOf('.'));
					var hepatitis_vaccine = "hepatitis_vaccine"+ '1' + Date.now() + ext;
					var folderpath = 'public/medical/';
		
					docFile.hepatitis_vaccine.mv(folderpath + hepatitis_vaccine);

					UserMedicalHistory.updateOne({ "user_id": medicalData.user_id },{
						"hepatitis_vaccine": hepatitis_vaccine
					}).exec();
				}
			}
		}
		UserMedicalHistory.updateOne({ "user_id": medicalData.user_id },{
			"covid_date_1": medicalData.covid_date_1,
			"covid_date_2": medicalData.covid_date_2,
			"covid_date_2_status": cd2s,
			"covid_date_3": medicalData.covid_date_3,
			"covid_date_3_status": cd3s,
			"covid_date_4": medicalData.covid_date_4,
			"covid_date_4_status": cd4s,
			"flu_date": medicalData.flu_date,
			"tetanus_date": medicalData.tetanus_date,
			"mmr_immune": medicalData.mmr_immune,
			"hepatitis_immune": medicalData.hepatitis_immune,
			"dom": new Date(),
		}).exec();

		callback({ success: true, message: 'Medical history updated successfully' });
	},
	updateProviderEducationDetails: async function (eduData, authData, callback) {
		if (eduData.ug_from_year == '' && eduData.ug_to_year == '' && eduData.g_from_year == '' && eduData.g_to_year == '' && eduData.med_school_from_year == '' && eduData.med_school_to_year == '') {
			callback({ success: false, type: "Validation error", message: " above fields required" });
			return false;
		}
		  var gfy = eduData.g_from_year
    var gty = eduData.g_to_year
    var gin = eduData.g_institute_name
    var msfy = eduData.med_school_from_year
    var msty = eduData.med_school_to_year 
    var min = eduData.med_institue_name
    
        var gs="Yes"
        var ms="Yes"
        
         
         if(eduData.g_status=='false') {
                var gs="No"
                var gfy =""
                var gty =""
                var gin =""
                
            }
         if(eduData.med_status=='false') {
                var ms="No"
                var msfy =""
                var msty =""
                var min =""
            }
		if (eduData.user_id == '') {
			callback({success: false,type:"Validation error",message: "User id is required." });
			return false;
		}

		UserEducation.updateOne({ "user_id": eduData.user_id },{
			"ug_institute_name": eduData.ug_institute_name,
            "ug_from_year": eduData.ug_from_year,
            "ug_to_year": eduData.ug_to_year,
            "g_institute_name": gin,
            "g_from_year": gfy,
            "g_to_year": gty,
            "g_status": gs,
            "med_institue_name": min,
            "med_school_from_year": msfy,
            "med_school_to_year": msty,
            "med_status":ms,
			"dom": new Date()
		}).exec();

		callback({ success: true, message: 'Education details updated successfully' });
	},
	updateProviderAdditionalEducationDetails: async function (eduData, authData, callback) {
		if (eduData.edu_name == '') {
			callback({success: false,type:"Validation error",message: "Institution name is required." });
			return false;
		}
		if (eduData.education_name == '') {
			callback({success: false,type:"Validation error",message: "Education name is required." });
			return false;
		}
		if (eduData.from_year == '') {
			callback({success: false,type:"Validation error",message: "From year is required." });
			return false;
		}
		if (eduData.to_year == '') {
			callback({success: false,type:"Validation error",message: "To year is required." });
			return false;
		}
		if (eduData.user_id == '') {
			callback({success: false,type:"Validation error",message: "User id is required." });
			return false;
		}
		const edu_data = new UserAdditionalEducation({
			user_id: eduData.user_id,
			education_name: eduData.education_name,
			edu_name: eduData.edu_name,
			from_year: eduData.from_year,
			to_year: eduData.to_year
		});
		edu_data.save();

		callback({ success: true, message: 'Additional Education details updated successfully' });
	},
	
	updateProviderReferences: async function (refData, authData, callback) {
		if (refData.first_reference == '') {
			callback({success: false,type:"Validation error",message: "First reference is required." });
			return false;
		}
		if (refData.second_reference == '') {
			callback({success: false,type:"Validation error",message: "Second reference is required." });
			return false;
		}
		if (refData.third_reference == '') {
			callback({success: false,type:"Validation error",message: "Third reference is required." });
			return false;
		}
		if (refData.user_id == '' || refData.user_id == null || refData.user_id == 'undefined') {
			callback({success: false,type:"Validation error",message: "User id is required." });
			return false;
		}

		UserReference.updateOne({ "user_id": refData.user_id },{
			"first_reference": refData.first_reference,
			"second_reference": refData.second_reference,
			"third_reference": refData.third_reference,
			"dom": new Date()
		}).exec();

		callback({ success: true, message: 'Reference updated successfully' });
	},
	saveProviderLegalQuestionAnswer: async function (ansData, authData, callback) {
		if (ansData.question_id == '') {
			callback({success: false,type:"Validation error",message: "Question id is required." });
			return false;
		}
		if (ansData.answer == '') {
			callback({success: false,type:"Validation error",message: "Answer is required." });
			return false;
		}
		if (ansData.user_id == '') {
			callback({success: false,type:"Validation error",message: "User id is required." });
			return false;
		}

		await UserLegalQuestionAnswer.deleteOne({ "user_id": ansData.user_id, "question_id":ansData.question_id }).exec();

		const a_data = new UserLegalQuestionAnswer({
			user_id: ansData.user_id,
			question_id: ansData.question_id,
			answer: ansData.answer,
		});
		a_data.save();

		callback({ success: true, message: 'Legal answer saved successfully' });
	},
	updateLegalQuestionAnswer: async function (ansData, authData, callback) {
    if (ansData.question_id == '') {
        callback({success: false,type:"Validation error",message: "Question id is required." });
      return false;
      }
      if (ansData.answer == '') {
         callback({success: false,type:"Validation error",message: "Answer is required." });
      return false;
      }
     if (ansData.explain == '') {
         callback({success: false,type:"Validation error",message: "Explanation is required." });
      return false;
      }
     
    await UserLegalQuestionAnswer.updateOne({"user_id":ansData.user_id, "question_id":ansData.question_id},{"answer":ansData.answer, "explain":ansData.explain,"dom":new Date()}).exec();

   callback({ success: true, message: 'Legal answer saved successfully' });
   },
	saveDreamjob: async function (authData, dreamjobData, docFile, callback) {
		if(dreamjobData.name == '') {
			callback({success: false, type:"Validation error", message: "Name is required." });
			return false;
		}
		if(dreamjobData.designation == '') {
			callback({success: false, type:"Validation error", message: "Designation is required." });
			return false;
		}
	

		if(docFile.image.name.trim() != '') {
			var ext = docFile.image.name.slice(docFile.image.name.lastIndexOf('.'));
			var image = "image"+ '1' + Date.now() + ext;
			var folderpath = 'public/dreamjob/';

			docFile.image.mv(folderpath + image);
		}

		const t_data = new Dreamjob({
			name: dreamjobData.name,
			designation: dreamjobData.designation,
			image: image
		});
		t_data.save();
		
		callback({ success: true, message: 'Dream Job saved successfully' });
	},
	getAboutus: async function (authData, callback) {
		var aboutus_data = await CMS.findOne({ "slug":"about_us" }).exec();
		if(aboutus_data) {
			const about_us = {
				"slug": aboutus_data.slug,
				"content": aboutus_data.content,
				"about_us_id": aboutus_data._id,
			}
			callback({ success: true, message: "About us fetched", data: about_us });
		} else {
			callback({ success: false, message: "No data found" });
		}
	},
	updateAboutUs: async function (aboutusData, authData, callback) {
		if(!aboutusData.about_us_id || aboutusData.about_us_id == '') {
			callback({success: false, type:"Validation error", message: "About us id is required." });
			return false;
		}
		if(!aboutusData.content || aboutusData.content == '') {
			callback({success: false, type:"Validation error", message: "About us content is required." });
			return false;
		}

		CMS.updateOne({ "_id": aboutusData.about_us_id },{
			"content": aboutusData.content,
			"dom": new Date()
		}).exec();

		callback({ success: true, message: "About us updated" });
	},
	getPrivacy: async function (authData, callback) {
		var privacy_data = await PrivacyPolicy.findOne({ "slug":"privacy_policy" }).exec();
		console.log(privacy_data,'privacy_data')
		if(privacy_data) {
			const privacy_policy = {
				"slug": privacy_data.slug,
				"content": privacy_data.content,
				"privacy_id": privacy_data._id,
			}
			callback({ success: true, message: "Privacy Policy fetched", data: privacy_policy });
		} else {
			callback({ success: false, message: "No data found" });
		}
	},
	updatePrivacy: async function (privacyData, authData, callback) {
		if(!privacyData.privacy_id || privacyData.privacy_id == '') {
			callback({success: false, type:"Validation error", message: "Privacy id is required." });
			return false;
		}
		if(!privacyData.content || privacyData.content == '') {
			callback({success: false, type:"Validation error", message: "Privacy content is required." });
			return false;
		}

		PrivacyPolicy.updateOne({ "_id": privacyData.privacy_id },{
			"content": privacyData.content,
			"dom": new Date()
		}).exec();

		callback({ success: true, message: "Privacy Data Updated" });
	},
		deleteAdditionalLicense: async function (authData, additiona_license_id, callback) {
		if(!additiona_license_id) {
			callback({ success: false, message: "Additional license id required" });
		}
		await UserAdditonalLicense.deleteOne({"_id": additiona_license_id }).exec();

		callback({ success: true, message: "Additional license deleted successfully" });
	},
	deleteAdditionalCertificate: async function (authData, additiona_certificate_id, callback) {
		if(!additiona_certificate_id) {
			callback({ success: false, message: "Additional certificate id required" });
		}
		await UserAdditonalCertificate.deleteOne({"_id": additiona_certificate_id }).exec();

		callback({ success: true, message: "Additional certificate deleted successfully" });
	},
	deleteAdditionalEducation: async function (authData, additional_education_id, callback) {
		console.log('additional_education_id',additional_education_id);
		if(!additional_education_id) {
			callback({ success: false, message: "Additional education id required" });
		}
		await UserAdditionalEducation.deleteOne({"_id": additional_education_id }).exec();

		callback({ success: true, message: "Additional education deleted successfully" });
	},
	deleteAdditionalEmployement: async function (authData, additional_employement_id, callback) {
		if(!additional_employement_id) {
			callback({ success: false, message: "Employment id required" });
		}
		await UserAdditionalEmployment.deleteOne({"_id": additional_employement_id }).exec();

		callback({ success: false, message: "Employment deleted successfully" });
	},
	
	getFaqList: async function (authData, callback) {
		var faq_list = await FAQ.find({}).exec();
		if(faq_list.length > 0)
		{
			var faq_arr = [];
			for(var i = 0; i < faq_list.length; i++)
			{
				console.log(faq_list,'faq_list')
				faq_arr.push({
					faq_id: faq_list[i]._id,
					question: faq_list[i].question.slice(0,20)+'...',
					answer: faq_list[i].answer.slice(0,20)+'...'
				})
			}
			callback({ success: true, message: "FAQ list fetched", data: faq_arr });
		}
		else
		{
			callback({ success: false, message: "No data found" });
		}
	},
	geFAQById: async function (authData, faq_id, callback) {
		var faq_list = await FAQ.findOne({ "_id": faq_id }).exec();
		if(faq_list) {
			const faq_obj = {
				faq_id: faq_list._id,
				question: faq_list.question,
				answer: faq_list.answer
			}
			callback({ success: true, message: "Faq fetched", data: faq_obj });
		} else {
			callback({ success: false, message: "No data found" });
		}
	},
	updateFAQ: async function (authData, faqData, callback) {
		if(faqData.faq_id == '') {
			callback({success: false, type:"Validation error", message: "FAQ id is required." });
			return false;
		}
		if(faqData.question == '') {
			callback({success: false, type:"Validation error", message: "Question is required." });
			return false;
		}
		if(faqData.answer == '') {
			callback({success: false, type:"Validation error", message: "Answer is required." });
			return false;
		}
		FAQ.updateOne({ "_id": faqData.faq_id },{
			"question": faqData.question,
			"answer": faqData.answer,
		}).exec();

		callback({ success: true, message: 'FAQ updated successfully' });
	},
	// nonProviderList: async function (authData, search_word, user_type, page, limit, callback) {
	// 	if(!page || page === 0) {
	// 		callback({ success: false, message: "Page is mandatory" });
	// 		return false;
	// 	}
	// 	if(!limit || limit === 0) {
	// 		callback({ success: false, message: "Limit is mandatory" });
	// 		return false;
	// 	}
	// 	var query = {};
	// 	if(search_word) {
	// 		var search_val = escapeForRegex(search_word).replace(/\s+/g, '|');
	// 		query['$or'] = [
	// 			{ name: new RegExp(search_val, 'gi') },
	// 			{ email: new RegExp(search_val, 'gi') },
	// 		];
	// 	}
	// 	if(user_type && user_type > 0) {
	// 		query.user_type = { "$in": user_type };
	// 	} else {
	// 		query.user_type = { "$in": [4,5,6] };
	// 	}

	// 	var non_providers = await User.find(query)
	// 					.limit(limit * 1)
	// 					.skip((page - 1) * limit)
	// 					.exec();

	// 	const total_non_provider_count = await User.countDocuments(query);

	// 	if(non_providers.length > 0)
	// 	{
	// 		var p_data = [];
	// 		for(var i = 0; i < non_providers.length; i++) {
	// 			if(non_providers[i].user_type == 4) {
	// 				var designation = 'Physican Assistant';
	// 			} else if(non_providers[i].user_type == 5) {
	// 				var designation = 'Nurse';
	// 			} else if(non_providers[i].user_type == 6) {
	// 				var designation = 'Physican';
	// 			}

	// 			if(non_providers[i].profile_picture == null) {
	// 				var profile_img = null;
	// 			} else {
	// 				var profile_img = staging_siteurl+'public/profile_image/'+non_providers[i].profile_picture;
	// 			}
				
	// 			p_data.push({
	// 				_id: non_providers[i]._id,
	// 				user_type: non_providers[i].user_type,
	// 				name: non_providers[i].name,
	// 				email: non_providers[i].email,
	// 				phone_no: non_providers[i].mobile_no,
	// 				designation: designation,
	// 				profile_img: profile_img
	// 			});
	// 		}
	// 		callback({ success: true, message: "Non provider list fetched", data: p_data, totalPages: Math.ceil(total_non_provider_count / limit), currentPage: page });
	// 	}
	// 	else
	// 	{
	// 		callback({ success: false, message: "No data found" });
	// 	}
	// },
	nonProviderList: async function (authData, search_word, user_type, callback) {
		var query = {};
		if(search_word) {
			var search_val = escapeForRegex(search_word).replace(/\s+/g, '|');
			query['$or'] = [
				{ name: new RegExp(search_val, 'gi') },
				{ email: new RegExp(search_val, 'gi') },
			];
		}
		if(user_type && user_type > 0) {
			query.user_type = { "$in": user_type };
		} else {
			query.user_type = { "$in": [4,5,6] };
		}

		var non_providers = await User.find(query).exec();

		if(non_providers.length > 0)
		{
			var p_data = [];
			for(var i = 0; i < non_providers.length; i++) {
				if(non_providers[i].user_type == 4) {
					var designation = 'Physican Assistant';
				} else if(non_providers[i].user_type == 5) {
					var designation = 'Nurse';
				} else if(non_providers[i].user_type == 6) {
					var designation = 'Physican';
				}

				if(non_providers[i].profile_picture == null) {
					var profile_img = staging_siteurl+'public/no_image.png';
				} else {
					var profile_img = staging_siteurl+'public/profile_image/'+non_providers[i].profile_picture;
				}
				
				p_data.push({
					_id: non_providers[i]._id,
					user_type: non_providers[i].user_type,
					name: non_providers[i].name,
					email: non_providers[i].email,
					phone_no: non_providers[i].mobile_no,
					designation: designation,
					profile_img: profile_img
				});
			}
			callback({ success: true, message: "Non provider list fetched", data: p_data });
		}
		else
		{
			callback({ success: false, message: "No data found" });
		}
	},
	changePassword: async function (passwordData, authData, callback) {
		if(passwordData.old_password == '') {
			callback({success: false, type:"Validation error", message: "Old password is required." });
			return false;
		}
		if(passwordData.new_password == '') {
			callback({success: false, type:"Validation error", message: "New password is required." });
			return false;
		}

		var admin_details = await Admin.findOne({"_id":authData.id}).exec();
		if(admin_details) {
			if (!bcrypt.compareSync(passwordData.old_password, admin_details.password)) {
				callback({ success: false, type: "Validation error", message: "Old password does not match" });
			} else {
				let password_hash = bcrypt.hashSync(passwordData.new_password, 10);
				Admin.updateOne({ "_id": authData.id },{
					"password": password_hash
				}).exec();

				callback({ success: true, message: "Password updated successfully" });
			}
		} else {
			callback({ success: false, message: "No data found" });
		}
	},
	getContactUsList: async function (authData, callback) {
		var contact_us_list = await ContactUs.find({}).sort({"_id": -1}).exec();
		if(contact_us_list.length > 0)
		{
			var contact_us_arr = [];
			for(var i = 0; i < contact_us_list.length; i++)
			{
				contact_us_arr.push({
					contact_us_id: contact_us_list[i]._id,
					name: contact_us_list[i].name,
					phone_no: contact_us_list[i].phone_no,
					comment: contact_us_list[i].comment.slice(0,20)+'...'
				})
			}
			callback({ success: true, message: "Contact us list fetched", data: contact_us_arr });
		}
		else
		{
			callback({ success: false, message: "No data found" });
		}
	},
	
	deleteContactus: async function (authData, contact_id, callback) {
		if(!contact_id) {
			callback({ success: false, message: "contact_id id required" });
		}
		await ContactUs.deleteOne({"_id": contact_id }).exec();

		callback({ success: true, message: "Contact data deleted successfully" });
	},
	deleteFaq: async function (authData, faq_id, callback) {
		if(!faq_id) {
			callback({ success: false, message: "faq_id id required" });
		}
		await FAQ.deleteOne({"_id": faq_id }).exec();

		callback({ success: true, message: "Faq data deleted successfully" });
	},
	getContactUsDetails: async function (authData, contact_us_id, callback) {
		console.log('contact_us_id',contact_us_id);
		var contact_us_details = await ContactUs.findOne({ "_id":contact_us_id }).exec();
		console.log('contact_us_details',contact_us_details);
		if(contact_us_details) {
			const contact_data = {
				"contact_us_id": contact_us_details._id,
				"name": contact_us_details.name,
				"phone_no": contact_us_details.phone_no,
				"comment": contact_us_details.comment
			}
			callback({ success: true, message: "Contact us details fetched", data: contact_data });
		} else {
			callback({ success: false, message: "No data found" });
		}
	},
};

module.exports = adminService;