let async = require("async");
let jwt = require('jsonwebtoken');
let nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const config = require('../config');
let moment = require('moment');
var Jimp = require('jimp');
var ffmpeg = require('ffmpeg');
const pdf = require('html-pdf');
const puppeteer = require('puppeteer');

const fs = require('fs');
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

var generalHelper = require('../helper/general_helper');
let notificationPage = require('../helper/notification');


const User = require('../model/user');
const Subscription = require('../model/subscription');
const Transaction = require('../model/transaction');
const UserLicense = require('../model/user_license');
const UserAdditonalLicense = require('../model/user_additional_license');
const UserCertificate = require('../model/user_certificate');
const UserAdditonalCertificate = require('../model/user_additional_certificate');
const UserEmployement = require('../model/user_employement');
const UserMedicalHistory = require('../model/user_medical_history');
const UserEducation = require('../model/user_education');
const UserAdditionalEducation = require('../model/user_additional_education');
const UserAdditionalEmployement = require('../model/user_additional_employement');
const UserReference = require('../model/user_reference');
const LegalQuestion = require('../model/legal_question');
const UserLegalQuestionAnswer = require('../model/user_legal_question_answer');
const CMS = require('../model/cms');
const PrivacyPolicy = require('../model/PrivacyPolicy')
const FAQ = require('../model/faq');
const ContactUs = require('../model/contactus');
const Testimonial = require('../model/testimonial');
const Dreamjob = require('../model/dreamjob');
const ConnectionRequest = require('../model/connection_request');
const Connection = require('../model/connection');
const mail = require("../mailconfig");


function createToken(user) {
	let tokenData = {
		id: user._id,
		email: user.email.toLowerCase()
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
const STRIPE_SECRET_KEY = "sk_test_51O9uKdHf7NHBBEzBgTIJkbLWfxzYbsUwGOBNmCbPa0ZtLKcV8jlZMCcO3Pod6tBiDrgXJMi9Qf42iFqjSb8nNpdc00QrKzBgRj"
const stripe = require("stripe")(STRIPE_SECRET_KEY);

let websiteService = {
	signUp: async function (registerData, callback) {
		console.log('registerData', registerData);
		var u_doc = await User.findOne({ "email": registerData.email, "user_type": registerData.user_type }).exec();
		if (u_doc) {
			callback({ success: false, type: "Validation error", message: "Email already registered" });
			return false;
		}
		if (registerData.name == '') {
			callback({ success: false, type: "Validation error", message: "Name is required." });
			return false;
		}
		if (registerData.user_type == '') {
			callback({ success: false, type: "Validation error", message: "User type is required." });
			return false;
		}
		if (registerData.email == '') {
			callback({ success: false, type: "Validation error", message: "Email is required." });
			return false;
		}
		if (registerData.country_code == '') {
			callback({ success: false, type: "Validation error", message: "Country code is required." });
			return false;
		}
		if (registerData.only_mobile_no == '') {
			callback({ success: false, type: "Validation error", message: "Only mobile number is required." });
			return false;
		}
		if (registerData.password == '') {
			callback({ success: false, type: "Validation error", message: "Password is required." });
			return false;
		}
		let password_hash = bcrypt.hashSync(registerData.password, 10);
		var mobile_no = registerData.country_code + registerData.only_mobile_no;

		const user_data = new User({
			user_type: registerData.user_type,
			name: registerData.name,
			email: registerData.email,
			country_code: registerData.country_code,
			only_mobile_no: registerData.only_mobile_no,
			mobile_no: mobile_no,
			password: password_hash,
			status: 1,
			registered_from: 1,
		});
		user_data.save();

		callback({ success: true, message: 'Registration done successfully' });
	},

	login: async function (loginData, callback) {
		//console.log(loginData);
		if (loginData.email == '') {
			callback({ success: false, type: "Validation error", message: "Valid email is required" });
			return false;
		}
		if (loginData.password == '') {
			callback({ success: false, type: "Validation error", message: "Password is required" });
			return false;
		}
		if (loginData.user_type == '') {
			callback({ success: false, type: "Validation error", message: "Password is required" });
			return false;
		}

		var u_doc = await User.findOne({ "email": loginData.email, "user_type": loginData.user_type, "status": 1 }).exec();
		console.log(u_doc);
		if (u_doc) {
			if (!bcrypt.compareSync(loginData.password, u_doc.password)) {
				callback({ success: false, type: "Validation error", message: 'Invalid login credentials' });
			} else {
				let token = createToken(u_doc);
				callback({ success: true, message: 'Successfully logged in', data: u_doc, token: token });
			}
		} else {
			callback({ success: false, type: "Validation error", message: 'Invalid login credentials' });
		}
	},

	emailconfirm: async function (userData, callback) {
		//console.log(loginData);
		var randomvalue = 0;
		if (userData.email == '') {
			callback({ success: false, type: "Validation error", message: "Valid email is required" });
			return false;
		}

		var u_doc = await User.findOne({ "email": userData.email, "status": 1 }).exec();
		//console.log(u_doc);
		if (u_doc) {
			var randomval = Math.floor(1000 + Math.random() * 9000);
			randomvalue = randomval;


			let mailDetails = {
				from: "jagan@elvirainfotech.com",
				to: userData.email,
				subject: "forget opt",
				html: `<table><tr><td>Email: </td><td>OTP Code : ${randomval}</td></tr></table>`,
			};

			mail.sendMail(mailDetails, function (error, info) {
				if (error) {
					console.log(error);
				} else {

					User.updateOne({ "email": userData.email }, {
						"otp": randomval
					}).exec();

					console.log("Email sent: " + info.response);
					callback({ success: true, message: 'Otp Send Successfully', data: randomvalue });
				}
			});

		} else {
			callback({ success: false, type: "Validation error", message: 'Email-id Not Found' });
		}
	},
	userOtpMatch: async function (userData, callback) {
		console.log(userData, 'userData')

		User.findOne({ "otp": userData }).exec().then((docs) => {
			console.log(docs, 'docs')
			if (docs) {
				callback({ success: true, message: 'Your Email Verification Successfully' });
			}
			else {
				callback({ success: false, type: "Critical error", message: 'otp is incorrect' });
			}
		})
	},
	changePassword: async function (passwordData, callback) {
		if (passwordData.email == '') {
			callback({ success: false, type: "Validation error", message: "Email is required." });
			return false;
		}
		if (passwordData.new_password == '') {
			callback({ success: false, type: "Validation error", message: "New password is required." });
			return false;
		}

		var user_details = await User.findOne({ "email": passwordData.email }).exec();
		if (user_details) {
			let password_hash = bcrypt.hashSync(passwordData.new_password, 10);
			User.updateOne({ "email": passwordData.email }, {
				"password": password_hash
			}).exec();

			callback({ success: true, message: "Password updated successfully" });

		} else {
			callback({ success: false, message: "No data found" });
		}
	},
	createPayment: async function (userData, authData, callback) {
		console.log(userData, 'userData')
		//var u_doc = await User.findOne({ "email": userData.email, "user_type": userData.user_type }).exec();

		stripe.customers.create({
			email: userData.email,
			source: userData.token1
		})
			.then((customer) => {

				return stripe.charges.create({
					amount: userData.amount * 100,	 // Charging Rs 25
					description: 'subscription',
					currency: 'USD',
					customer: customer.id
				});
			})
			.then(async (charge) => {

				const transaction_data = new Transaction({
					transaction_user_id: userData.transaction_user_id,
					user_type: userData.user_type,
					transaction_amount: userData.transaction_amount,
					transaction_details: userData.transaction_details,
					transaction_status: 1,
					email: userData.email,
				});
				transaction_data.save();


				if (userData.sub_user_add_status == 'true') {

					// ======= subscription add ======= //
					const subscription_data = new Subscription({
						subscription_user_id: userData.subscription_user_id,
						user_type: userData.user_type,
						subscription_amount: userData.subscription_amount,
						subscription_duration: userData.subscription_duration,
						subscription_status: 1,
						email: userData.email,
						sub_user_type: 1
					});
					subscription_data.save();

					// ======= sub user add ======= //
					userData.sub_user_data = JSON.parse(userData.sub_user_data);
					console.log(userData.sub_user_data.password, 'userData.sub_user_add_status')
					let password_hash = bcrypt.hashSync(userData.sub_user_data.password, 10);
					var mobile_no = userData.sub_user_data.country_code + userData.sub_user_data.only_mobile_no;
					const user_data = new User({
						user_type: userData.sub_user_data.user_type,
						name: userData.sub_user_data.name,
						email: userData.sub_user_data.email,
						country_code: userData.sub_user_data.country_code,
						only_mobile_no: userData.sub_user_data.only_mobile_no,
						mobile_no: mobile_no,
						password: password_hash,
						status: 1,
						parent_id: authData.id,
						sub_user_type: userData.sub_user_data.sub_user_type,
						registered_from: 1
					});
					user_data.save();
				}
				else {
					var u_doc = await Subscription.findOne({ "subscription_user_id": userData.subscription_user_id, "user_type": userData.user_type }).exec();
					if (u_doc) {
						Subscription.updateOne({ "subscription_user_id": userData.subscription_user_id }, {
							"subscription_amount": userData.subscription_amount
						}).exec();

					} else {

						const subscription_data = new Subscription({
							subscription_user_id: userData.subscription_user_id,
							user_type: userData.user_type,
							subscription_amount: userData.subscription_amount,
							subscription_duration: userData.subscription_duration,
							subscription_status: 1,
							email: userData.email,
						});
						subscription_data.save();
					}
				}

				return;
			})
			.then(() => {
				callback({ success: true, message: 'Payment successfully' });
			})
			.catch((err) => {
				console.log(err);
				//res.status(500).send({ error: err.message });
				callback({ success: false, message: 'Something Went Wrong' });
			});
	},
	getPaymentDetails: async function (authData, callback) {
		var payment_data = await Subscription.findOne({ "subscription_user_id": authData.id }).exec();
		if (payment_data) {
			console.log(payment_data, 'payment_data')
			const currentDate = new Date();
			const expirationDate = payment_data.subscription_end_date;

			if (currentDate > expirationDate) {
				Subscription.updateOne({ "subscription_user_id": authData.id }, {
					"subscription_user_id": payment_data.subscription_user_id,
					"user_type": payment_data.user_type,
					"subscription_amount": payment_data.subscription_amount,
					"subscription_status": 0,
					"subscription_start_date": payment_data.subscription_start_date,
					"subscription_end_date": payment_data.subscription_end_date,
					"dom": new Date()
				}).exec();

			}
			const payment_details = {
				subscription_id: payment_data.subscription_user_id,
				user_type: payment_data.user_type,
				subscription_amount: payment_data.subscription_amount,
				subscription_status: payment_data.subscription_status,
				subscription_start_date: payment_data.subscription_start_date,
				subscription_end_date: payment_data.subscription_end_date,
			};
			callback({ success: true, message: 'Subscription details fetched', data: payment_details });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	updatePersonalDetails: async function (personalData, docFile, authData, callback) {
		console.log('docFile', docFile);
		//console.log('docFile.profile_image',docFile.profile_image); //return false;
		//console.log('docFile.cv',docFile.cv); //return false;
		if (personalData.name == '') {
			callback({ success: false, type: "Validation error", message: "Valid email is required" });
			return false;
		}
		if (personalData.country_code == '') {
			callback({ success: false, type: "Validation error", message: "Country code is required." });
			return false;
		}
		if (personalData.only_mobile_no == '') {
			callback({ success: false, type: "Validation error", message: "Only mobile number is required." });
			return false;
		}

		var mobile_no = personalData.country_code + personalData.only_mobile_no;


		if (docFile != null) {
			if (docFile.profile_image) {
				if (docFile.profile_image.name.trim() != '') {
					var ext = docFile.profile_image.name.slice(docFile.profile_image.name.lastIndexOf('.'));
					var profile_image_name = "profile" + '1' + Date.now() + ext;
					var folderpath = 'public/profile_image/';

					docFile.profile_image.mv(folderpath + profile_image_name);
				}
			}
			if (docFile.cv) {
				if (docFile.cv.name.trim() != '') {
					var ext = docFile.cv.name.slice(docFile.cv.name.lastIndexOf('.'));
					var cv_name = "cv" + '1' + Date.now() + ext;
					var folderpath = 'public/cv/';

					docFile.cv.mv(folderpath + cv_name);
				}
			}
		}

		// if(docFile) {
		// 	var profile_image_name = null;
		// 	if(docFile.profile_image.name.trim() != '') {
		// 		var ext = docFile.profile_image.name.slice(docFile.profile_image.name.lastIndexOf('.'));
		// 		var profile_image_name = "profile"+ '1' + Date.now() + ext;
		// 		var folderpath = 'public/profile_image/';

		// 		docFile.profile_image.mv(folderpath + profile_image_name);
		// 	}
		// 	var cv = null;
		// 	if(docFile.cv.name.trim() != '') {
		// 		var ext = docFile.cv.name.slice(docFile.cv.name.lastIndexOf('.'));
		// 		var cv_name = "cv"+ '1' + Date.now() + ext;
		// 		var folderpath = 'public/cv/';

		// 		docFile.cv.mv(folderpath + cv_name);
		// 	}
		// }

		User.updateOne({ "_id": authData.id }, {
			"name": personalData.name,
			"country_code": personalData.country_code,
			"only_mobile_no": personalData.only_mobile_no,
			"mobile_no": mobile_no,
			//"profile_picture": profile_image_name,
			//"cv": cv_name,
			"dom": new Date()
		}).exec();

		if (docFile) {
			if (docFile.profile_image) {
				User.updateOne({ "_id": authData.id }, {
					"profile_picture": profile_image_name
				}).exec();
			}
			if (docFile.cv) {
				User.updateOne({ "_id": authData.id }, {
					"cv": cv_name,
				}).exec();
			}
		}

		callback({ success: true, message: 'Personal details updated successfully' });
	},
	getPersonalDetails: async function (authData, callback) {
		User.findOne({ "_id": authData.id }).exec().then((docs) => {
			if (docs) {
				if (docs.profile_picture == null) {
					var profile_img = null;
				} else {
					var profile_img = staging_siteurl + 'public/profile_image/' + docs.profile_picture;
				}
				if (docs.cv == null) {
					var cv = null;
				} else {
					var cv = staging_siteurl + 'public/cv/' + docs.cv;
				}

				var user_profile_data = {
					user_id: docs._id,
					name: docs.name,
					email: docs.email,
					mobile_no: docs.mobile_no,
					country_code: docs.country_code,
					only_mobile_no: docs.only_mobile_no,
					profile_picture: profile_img,
					cv: cv,
					user_type: docs.user_type
				};
				callback({ success: true, message: 'User details', data: user_profile_data });
			}
			else {
				callback({ success: false, type: "Critical error", message: "Valid user not found with supplied token." });
			}
		}).catch((e) => {
			callback({ success: false, type: "Server error", message: "Error in user findings.", Eorror: e });
		});
	},
	updateLicenseDetails: async function (LicenseData, docFile, authData, callback) {
		console.log('LicenseData', LicenseData);
		//console.log('LicenseData.additional_license_arr',LicenseData.additional_license_arr);
		if (LicenseData.national_license_issue_date == '' && LicenseData.national_license_expiry_date == '' && LicenseData.state_license_issue_date == '' && LicenseData.state_license_expiry_date == '' && LicenseData.cds_license_issue_date == '' && LicenseData.cds_license_expiry_date == '' && LicenseData.dea_license_issue_date == '' && LicenseData.dea_license_expiry_date == '') {
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

		var nls = "Yes"
		var sls = "Yes"
		var cls = "Yes"
		var dls = "Yes"
		if (LicenseData.national_license_status == 'false') {
			var nls = "No"
			var nlid = ""
			var nled = ""

		}
		if (LicenseData.state_license_status == 'false') {
			var sls = "No"
			var slid = ""
			var sled = ""

		}
		if (LicenseData.cds_license_status == 'false') {
			var cls = "No"
			var clid = ""
			var cled = ""

		}
		if (LicenseData.dea_license_status == 'false') {
			var dls = "No"
			var dlid = ""
			var dled = ""

		}
		if (docFile) {
			if (docFile.national_license_file && nls != "No") {
				if (docFile.national_license_file.name.trim() != '') {
					var ext = docFile.national_license_file.name.slice(docFile.national_license_file.name.lastIndexOf('.'));
					var national_license_file = "national_license_file" + '1' + Date.now() + ext;
					var folderpath = 'public/national_license_file/';

					docFile.national_license_file.mv(folderpath + national_license_file);
				}
			}
			if (docFile.state_license_file && sls != "No") {
				if (docFile.state_license_file.name.trim() != '') {
					var ext = docFile.state_license_file.name.slice(docFile.state_license_file.name.lastIndexOf('.'));
					var state_license_file = "state_license_file" + '1' + Date.now() + ext;
					var folderpath = 'public/state_license_file/';

					docFile.state_license_file.mv(folderpath + state_license_file);
				}
			}
			if (docFile.cds_license_file && cls != "No") {
				if (docFile.cds_license_file.name.trim() != '') {
					var ext = docFile.cds_license_file.name.slice(docFile.cds_license_file.name.lastIndexOf('.'));
					var cds_license_file = "cds_license_file" + '1' + Date.now() + ext;
					var folderpath = 'public/cds_license_file/';

					docFile.cds_license_file.mv(folderpath + cds_license_file);
				}
			}
			if (docFile.dea_license_file && dls != "No") {
				if (docFile.dea_license_file.name.trim() != '') {
					var ext = docFile.dea_license_file.name.slice(docFile.dea_license_file.name.lastIndexOf('.'));
					var dea_license_file = "dea_license_file" + '1' + Date.now() + ext;
					var folderpath = 'public/dea_license_file/';

					docFile.dea_license_file.mv(folderpath + dea_license_file);
				}
			}
		}
		var user_lisence_data = await UserLicense.findOne({ "user_id": authData.id }).exec();
		if (user_lisence_data) {
			if (docFile) {
				if (docFile.national_license_file && nls != "No") {
					UserLicense.updateOne({ "user_id": authData.id }, {
						"national_license_file": national_license_file
					}).exec();
				}
				if (docFile.state_license_file && sls != "No") {
					UserLicense.updateOne({ "user_id": authData.id }, {
						"state_license_file": state_license_file
					}).exec();
				}
				if (docFile.cds_license_file && cls != "No") {
					UserLicense.updateOne({ "user_id": authData.id }, {
						"cds_license_file": cds_license_file
					}).exec();
				}
				if (docFile.dea_license_file && dls != "No") {
					UserLicense.updateOne({ "user_id": authData.id }, {
						"dea_license_file": dea_license_file
					}).exec();
				}
			}


			UserLicense.updateOne({ "user_id": authData.id }, {
				"national_license_issue_date": nlid,
				"national_license_expiry_date": nled,
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

		} else {
			const license_data = new UserLicense({
				user_id: authData.id,
				national_license_file: national_license_file,
				national_license_issue_date: nlid,
				national_license_expiry_date: nled,
				national_license_status: nls,
				state_license_file: state_license_file,
				state_license_issue_date: slid,
				state_license_expiry_date: sled,
				state_license_status: sls,
				cds_license_file: cds_license_file,
				cds_license_issue_date: clid,
				cds_license_expiry_date: cled,
				cds_license_status: cls,
				dea_license_file: dea_license_file,
				dea_license_issue_date: dlid,
				dea_license_expiry_date: dled,
				dea_license_status: dls,
			});
			license_data.save();
		}
		// if(LicenseData.additional_license_arr && LicenseData.additional_license_arr.length > 0)
		// {
		// 	console.log('array asche');
		// 	var additiona_license_results = [];
		// 	for (var i = 0; i < LicenseData.additional_license_arr.length; i++) {
		// 		var ext = LicenseData.additional_license_arr[i].license_file.name.slice(LicenseData.additional_license_arr[i].license_file.name.lastIndexOf('.'));
		// 		var additional_license = "additional_license"+ i + Date.now() + ext;
		// 		var folderpath = 'public/additional_license/';

		// 		additiona_license_results.push({
		// 			user_id: authData.id,
		// 			license_name: LicenseData.additional_license_arr[i].license_name,
		// 			license_file: additional_license,
		// 			license_issue_date: LicenseData.additional_license_arr[i].license_issue_date,
		// 			license_expiry_date: LicenseData.additional_license_arr[i].license_expiry_date,
		// 		});

		// 		LicenseData.additional_license_arr[i].license_file.mv(folderpath + additional_license, (err) => {
		// 			if (err) {
		// 				callback({success: false,type:"Upload error",message: "Error in images."});
		// 			}
		// 		});
		// 	}
		// 	UserAdditonalLicense.insertMany(additiona_license_results).then(function(){
		// 		console.log("Data inserted")// Success
		// 	}).catch(function(error){
		// 		console.log(error)// Failure
		// 	});
		// }
		callback({ success: true, message: 'License details updated successfully' });
	},
	updateAdditionalLicenseDetails: async function (LicenseData, docFile, authData, callback) {
		if (LicenseData.license_name == '') {
			callback({ success: false, type: "Validation error", message: "Addtional license name is required" });
			return false;
		}
		if (LicenseData.license_issue_date == '') {
			callback({ success: false, type: "Validation error", message: "Additional license issue date is required" });
			return false;
		}
		if (LicenseData.license_expiry_date == '') {
			callback({ success: false, type: "Validation error", message: "Additional license expire date is required." });
			return false;
		}

		if (docFile) {
			if (docFile.license_file) {
				if (docFile.license_file.name.trim() != '') {
					var ext = docFile.license_file.name.slice(docFile.license_file.name.lastIndexOf('.'));
					var license_file = "license_file" + '1' + Date.now() + ext;
					var folderpath = 'public/additional_license/';

					docFile.license_file.mv(folderpath + license_file);
				}
			}
		}

		const license_data = new UserAdditonalLicense({
			user_id: authData.id,
			license_file: license_file,
			license_name: LicenseData.license_name,
			license_issue_date: LicenseData.license_issue_date,
			license_expiry_date: LicenseData.license_expiry_date
		});
		license_data.save();

		callback({ success: true, message: 'Additional license details updated successfully' });
	},
	getLicenseDetails: async function (authData, callback) {
		var user_lisence_data = await UserLicense.findOne({ "user_id": authData.id }).exec();
		if (user_lisence_data) {
			if (user_lisence_data.national_license_file == null) {
				var national_license_file = null;
			} else {
				var national_license_file = staging_siteurl + 'public/national_license_file/' + user_lisence_data.national_license_file;
			}
			if (user_lisence_data.state_license_file == null) {
				var state_license_file = null;
			} else {
				var state_license_file = staging_siteurl + 'public/state_license_file/' + user_lisence_data.state_license_file;
			}
			if (user_lisence_data.cds_license_file == null) {
				var cds_license_file = null;
			} else {
				var cds_license_file = staging_siteurl + 'public/cds_license_file/' + user_lisence_data.cds_license_file;
			}
			if (user_lisence_data.dea_license_file == null) {
				var dea_license_file = null;
			} else {
				var dea_license_file = staging_siteurl + 'public/dea_license_file/' + user_lisence_data.dea_license_file;
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

			var user_additional_lisence_data = await UserAdditonalLicense.find({ "user_id": authData.id }).exec();

			var additional_license_result = [];
			if (user_additional_lisence_data.length > 0) {
				for (var i = 0; i < (user_additional_lisence_data.length); i++) {
					var license_file = staging_siteurl + 'public/additional_license/' + user_additional_lisence_data[i].license_file;
					additional_license_result.push({
						additiona_license_id: user_additional_lisence_data[i]._id,
						license_file: license_file,
						license_name: user_additional_lisence_data[i].license_name,
						license_issue_date: user_additional_lisence_data[i].license_issue_date,
						license_expiry_date: user_additional_lisence_data[i].license_expiry_date,
					});
				}
			}
			callback({ success: true, message: 'License details', data: license_data, additional_data: additional_license_result });
		} else {
			callback({ success: false, type: "Critical error", message: "Valid user not found with supplied token." });
		}

	},
	updateCertificateDetails: async function (certificateData, docFile, authData, callback) {
		if (certificateData.bls_issue_date == '' && certificateData.bls_expiry_date == '' && certificateData.acls_issue_date == '' && certificateData.acls_expiry_date == '' && certificateData.pls_issue_date == '' && certificateData.pls_expiry_date == '') {
			callback({ success: false, type: "Validation error", message: " above fields required" });
			return false;
		}
		var bid = certificateData.bls_issue_date
		var bed = certificateData.bls_expiry_date
		var aid = certificateData.acls_issue_date
		var aed = certificateData.acls_expiry_date
		var pid = certificateData.pls_issue_date
		var ped = certificateData.pls_expiry_date


		var bls = "Yes"
		var acls = "Yes"
		var pls = "Yes"

		if (certificateData.bls_status == 'false') {
			var bls = "No"
			var bid = ""
			var bed = ""

		}
		if (certificateData.acls_status == 'false') {
			var acls = "No"
			var aid = ""
			var aed = ""
		}
		if (certificateData.pls_status == 'false') {
			var pls = "No"
			var pid = ""
			var ped = ""
		}

		if (docFile) {
			if (docFile.bls_file && bls != "No") {
				if (docFile.bls_file.name.trim() != '') {
					var ext = docFile.bls_file.name.slice(docFile.bls_file.name.lastIndexOf('.'));
					var bls_file = "bls_file" + '1' + Date.now() + ext;
					var folderpath = 'public/certificate/';

					docFile.bls_file.mv(folderpath + bls_file);
				}
			}
			if (docFile.acls_file && acls != "No") {
				if (docFile.acls_file.name.trim() != '') {
					var ext = docFile.acls_file.name.slice(docFile.acls_file.name.lastIndexOf('.'));
					var acls_file = "acls_file" + '1' + Date.now() + ext;
					var folderpath = 'public/certificate/';

					docFile.acls_file.mv(folderpath + acls_file);
				}
			}
			if (docFile.pls_file && pls != "No") {
				if (docFile.pls_file.name.trim() != '') {
					var ext = docFile.pls_file.name.slice(docFile.pls_file.name.lastIndexOf('.'));
					var pls_file = "pls_file" + '1' + Date.now() + ext;
					var folderpath = 'public/certificate/';

					docFile.pls_file.mv(folderpath + pls_file);
				}
			}
		}
		var user_certificate_data = await UserCertificate.findOne({ "user_id": authData.id }).exec();
		if (user_certificate_data) {
			if (docFile) {
				if (docFile.bls_file && bls != "No") {
					UserCertificate.updateOne({ "user_id": authData.id }, {
						"bls_file": bls_file
					}).exec();
				}
				if (docFile.acls_file && acls != "No") {
					UserCertificate.updateOne({ "user_id": authData.id }, {
						"acls_file": acls_file
					}).exec();
				}
				if (docFile.pls_file && pls != "No") {
					UserCertificate.updateOne({ "user_id": authData.id }, {
						"pls_file": pls_file
					}).exec();
				}
			}
			UserCertificate.updateOne({ "user_id": authData.id }, {
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
		} else {
			const certificate_data = new UserCertificate({
				user_id: authData.id,
				bls_file: bls_file,
				bls_issue_date: bid,
				bls_expiry_date: bed,
				bls_status: bls,
				acls_file: acls_file,
				acls_issue_date: aid,
				acls_expiry_date: aed,
				acls_status: acls,
				pls_file: pls_file,
				pls_issue_date: pid,
				pls_expiry_date: ped,
				pls_status: pls
			});
			certificate_data.save();
		}

		// if(certificateData.additional_certificate_arr && certificateData.additional_certificate_arr.length > 0)
		// {
		// 	var additiona_certificate_results = [];
		// 	for (var i = 0; i < certificateData.additional_certificate_arr.length; i++) {
		// 		var ext = certificateData.additional_certificate_arr[i].certificate_file.name.slice(certificateData.additional_certificate_arr[i].certificate_file.lastIndexOf('.'));
		// 		var additional_certificate = "certificate"+ i + Date.now() + ext;
		// 		var folderpath = 'public/certificate/';

		// 		additiona_certificate_results.push({
		// 			user_id: authData.id,
		// 			license_name: certificateData.additional_certificate_arr[i].certificate_name,
		// 			certificate_file: additional_certificate,
		// 			certificate_issue_date: certificateData.additional_certificate_arr[i].certificate_issue_date,
		// 			certificate_expiry_date: certificateData.additional_certificate_arr[i].certificate_expiry_date
		// 		});

		// 		certificateData.additional_certificate_arr[i].certificate_file.mv(folderpath + additional_certificate, (err) => {
		// 			if (err) {
		// 				callback({success: false,type:"Upload error",message: "Error in images."});
		// 			}
		// 		});
		// 	}
		// 	UserAdditonalCertificate.insertMany(additiona_certificate_results).then(function(){
		// 		console.log("Data inserted")// Success
		// 	}).catch(function(error){
		// 		console.log(error)// Failure
		// 	});
		// }

		callback({ success: true, message: 'Certificate details updated successfully' });
	},
	updateAdditionalCertificateDetails: async function (certificateData, docFile, authData, callback) {
		if (certificateData.certificate_name == '') {
			callback({ success: false, type: "Validation error", message: "Certificate name is required" });
			return false;
		}
		if (certificateData.certificate_issue_date == '') {
			callback({ success: false, type: "Validation error", message: "Certificate issue date is required" });
			return false;
		}
		if (certificateData.certificate_expiry_date == '') {
			callback({ success: false, type: "Validation error", message: "Certificate expire date is required." });
			return false;
		}

		if (docFile) {
			if (docFile.certificate_file) {
				if (docFile.certificate_file.name.trim() != '') {
					var ext = docFile.certificate_file.name.slice(docFile.certificate_file.name.lastIndexOf('.'));
					var certificate_file = "a_certificate_file" + '1' + Date.now() + ext;
					var folderpath = 'public/certificate/';
					docFile.certificate_file.mv(folderpath + certificate_file);
				}
			}
		}

		const certificate_data = new UserAdditonalCertificate({
			user_id: authData.id,
			certificate_file: certificate_file,
			certificate_name: certificateData.certificate_name,
			certificate_issue_date: certificateData.certificate_issue_date,
			certificate_expiry_date: certificateData.certificate_expiry_date
		});
		certificate_data.save();

		callback({ success: true, message: 'Additional certificate details updated successfully' });
	},
	getCertificateDetails: async function (authData, callback) {
		var user_certificate_data = await UserCertificate.findOne({ "user_id": authData.id }).exec();
		//console.log(user_certificate_data);
		if (user_certificate_data) {
			if (user_certificate_data.bls_file == null) {
				var bls_file = null;
			} else {
				var bls_file = staging_siteurl + 'public/certificate/' + user_certificate_data.bls_file;
			}
			if (user_certificate_data.acls_file == null) {
				var acls_file = null;
			} else {
				var acls_file = staging_siteurl + 'public/certificate/' + user_certificate_data.acls_file;
			}
			if (user_certificate_data.pls_file == null) {
				var pls_file = null;
			} else {
				var pls_file = staging_siteurl + 'public/certificate/' + user_certificate_data.pls_file;
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
			var user_additional_certificate_data = await UserAdditonalCertificate.find({ "user_id": authData.id }).exec();

			var additional_certifcate_result = [];
			if (user_additional_certificate_data.length > 0) {
				for (var i = 0; i < (user_additional_certificate_data.length); i++) {
					var certificate_file = staging_siteurl + 'public/certificate/' + user_additional_certificate_data[i].certificate_file;
					additional_certifcate_result.push({
						additiona_certificate_id: user_additional_certificate_data[i]._id,
						certificate_file: certificate_file,
						certificate_issue_date: user_additional_certificate_data[i].certificate_issue_date,
						certificate_expiry_date: user_additional_certificate_data[i].certificate_expiry_date,
						certificate_name: user_additional_certificate_data[i].certificate_name,
					});
				}
			}
			callback({ success: true, message: 'Certificate details', data: license_data, additional_data: additional_certifcate_result });
		} else {
			callback({ success: false, type: "Critical error", message: "Valid user not found with supplied token." });
		}
	},
	updateEmployementDetails: async function (empData, authData, callback) {
		console.log(empData, 'empData')
		if (empData.c_job_name == '' && empData.c_job_from_year == '') {
			callback({ success: false, type: "Validation error", message: " above fields required" });
			return false;
		}



		var employement_data = await UserEmployement.findOne({ "user_id": authData.id }).exec();
		if (employement_data) {
			UserEmployement.updateOne({ "user_id": authData.id }, {
				"c_job_name": empData.c_job_name,
				"c_job_from_year": empData.c_job_from_year,

				"dom": new Date()
			}).exec();
		} else {
			const emp_data = new UserEmployement({
				user_id: authData.id,
				c_job_name: empData.c_job_name,
				c_job_from_year: empData.c_job_from_year,

			});
			emp_data.save();
		}
		callback({ success: true, message: 'Employement details updated successfully' });
	},
	updateAdditionalEmployementDetails: async function (empData, authData, callback) {

		if (empData.job_name == '') {
			callback({ success: false, type: "Validation error", message: "Job name is required." });
			return false;
		}
		if (empData.employment_start_date == '') {
			callback({ success: false, type: "Validation error", message: "From year is required." });
			return false;
		}
		if (empData.employment_end_date == '') {
			callback({ success: false, type: "Validation error", message: "To year is required." });
			return false;
		}
		const emp_Data = new UserAdditionalEmployement({
			user_id: authData.id,
			job_name: empData.job_name,
			employment_start_date: empData.employment_start_date,
			employment_end_date: empData.employment_end_date
		});
		emp_Data.save();
		callback({ success: true, message: 'Additional Employement details updated successfully' });
	},
	getEmployementDetails: async function (authData, callback) {
		var emp_data = await UserEmployement.findOne({ "user_id": authData.id }).exec();
		if (emp_data) {
			const emp_details = {
				employement_id: emp_data._id,
				c_job_name: emp_data.c_job_name,
				c_job_from_year: emp_data.c_job_from_year,

			};

			var user_additional_employement_data = await UserAdditionalEmployement.find({ "user_id": authData.id }).exec();

			var additional_employement_result = [];
			if (user_additional_employement_data.length > 0) {
				for (var i = 0; i < (user_additional_employement_data.length); i++) {
					additional_employement_result.push({
						additiona_employement_id: user_additional_employement_data[i]._id,
						job_name: user_additional_employement_data[i].job_name,
						employment_start_date: user_additional_employement_data[i].employment_start_date,
						employment_end_date: user_additional_employement_data[i].employment_end_date,
					});
				}
			}
			callback({ success: true, message: 'Employement details fetched', data: emp_details, additional_data: additional_employement_result });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	// updateMedicalHistory: async function (medicalData, docFile, authData, callback) {
	// 	if(docFile) {
	// 		if(docFile.covid_certificate) {
	// 			if(docFile.covid_certificate.name.trim() != '') {
	// 				var ext = docFile.covid_certificate.name.slice(docFile.covid_certificate.name.lastIndexOf('.'));
	// 				var covid_certificate = "covid_certificate"+ '1' + Date.now() + ext;
	// 				var folderpath = 'public/medical/';

	// 				docFile.covid_certificate.mv(folderpath + covid_certificate);
	// 			}
	// 		}
	// 		if(docFile.flu_certificate) {
	// 			if(docFile.flu_certificate.name.trim() != '') {
	// 				var ext = docFile.flu_certificate.name.slice(docFile.flu_certificate.name.lastIndexOf('.'));
	// 				var flu_certificate = "flu_certificate"+ '1' + Date.now() + ext;
	// 				var folderpath = 'public/medical/';

	// 				docFile.flu_certificate.mv(folderpath + flu_certificate);
	// 			}
	// 		}
	// 	}
	// 	var user_medical_data = await UserMedicalHistory.findOne({"user_id":authData.id}).exec();
	// 	if(user_medical_data) {
	// 		if(docFile) {
	// 			if(docFile.covid_certificate) {
	// 				UserMedicalHistory.updateOne({ "user_id": authData.id},{
	// 					"covid_certificate": covid_certificate
	// 				}).exec();
	// 			}
	// 			if(docFile.flu_certificate) {
	// 				UserMedicalHistory.updateOne({ "user_id": authData.id},{
	// 					"flu_certificate": flu_certificate
	// 				}).exec();
	// 			}
	// 		}
	// 		UserMedicalHistory.updateOne({ "user_id": authData.id},{
	// 			"mmr_vaccine": medicalData.mmr_vaccine,
	// 			"hepatitis_vaccine": medicalData.hepatitis_vaccine
	// 		}).exec();
	// 	} else {
	// 		const medical_data = new UserMedicalHistory({
	// 			user_id: authData.id,
	// 			covid_certificate: covid_certificate,
	// 			flu_certificate: flu_certificate,
	// 			mmr_vaccine: medicalData.mmr_vaccine,
	// 			hepatitis_vaccine: medicalData.hepatitis_vaccine
	// 		});
	// 		medical_data.save();
	// 	}
	// 	callback({ success: true, message: 'Medical history updated successfully' });
	// },
	updateMedicalHistory: async function (medicalData, docFile, authData, callback) {
		console.log('docFile', docFile);
		var cd2s = medicalData.covid_date_2_status
		var cd3s = medicalData.covid_date_3_status
		var cd4s = medicalData.covid_date_4_status
		var cd2s = "Yes"
		var cd3s = "Yes"
		var cd4s = "Yes"


		if (medicalData.covid_date_2_status == 'false') {
			var cd2s = "No"
		}
		if (medicalData.covid_date_3_status == 'false') {
			var cd3s = "No"
		}
		if (medicalData.covid_date_4_status == 'false') {
			var cd4s = "No"
		}
		console.log('medicalData', medicalData);
		if (docFile) {
			if (docFile.covid_certificate) {
				if (docFile.covid_certificate.name.trim() != '') {
					var ext = docFile.covid_certificate.name.slice(docFile.covid_certificate.name.lastIndexOf('.'));
					var covid_certificate = "covid_certificate" + '1' + Date.now() + ext;
					var folderpath = 'public/medical/';

					docFile.covid_certificate.mv(folderpath + covid_certificate);
				}
			}
			if (docFile.flu_certificate) {
				if (docFile.flu_certificate.name.trim() != '') {
					var ext = docFile.flu_certificate.name.slice(docFile.flu_certificate.name.lastIndexOf('.'));
					var flu_certificate = "flu_certificate" + '1' + Date.now() + ext;
					var folderpath = 'public/medical/';

					docFile.flu_certificate.mv(folderpath + flu_certificate);
				}
			}
			if (docFile.tetanus) {
				if (docFile.tetanus.name != '') {
					var ext = docFile.tetanus.name.slice(docFile.tetanus.name.lastIndexOf('.'));
					var tetanus = "tetanus" + '1' + Date.now() + ext;
					var folderpath = 'public/medical/';

					docFile.tetanus.mv(folderpath + tetanus);
				}
			}
			if (docFile.mmr_vaccine) {
				if (docFile.mmr_vaccine.name != '') {
					var ext = docFile.mmr_vaccine.name.slice(docFile.mmr_vaccine.name.lastIndexOf('.'));
					var mmr_vaccine = "mmr_vaccine" + '1' + Date.now() + ext;
					var folderpath = 'public/medical/';

					docFile.mmr_vaccine.mv(folderpath + mmr_vaccine);
				}
			}
			if (docFile.hepatitis_vaccine) {
				if (docFile.hepatitis_vaccine.name.trim() != '') {
					var ext = docFile.hepatitis_vaccine.name.slice(docFile.hepatitis_vaccine.name.lastIndexOf('.'));
					var hepatitis_vaccine = "hepatitis_vaccine" + '1' + Date.now() + ext;
					var folderpath = 'public/medical/';

					docFile.hepatitis_vaccine.mv(folderpath + hepatitis_vaccine);
				}
			}
		}
		var user_medical_data = await UserMedicalHistory.findOne({ "user_id": authData.id }).exec();
		if (user_medical_data) {
			if (docFile) {
				if (docFile.covid_certificate) {
					UserMedicalHistory.updateOne({ "user_id": authData.id }, {
						"covid_certificate": covid_certificate
					}).exec();
				}
				if (docFile.flu_certificate) {
					UserMedicalHistory.updateOne({ "user_id": authData.id }, {
						"flu_certificate": flu_certificate
					}).exec();
				}
				if (docFile.tetanus) {
					UserMedicalHistory.updateOne({ "user_id": authData.id }, {
						"tetanus": tetanus
					}).exec();
				}
				if (docFile.mmr_vaccine) {
					UserMedicalHistory.updateOne({ "user_id": authData.id }, {
						"mmr_vaccine": mmr_vaccine
					}).exec();
				}
				if (docFile.hepatitis_vaccine) {
					UserMedicalHistory.updateOne({ "user_id": authData.id }, {
						"hepatitis_vaccine": hepatitis_vaccine
					}).exec();
				}
			}
			UserMedicalHistory.updateOne({ "user_id": authData.id }, {
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
		} else {
			const medical_data = new UserMedicalHistory({
				user_id: authData.id,
				covid_certificate: covid_certificate,
				flu_certificate: flu_certificate,
				mmr_vaccine: mmr_vaccine,
				hepatitis_vaccine: hepatitis_vaccine,
				tetanus: tetanus,
				covid_date_1: medicalData.covid_date_1,
				covid_date_2: medicalData.covid_date_2,
				covid_date_2_status: cd2s,
				covid_date_3: medicalData.covid_date_3,
				covid_date_3_status: cd3s,
				covid_date_4: medicalData.covid_date_4,
				covid_date_4_status: cd4s,
				flu_date: medicalData.flu_date,
				tetanus_date: medicalData.tetanus_date,
				mmr_immune: medicalData.mmr_immune,
				hepatitis_immune: medicalData.hepatitis_immune,
			});
			medical_data.save();
		}
		callback({ success: true, message: 'Medical history updated successfully' });
	},
	getMedicalHistoty: async function (authData, callback) {
		var user_medical_data = await UserMedicalHistory.findOne({ "user_id": authData.id }).exec();
		if (user_medical_data) {
			var covid_certificate = staging_siteurl + 'public/medical/' + user_medical_data.covid_certificate;
			var flu_certificate = staging_siteurl + 'public/medical/' + user_medical_data.flu_certificate;
			var tetanus = staging_siteurl + 'public/medical/' + user_medical_data.tetanus;
			var mmr_vaccine = staging_siteurl + 'public/medical/' + user_medical_data.mmr_vaccine;
			var hepatitis_vaccine = staging_siteurl + 'public/medical/' + user_medical_data.hepatitis_vaccine;

			const medical_history_data = {
				medical_id: user_medical_data._id,
				covid_certificate: covid_certificate,
				flu_certificate: flu_certificate,
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
				tetanus: tetanus,
				tetanus_date: user_medical_data.tetanus_date,
				mmr_immune: user_medical_data.mmr_immune,
				hepatitis_immune: user_medical_data.hepatitis_immune,
			};

			callback({ success: true, message: 'Medical details fetched', data: medical_history_data });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	updateEducationDetails: async function (eduData, authData, callback) {
		console.log(eduData, 'eduData')
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

		var gs = "Yes"
		var ms = "Yes"


		if (eduData.g_status == 'false') {
			var gs = "No"
			var gfy = ""
			var gty = ""
			var gin = ""

		}
		if (eduData.med_status == 'false') {
			var ms = "No"
			var msfy = ""
			var msty = ""
			var min = ""
		}

		var education_data = await UserEducation.findOne({ "user_id": authData.id }).exec();
		if (education_data) {
			UserEducation.updateOne({ "user_id": authData.id }, {
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
				"med_status": ms,
				"dom": new Date()
			}).exec();
		} else {
			const edu_data = new UserEducation({
				user_id: authData.id,
				ug_institute_name: eduData.ug_institute_name,
				ug_from_year: eduData.ug_from_year,
				ug_to_year: eduData.ug_to_year,
				g_institute_name: gin,
				g_from_year: gfy,
				g_to_year: gty,
				g_status: gs,
				med_institue_name: min,
				med_school_from_year: msfy,
				med_school_to_year: msty,
				med_status: ms,
			});
			edu_data.save();
		}
		callback({ success: true, message: 'Education details updated successfully' });
	},
	updateAdditionalEducationDetails: async function (eduData, authData, callback) {
		if (eduData.edu_name == '') {
			callback({ success: false, type: "Validation error", message: "Institution name is required." });
			return false;
		}
		if (eduData.education_name == '') {
			callback({ success: false, type: "Validation error", message: "Education name is required." });
			return false;
		}
		if (eduData.from_year == '') {
			callback({ success: false, type: "Validation error", message: "From year is required." });
			return false;
		}
		if (eduData.to_year == '') {
			callback({ success: false, type: "Validation error", message: "To year is required." });
			return false;
		}
		const edu_data = new UserAdditionalEducation({
			user_id: authData.id,
			education_name: eduData.education_name,
			edu_name: eduData.edu_name,
			from_year: eduData.from_year,
			to_year: eduData.to_year
		});
		edu_data.save();
		callback({ success: true, message: 'Additional Education details updated successfully' });
	},
	getEducationDetails: async function (authData, callback) {
		var edu_data = await UserEducation.findOne({ "user_id": authData.id }).exec();
		if (edu_data) {
			const edu_details = {
				education_id: edu_data._id,
				ug_institute_name: edu_data.ug_institute_name,
				ug_from_year: edu_data.ug_from_year,
				ug_to_year: edu_data.ug_to_year,

				g_institute_name: edu_data.g_institute_name,
				g_from_year: edu_data.g_from_year,
				g_to_year: edu_data.g_to_year,
				g_status: edu_data.g_status,
				med_institue_name: edu_data.med_institue_name,
				med_school_from_year: edu_data.med_school_from_year,
				med_school_to_year: edu_data.med_school_to_year,
				med_status: edu_data.med_status,

			};

			var user_additional_education_data = await UserAdditionalEducation.find({ "user_id": authData.id }).exec();

			var additional_education_result = [];
			if (user_additional_education_data.length > 0) {
				for (var i = 0; i < (user_additional_education_data.length); i++) {
					additional_education_result.push({
						additiona_education_id: user_additional_education_data[i]._id,
						education_name: user_additional_education_data[i].education_name,
						edu_name: user_additional_education_data[i].edu_name,
						from_year: user_additional_education_data[i].from_year,
						to_year: user_additional_education_data[i].to_year,
					});
				}
			}
			callback({ success: true, message: 'Education details fetched', data: edu_details, additional_data: additional_education_result });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	saveUserReferences: async function (refData, authData, callback) {
		if (refData.first_reference == '') {
			callback({ success: false, type: "Validation error", message: "First reference is required." });
			return false;
		}
		if (refData.second_reference == '') {
			callback({ success: false, type: "Validation error", message: "Second reference is required." });
			return false;
		}
		if (refData.third_reference == '') {
			callback({ success: false, type: "Validation error", message: "Third reference is required." });
			return false;
		}

		var reference_data = await UserReference.findOne({ "user_id": authData.id }).exec();
		if (reference_data) {
			UserReference.updateOne({ "user_id": authData.id }, {
				"first_reference": refData.first_reference,
				"second_reference": refData.second_reference,
				"third_reference": refData.third_reference,
				"dom": new Date()
			}).exec();
		} else {
			const ref_data = new UserReference({
				user_id: authData.id,
				first_reference: refData.first_reference,
				second_reference: refData.second_reference,
				third_reference: refData.third_reference
			});
			ref_data.save();
		}
		callback({ success: true, message: 'Reference saved successfully' });
	},
	getReferenceDetails: async function (authData, callback) {
		var ref_data = await UserReference.findOne({ "user_id": authData.id }).exec();
		if (ref_data) {
			const ref_details = {
				reference_id: ref_data._id,
				first_reference: ref_data.first_reference,
				second_reference: ref_data.second_reference,
				third_reference: ref_data.third_reference
			};

			callback({ success: true, message: 'Reference details fetched', data: ref_details });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	getLegalQuestion: async function (authData, callback) {
		var ques_data = await LegalQuestion.find({}).exec();
		if (ques_data.length > 0) {
			//console.log('ques_data',ques_data);
			var q_data = [];
			for (var i = 0; i < ques_data.length; i++) {
				var ans_exist = await UserLegalQuestionAnswer.findOne({ "user_id": authData.id, "question_id": ques_data[i]._id }).exec();
				if (ans_exist) {
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
					explain: explain,
				});
			}
			callback({ success: true, message: 'Question fetched', data: q_data });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	/*saveLegalQuestionAnswer: async function (ansData, authData, callback) {
		if(ansData.length > 0)
		{
			await UserLegalQuestionAnswer.deleteMany({"user_id":authData.id}).exec();
			var ans_data = [];
			for (var i = 0; i < ansData.length; i++) {
				ans_data.push({
					user_id: authData.id,
					question_id: ansData[i].question_id,
					answer: ansData[i].answer
				});
			}
			UserLegalQuestionAnswer.insertMany(ans_data).then(function(){
				console.log("Data inserted")// Success
			}).catch(function(error){
				console.log(error)// Failure
			});
			callback({ success: true, message: 'Legal answer saved successfully' });
		}
		else
		{
			callback({ success: false, message: 'Answers are mandatory' });
		}
	},*/
	saveLegalQuestionAnswer: async function (ansData, authData, callback) {
		if (ansData.question_id == '') {
			callback({ success: false, type: "Validation error", message: "Question id is required." });
			return false;
		}
		if (ansData.answer == '') {
			callback({ success: false, type: "Validation error", message: "Answer is required." });
			return false;
		}
		await UserLegalQuestionAnswer.deleteOne({ "user_id": authData.id, "question_id": ansData.question_id }).exec();

		const a_data = new UserLegalQuestionAnswer({
			user_id: authData.id,
			question_id: ansData.question_id,
			answer: ansData.answer,
		});
		a_data.save();

		callback({ success: true, message: 'Legal answer saved successfully' });
	},
	updateLegalQuestionAnswer: async function (ansData, authData, callback) {
		if (ansData.question_id == '') {
			callback({ success: false, type: "Validation error", message: "Question id is required." });
			return false;
		}
		if (ansData.answer == '') {
			callback({ success: false, type: "Validation error", message: "Answer is required." });
			return false;
		}
		if (ansData.explain == '') {
			callback({ success: false, type: "Validation error", message: "Explanation is required." });
			return false;
		}

		await UserLegalQuestionAnswer.updateOne({ "user_id": authData.id, "question_id": ansData.question_id }, { "answer": ansData.answer, "explain": ansData.explain, "dom": new Date() }).exec();

		callback({ success: true, message: 'Legal answer saved successfully' });
	},
	getLegalQuestionAnswer: async function (authData, callback) {
		var ans_data = await UserLegalQuestionAnswer.find({ "user_id": authData.id }).exec();
		if (ans_data.length > 0) {
			callback({ success: true, message: 'Answers fetched', data: ans_data });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	getCmsContent: async function (slug, callback) {
		var cms_data = await CMS.findOne({ "slug": slug }).exec();
		if (cms_data) {
			callback({ success: true, message: 'Answers fetched', data: cms_data });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	getAboutUsDetails: async function (cms_id, callback) {
		var about_us_data = await CMS.findOne({ "_id": cms_id }).exec();
		if (about_us_data) {
			var hospital_count = User.countDocuments({ "user_type": 5 }).exec();
			var private_recruiter_count = User.countDocuments({ "user_type": 4 }).exec();
			var physican_count = User.countDocuments({ "user_type": 3 }).exec();
			callback({ success: true, message: 'About us details fetched', data: about_us_data, "hospital_count": hospital_count, "private_recruiter_count": private_recruiter_count, "physican_count": physican_count });
		} else {
			callback({ success: false, message: 'No data found' });
		}
	},
	getRecruiterProfile: async function (authData, callback) {
		User.findOne({ "_id": authData.id }).exec().then((docs) => {
			if (docs) {
				if (docs.profile_picture == null) {
					var profile_img = null;
				} else {
					var profile_img = staging_siteurl + 'public/profile_image/' + docs.profile_picture;
				}

				var user_profile_data = {
					user_id: docs._id,
					name: docs.name,
					email: docs.email,
					mobile_no: docs.mobile_no,
					profile_picture: profile_img,
					user_type: docs.user_type,
				};
				callback({ success: true, message: 'User details', data: user_profile_data });
			}
			else {
				callback({ success: false, type: "Critical error", message: "Valid user not found with supplied token." });
			}
		}).catch((e) => {
			callback({ success: false, type: "Server error", message: "Error in user findings.", Eorror: e });
		});
	},
	updateRecruiterProfile: async function (profileData, docFile, authData, callback) {
		if (profileData.name == '') {
			callback({ success: false, type: "Validation error", message: "Valid email is required" });
			return false;
		}
		if (profileData.country_code == '') {
			callback({ success: false, type: "Validation error", message: "Country code is required." });
			return false;
		}
		if (profileData.only_mobile_no == '') {
			callback({ success: false, type: "Validation error", message: "Only mobile number is required." });
			return false;
		}

		var mobile_no = profileData.country_code + profileData.only_mobile_no;

		var profile_image_name = null;
		if (docFile.profile_image.name.trim() != '') {
			var ext = docFile.profile_image.name.slice(docFile.profile_image.name.lastIndexOf('.'));
			var profile_image_name = "profile" + '1' + Date.now() + ext;
			var folderpath = 'public/profile_image/';

			docFile.profile_image.mv(folderpath + profile_image_name);
		}

		User.updateOne({ "_id": authData.id }, {
			"name": personalData.name,
			"country_code": personalData.country_code,
			"only_mobile_no": personalData.only_mobile_no,
			"mobile_no": mobile_no,
			"profile_picture": profile_image_name,
			"dom": new Date()
		}).exec();

		callback({ success: true, message: 'Profile details updated successfully' });
	},
	socialLogin: async function (loginData, callback) {
		console.log('loginData', loginData);
		if (!loginData.hasOwnProperty('social_id') || loginData.social_id == '') {
			callback({ success: false, type: "Validation error", message: "Social id is required." });
			return false;
		}
		if (!loginData.hasOwnProperty('name') || loginData.name == '') {
			callback({ success: false, type: "Validation error", message: "Name is required." });
			return false;
		}
		if (!loginData.hasOwnProperty('email') || loginData.email == '') {
			callback({ success: false, type: "Validation error", message: "Email is required." });
			return false;
		}
		if (!loginData.hasOwnProperty('registered_from') || loginData.registered_from == '') {
			callback({ success: false, type: "Validation error", message: "Registered from is required." });
			return false;
		}
		if (!loginData.hasOwnProperty('user_type') || loginData.user_type == '') {
			callback({ success: false, type: "Validation error", message: "User type required." });
			return false;
		}

		var user_details = await User.findOne({ "email": loginData.email, "user_type": loginData.user_type }).sort({ "_id": -1 }).exec();
		if (user_details) {
			User.updateOne({ "user_id": user_details._id }, {
				"name": loginData.name,
				"registered_from": loginData.registered_from,
				"social_id": loginData.social_id,
				"profile_image": loginData.profile_image,
				"dom": new Date()
			}).exec();
			let token = createToken(user_details);
			callback({ success: true, message: "User logged in successfully", data: user_details, token: token });
		} else {
			const user_data = new User({
				user_type: loginData.user_type,
				name: loginData.name,
				email: loginData.email,
				registered_from: loginData.registered_from,
				social_id: loginData.social_id,
				profile_image: loginData.profile_image,
				status: 1
			});
			user_data.save().then((udoc) => {
				if (udoc) {
					let token = createToken(udoc);
					callback({ success: true, message: "User logged in successfully", data: udoc, token: token });
				} else {
					callback({ success: false, message: "Error in submitting." });
				}
			}).catch((e) => {
				callback({ success: false, type: "Server error", message: "Error in submitting.", Eorror: e });
			});
		}
	},
	// searchProvider: async function (search_word, user_id, callback) {
	// 	console.log('search_word',search_word);
	//  	console.log('user_id',user_id);
	// 	 var query = {};
	// 	 var s_w = search_word.replace(/%20/g, " ");
	// 	 var search_val = escapeForRegex(s_w).replace(/\s+/g, '|');

	// 	 query['$or'] = [
	// 			{ name: new RegExp(search_val, 'gi') },
	// 			{ email: new RegExp(search_val, 'gi') },
	// 		];

	// 	 var providers = await User.find(query).exec();
	// 	 console.log('providers',providers);

	// },
	searchProvider: async function (search_word, user_id, callback) {
		console.log('search_word', search_word);
		console.log('user_id', user_id);
		var query = {};
		var s_w = search_word.replace(/%20/g, " ");
		var search_val = escapeForRegex(s_w).replace(/\s+/g, '|');
		if (search_val == 'Doctor' || search_val == 'doctor' || search_val == 'Physican' || search_val == 'physican') {
			query.user_type = { "$in": [3] };
		}
		else if (search_val == 'Physican Assistant' || search_val == 'physican assistant' || search_val == 'Physican assistant' || search_val == 'physican Assistant') {
			query.user_type = { "$in": [1] };
		}
		else if (search_val == 'Nurse' || search_val == 'nurse') {
			query.user_type = { "$in": [2] };
		}
		else {
			query.user_type = { "$in": [1, 2, 3] };
			query['$or'] = [
				{ name: new RegExp(search_val, 'gi') },
				{ email: new RegExp(search_val, 'gi') },
			];
		}
		//console.log('query',query);

		var providers = await User.find(query).exec();
		if (providers.length > 0) {
			var p_data = [];
			for (var i = 0; i < providers.length; i++) {
				if (providers[i].user_type == 1) {
					var designation = 'Physican Assistant';
				} else if (providers[i].user_type == 2) {
					var designation = 'Nurse';
				} else if (providers[i].user_type == 3) {
					var designation = 'Physican';
				}

				if (providers[i].profile_picture == null) {
					var profile_img = null;
				} else {
					var profile_img = staging_siteurl + 'public/profile_image/' + providers[i].profile_picture;
				}

				var employment_data = await UserEmployement.findOne({ "user_id": providers[i]._id }).sort({ "_id": -1 }).exec();
				if (employment_data) {
					var company_name = employment_data.job_name;
				} else {
					var company_name = "";
				}
				if (user_id) {
					var connection_details = await ConnectionRequest.findOne({ "provider_id": providers[i]._id, "non_provider_id": user_id }).exec();
					if (connection_details) {
						var connection_status = connection_details.connection_status;
					} else {
						var connection_status = 3;
					}
				} else {
					var connection_status = 3;
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
					connection_status: connection_status,
				});
			}
			callback({ success: true, message: "Provider list fetched", data: p_data });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	searchCandidate: async function (authData, search_word, user_type, callback) {
		var query = {};
		if (user_type) {
			query.user_type = user_type;
		}
		if (search_word) {
			var search_val = escapeForRegex(search_word).replace(/\s+/g, '|');
			query['$or'] = [
				{ name: new RegExp(search_val, 'gi') },
				{ email: new RegExp(search_val, 'gi') },
				{ mobile_no: new RegExp(search_val, 'gi') },
			];
		}

		var candidate_list = await User.find(query).exec();
		if (candidate_list.length > 0) {
			callback({ success: true, message: "Candidate list fetched", data: candidate_list });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	getFAQList: async function (callback) {
		var faq_list = await FAQ.find({}).exec();
		if (faq_list.length > 0) {
			callback({ success: true, message: "faq list fetched", data: faq_list });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	getAboutData: async function (callback) {
		var about_data = await CMS.findOne({}).exec();
		if (about_data) {
			callback({ success: true, message: "about data fetched", data: about_data });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	getPrivacyData: async function (callback) {
		var privacy_data = await PrivacyPolicy.findOne({}).exec();
		if (privacy_data) {
			callback({ success: true, message: "privacy data fetched", data: privacy_data });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	getAllDreamjobList: async function (callback) {
		var dreamjob_list = await Dreamjob.find({}).exec();
		if (dreamjob_list.length > 0) {
			console.log(dreamjob_list, 'dreamjob_list')
			var dreamjob_arr = [];
			for (var i = 0; i < dreamjob_list.length; i++) {
				var p_image = staging_siteurl + 'public/dreamjob/' + dreamjob_list[i].image;

				dreamjob_arr.push({
					dreamjob_id: dreamjob_list[i]._id,
					name: dreamjob_list[i].name,
					designation: dreamjob_list[i].designation,
					image: p_image
				})
			}
			//console.log(testimonial_arr);
			callback({ success: true, message: "Dreamjob list fetched", data: dreamjob_arr });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	saveContactUs: async function (contactData, callback) {
		if (contactData.name == '') {
			callback({ success: false, type: "Validation error", message: "Name is required." });
			return false;
		}
		if (contactData.email == '') {
			callback({ success: false, type: "Validation error", message: "Email is required." });
			return false;
		}
		if (contactData.phone_no == '') {
			callback({ success: false, type: "Validation error", message: "Phone number is required." });
			return false;
		}
		if (contactData.comment == '') {
			callback({ success: false, type: "Validation error", message: "Comment is required." });
			return false;
		}

		const c_data = new ContactUs({
			name: contactData.name,
			email: contactData.email,
			phone_no: contactData.phone_no,
			comment: contactData.comment,
		});
		c_data.save();

		callback({ success: true, message: 'Contact us saved successfully' });
	},
	getContactUs: async function (callback) {
		var ContactUs_list = await ContactUs.find({}).exec();
		if (ContactUs_list.length > 0) {
			var ContactUs_arr = [];
			for (var i = 0; i < ContactUs_list.length; i++) {


				ContactUs_arr.push({
					name: ContactUs_list[i].name,
					email: ContactUs_list[i].email,
					phone_no: ContactUs_list[i].phone_no,
					comment: ContactUs_list[i].comment

				})
			}
			console.log(ContactUs_arr);
			callback({ success: true, message: "Contact us list fetched", data: ContactUs_arr });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	getTestimonialList: async function (callback) {
		var testimonial_list = await Testimonial.find({}).exec();
		if (testimonial_list.length > 0) {
			var testimonial_arr = [];
			for (var i = 0; i < testimonial_list.length; i++) {
				var p_image = staging_siteurl + 'public/testimonial/' + testimonial_list[i].image;

				testimonial_arr.push({
					testimonial_id: testimonial_list[i]._id,
					name: testimonial_list[i].name,
					designation: testimonial_list[i].designation,
					testimonial: testimonial_list[i].testimonial.slice(0, 200) + '...',
					image: p_image
				})
			}
			//console.log(testimonial_arr);
			callback({ success: true, message: "Testimonial list fetched", data: testimonial_arr });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	getTestimonialDetails: async function (testimonial_id, callback) {
		var testimonial_data = await Testimonial.findOne({ "_id": testimonial_id }).exec();
		if (testimonial_data) {
			var p_image = staging_siteurl + 'public/testimonial/' + testimonial_data.image;
			const t_data = {
				testimonial_id: testimonial_data._id,
				name: testimonial_data.name,
				designation: testimonial_data.designation,
				testimonial: testimonial_data.testimonial,
				image: p_image
			}
			callback({ success: true, message: "Testimonial data fetched", data: t_data });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	sentConnectionRequest: async function (conData, authData, callback) {
		console.log('conData', conData);
		if (conData.non_provider_id == "" || conData.non_provider_id == "0" || conData.non_provider_id == 0) {
			callback({ success: false, type: "Validation error", message: "Non provider id is required." });
			return false;
		}
		var user_details = await User.findOne({ "_id": conData.provider_id, "user_type": { "$in": [1, 2, 3] } }).exec();
		if (!user_details) {
			callback({ success: false, type: "Validation error", message: "Providers can not sent connection request." });
			return false;
		}
		if (conData.provider_id == "" || conData.provider_id == "0" || conData.provider_id == 0) {
			callback({ success: false, type: "Validation error", message: "Provider id is required." });
			return false;
		}

		var connection_details = await ConnectionRequest.findOne({ "provider_id": conData.provider_id, "non_provider_id": conData.non_provider_id }).exec();
		if (connection_details) {
			callback({ success: false, message: "You have already sent connection request to this user" });
			return false;
		}

		const connection_data = new ConnectionRequest({
			provider_id: conData.provider_id,
			non_provider_id: conData.non_provider_id,
			connection_status: 0
		});
		connection_data.save();

		callback({ success: true, message: "Connection request sent successfully" });
	},
	acceptConnectionRequest: async function (conData, authData, callback) {
		if (conData.connection_id == "") {
			callback({ success: false, type: "Validation error", message: "Connection id is required." });
			return false;
		}
		if (conData.connection_status == "") {
			callback({ success: false, type: "Validation error", message: "Connection status is required." });
			return false;
		}

		var connection_details = await ConnectionRequest.findOne({ "_id": conData.connection_id }).exec();

		ConnectionRequest.updateOne({ "_id": conData.connection_id }, {
			"connection_status": conData.connection_status
		}).exec();

		const reqs_data = new Connection({
			provider_id: connection_details.provider_id,
			non_provider_id: connection_details.non_provider_id
		});
		reqs_data.save();

		callback({ success: true, message: "Request accepted" });
	},
	rejectConnectionRequest: async function (conData, authData, callback) {
		if (conData.connection_id == "") {
			callback({ success: false, type: "Validation error", message: "Connection id is required." });
			return false;
		}
		if (conData.connection_status == "") {
			callback({ success: false, type: "Validation error", message: "Connection status is required." });
			return false;
		}
		var connection_details = await ConnectionRequest.findOne({ "_id": conData.connection_id }).exec();

		ConnectionRequest.updateOne({ "_id": conData.connection_id }, {
			"connection_status": conData.connection_status
		}).exec();

		const reqs_data = new Connection({
			provider_id: connection_details.provider_id,
			non_provider_id: connection_details.non_provider_id
		});
		reqs_data.save();

		callback({ success: true, message: "Request rejected" });
	},
	providerConnectionRequestList: async function (authData, callback) {
		console.log(authData.id);
		var connection_details = await ConnectionRequest.find({ "provider_id": authData.id, "connection_status": 0 }).exec();
		if (connection_details.length > 0) {
			var connection_arr = [];
			for (var i = 0; i < connection_details.length; i++) {
				var user_details = await User.findOne({ "_id": connection_details[i].non_provider_id }).exec();
				var user_name = user_details.name;
				var email = user_details.email;
				if (user_details.profile_picture == null) {
					var profile_img = null;
				} else {
					var profile_img = staging_siteurl + 'public/profile_image/' + user_details.profile_picture;
				}

				connection_arr.push({
					connection_id: connection_details[i]._id,
					provider_id: connection_details[i].provider_id,
					non_provider_id: connection_details[i].non_provider_id,
					connection_status: connection_details[i].connection_status,
					user_name: user_name,
					email: email,
					profile_img: profile_img,
				});
			}
			callback({ success: true, message: "Connection list", data: connection_arr });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	allConnectionRequestList: async function (authData, callback) {
		console.log(authData.id);
		var connection_details = await ConnectionRequest.find({ "provider_id": authData.id, "connection_status": { $ne: 0 } }).exec();
		if (connection_details.length > 0) {
			var connection_arr = [];
			for (var i = 0; i < connection_details.length; i++) {
				var user_details = await User.findOne({ "_id": connection_details[i].non_provider_id }).exec();
				var user_name = user_details.name;
				var email = user_details.email;
				if (user_details.profile_picture == null) {
					var profile_img = null;
				} else {
					var profile_img = staging_siteurl + 'public/profile_image/' + user_details.profile_picture;
				}

				connection_arr.push({
					connection_id: connection_details[i]._id,
					provider_id: connection_details[i].provider_id,
					non_provider_id: connection_details[i].non_provider_id,
					connection_status: connection_details[i].connection_status,
					user_name: user_name,
					email: email,
					profile_img: profile_img,
				});
			}
			callback({ success: true, message: "Connection list", data: connection_arr });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	acceptConnectionList: async function (authData, callback) {
		console.log(authData.id);
		var connection_details = await ConnectionRequest.find({ "provider_id": authData.id, "connection_status": 1 }).exec();
		if (connection_details.length > 0) {
			var connection_arr = [];
			for (var i = 0; i < connection_details.length; i++) {
				var user_details = await User.findOne({ "_id": connection_details[i].non_provider_id }).exec();
				var user_name = user_details.name;
				var email = user_details.email;
				if (user_details.profile_picture == null) {
					var profile_img = null;
				} else {
					var profile_img = staging_siteurl + 'public/profile_image/' + user_details.profile_picture;
				}

				connection_arr.push({
					connection_id: connection_details[i]._id,
					provider_id: connection_details[i].provider_id,
					non_provider_id: connection_details[i].non_provider_id,
					connection_status: connection_details[i].connection_status,
					user_name: user_name,
					email: email,
					profile_img: profile_img,
				});
			}
			callback({ success: true, message: "Connection list", data: connection_arr });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	nonProviderConnectionList: async function (authData, callback) {
		var connection_details = await ConnectionRequest.find({ "non_provider_id": authData.id, "connection_status": 1 }).exec();
		if (connection_details.length > 0) {
			var connection_arr = [];
			for (var i = 0; i < connection_details.length; i++) {
				var user_details = await User.findOne({ "_id": connection_details[i].provider_id }).exec();
				var user_name = user_details.name;
				var email = user_details.email;
				var mobile_no = user_details.mobile_no;
				if (user_details.profile_picture == null) {
					var profile_img = null;
				} else {
					var profile_img = staging_siteurl + 'public/profile_image/' + user_details.profile_picture;
				}

				if (user_details.user_type == 1) {
					var designation = 'Physican Assistant';
				} else if (user_details.user_type == 2) {
					var designation = 'Nurse';
				} else if (user_details.user_type == 3) {
					var designation = 'Physican';
				}

				connection_arr.push({
					connection_id: connection_details[i]._id,
					provider_id: connection_details[i].provider_id,
					non_provider_id: connection_details[i].non_provider_id,
					user_name: user_name,
					email: email,
					profile_img: profile_img,
					designation: designation,
					mobile_no: mobile_no,
				});
			}
			callback({ success: true, message: "Connection list", data: connection_arr });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	viewProviderPersonalDetails: async function (authData, user_id, callback) {
		User.findOne({ "_id": user_id }).exec().then((docs) => {
			if (docs) {
				if (docs.profile_picture == null) {
					var profile_img = null;
				} else {
					var profile_img = staging_siteurl + 'public/profile_image/' + docs.profile_picture;
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
			else {
				callback({ success: false, type: "Critical error", message: "Valid user not found with supplied token." });
			}
		}).catch((e) => {
			callback({ success: false, type: "Server error", message: "Error in user findings.", Eorror: e });
		});
	},
	viewProviderLicensureDetails: async function (authData, user_id, callback) {
		if (!user_id || user_id == "") {
			callback({ success: false, type: "Critical error", message: "User id required." });
		}
		var user_lisence_data = await UserLicense.findOne({ "user_id": user_id }).exec();
		if (user_lisence_data) {
			if (user_lisence_data.national_license_file == null) {
				var national_license_file = null;
			} else {
				var national_license_file = staging_siteurl + 'public/national_license_file/' + user_lisence_data.national_license_file;
			}
			if (user_lisence_data.state_license_file == null) {
				var state_license_file = null;
			} else {
				var state_license_file = staging_siteurl + 'public/state_license_file/' + user_lisence_data.state_license_file;
			}
			if (user_lisence_data.cds_license_file == null) {
				var cds_license_file = null;
			} else {
				var cds_license_file = staging_siteurl + 'public/cds_license_file/' + user_lisence_data.cds_license_file;
			}
			if (user_lisence_data.dea_license_file == null) {
				var dea_license_file = null;
			} else {
				var dea_license_file = staging_siteurl + 'public/dea_license_file/' + user_lisence_data.dea_license_file;
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

			var user_additional_lisence_data = await UserAdditonalLicense.find({ "user_id": user_id }).exec();

			var additional_license_result = [];
			if (user_additional_lisence_data.length > 0) {
				for (var i = 0; i < (user_additional_lisence_data.length); i++) {
					var license_file = staging_siteurl + 'public/additional_license/' + user_additional_lisence_data[i].license_file;
					additional_license_result.push({
						additiona_license_id: user_additional_lisence_data[i]._id,
						license_file: license_file,
						license_name: user_additional_lisence_data[i].license_name,
						license_issue_date: user_additional_lisence_data[i].license_issue_date,
						license_expiry_date: user_additional_lisence_data[i].license_expiry_date,
					});
				}
			}
			callback({ success: true, message: 'License details', data: license_data, additional_data: additional_license_result });
		} else {
			callback({ success: false, type: "Critical error", message: "Valid user not found with supplied token." });
		}
	},
	viewProviderCertificateDetails: async function (authData, user_id, callback) {
		if (!user_id || user_id == "") {
			callback({ success: false, type: "Critical error", message: "User id required." });
		}
		var user_certificate_data = await UserCertificate.findOne({ "user_id": user_id }).exec();
		if (user_certificate_data) {
			if (user_certificate_data.bls_file == null) {
				var bls_file = null;
			} else {
				var bls_file = staging_siteurl + 'public/certificate/' + user_certificate_data.bls_file;
			}
			if (user_certificate_data.acls_file == null) {
				var acls_file = null;
			} else {
				var acls_file = staging_siteurl + 'public/certificate/' + user_certificate_data.acls_file;
			}
			if (user_certificate_data.pls_file == null) {
				var pls_file = null;
			} else {
				var pls_file = staging_siteurl + 'public/certificate/' + user_certificate_data.pls_file;
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
			var user_additional_certificate_data = await UserAdditonalCertificate.find({ "user_id": user_id }).exec();

			var additional_certifcate_result = [];
			if (user_additional_certificate_data.length > 0) {
				for (var i = 0; i < (user_additional_certificate_data.length); i++) {
					var certificate_file = staging_siteurl + 'public/certificate/' + user_additional_certificate_data[i].certificate_file;
					additional_certifcate_result.push({
						additional_certificate_id: user_additional_certificate_data[i]._id,
						certificate_file: certificate_file,
						certificate_issue_date: user_additional_certificate_data[i].certificate_issue_date,
						certificate_expiry_date: user_additional_certificate_data[i].certificate_expiry_date,
						certificate_name: user_additional_certificate_data[i].certificate_name,
					});
				}
			}
			callback({ success: true, message: 'Certificate details', data: license_data, additional_data: additional_certifcate_result });
		} else {
			callback({ success: false, type: "Critical error", message: "Valid user not found with supplied token." });
		}
	},
	viewProviderEmploymentDetails: async function (authData, user_id, callback) {
		var user_employment_data = await UserEmployement.find({ "user_id": user_id }).exec();
		if (user_employment_data.length > 0) {
			callback({ success: true, message: 'Employment details fetched', data: user_employment_data });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	viewProviderEducationDetails: async function (authData, user_id, callback) {
		var edu_data = await UserEducation.findOne({ "user_id": user_id }).exec();
		if (edu_data) {
			const edu_details = {
				education_id: edu_data._id,
				ug_institute_name: edu_data.ug_institute_name,
				ug_from_year: edu_data.ug_from_year,
				ug_to_year: edu_data.ug_to_year,
				g_institute_name: edu_data.g_institute_name,
				g_from_year: edu_data.g_from_year,
				g_to_year: edu_data.g_to_year,
				g_status: edu_data.g_status,
				med_institue_name: edu_data.med_institue_name,
				med_school_from_year: edu_data.med_school_from_year,
				med_school_to_year: edu_data.med_school_to_year,
				med_status: edu_data.med_status,
			};

			var user_additional_education_data = await UserAdditionalEducation.find({ "user_id": user_id }).exec();

			var additional_education_result = [];
			if (user_additional_education_data.length > 0) {
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
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	viewProviderLegalHistoryDetails: async function (authData, user_id, callback) {
		var ques_data = await LegalQuestion.find({}).exec();
		if (ques_data.length > 0) {
			var q_data = [];
			for (var i = 0; i < ques_data.length; i++) {
				var ans_exist = await UserLegalQuestionAnswer.findOne({ "user_id": user_id, "question_id": ques_data[i]._id }).exec();
				if (ans_exist) {
					var answer = ans_exist.answer;
				} else {
					var answer = "";
				}
				q_data.push({
					_id: ques_data[i]._id,
					question: ques_data[i].question,
					answer: answer,
				});
			}
			callback({ success: true, message: 'Question fetched', data: q_data });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	viewProviderMedicalHistoryDetails: async function (authData, user_id, callback) {
		var user_medical_data = await UserMedicalHistory.findOne({ "user_id": user_id }).exec();
		if (user_medical_data) {
			var covid_certificate = staging_siteurl + 'public/medical/' + user_medical_data.covid_certificate;
			var flu_certificate = staging_siteurl + 'public/medical/' + user_medical_data.flu_certificate;
			var tetanus = staging_siteurl + 'public/medical/' + user_medical_data.tetanus;
			var mmr_vaccine = staging_siteurl + 'public/medical/' + user_medical_data.mmr_vaccine;
			var hepatitis_vaccine = staging_siteurl + 'public/medical/' + user_medical_data.hepatitis_vaccine;

			const medical_history_data = {
				medical_id: user_medical_data._id,
				covid_certificate: covid_certificate,
				flu_certificate: flu_certificate,
				mmr_vaccine: mmr_vaccine,
				hepatitis_vaccine: hepatitis_vaccine,
				covid_date_1: user_medical_data.covid_date_1,
				covid_date_2: user_medical_data.covid_date_2,
				covid_date_3: user_medical_data.covid_date_3,
				covid_date_4: user_medical_data.covid_date_4,
				flu_date: user_medical_data.flu_date,
				tetanus_date: user_medical_data.tetanus_date,
				mmr_immune: user_medical_data.mmr_immune,
				hepatitis_immune: user_medical_data.hepatitis_immune,
			};

			callback({ success: true, message: 'Medical details fetched', data: medical_history_data });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	viewProviderReferences: async function (authData, user_id, callback) {
		var ref_data = await UserReference.findOne({ "user_id": user_id }).exec();
		if (ref_data) {
			const ref_details = {
				reference_id: ref_data._id,
				first_reference: ref_data.first_reference,
				second_reference: ref_data.second_reference,
				third_reference: ref_data.third_reference
			};

			callback({ success: true, message: 'Reference details fetched', data: ref_details });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	createSubUser: async function (userData, authData, callback) {
		var u_doc = await User.findOne({ "email": userData.email, "user_type": userData.user_type }).exec();
		if (u_doc) {
			callback({ success: false, type: "Validation error", message: "Email already registered" });
			return false;
		}
		if (userData.name == '') {
			callback({ success: false, type: "Validation error", message: "Name is required." });
			return false;
		}
		if (userData.email == '') {
			callback({ success: false, type: "Validation error", message: "Email is required." });
			return false;
		}
		if (userData.country_code == '') {
			callback({ success: false, type: "Validation error", message: "Country code is required." });
			return false;
		}
		if (userData.only_mobile_no == '') {
			callback({ success: false, type: "Validation error", message: "Only mobile number is required." });
			return false;
		}
		if (userData.password == '') {
			callback({ success: false, type: "Validation error", message: "Password is required." });
			return false;
		}
		if (userData.user_type == '') {
			callback({ success: false, type: "Validation error", message: "User type is required." });
			return false;
		}

		let password_hash = bcrypt.hashSync(userData.password, 10);
		var mobile_no = userData.country_code + userData.only_mobile_no;

		const user_data = new User({
			user_type: userData.user_type,
			name: userData.name,
			email: userData.email,
			country_code: userData.country_code,
			only_mobile_no: userData.only_mobile_no,
			mobile_no: mobile_no,
			password: password_hash,
			status: 1,
			parent_id: authData.id,
			sub_user_type: userData.sub_user_type,
			registered_from: 1
		});
		user_data.save();

		callback({ success: true, message: 'Sub user created successfully' });
	},

	getSubUserList: async function (user_id, authData, callback) {
		var sub_user_list = await User.find({
			$and: [
				{ user_type: "5" },
				{ parent_id: user_id }
				// ...
			]
		}).exec();

		console.log(sub_user_list, "lsdfahgksjdhfh")
		if (sub_user_list.length > 0) {
			var sub_user_list_arr = [];
			for (var i = 0; i < sub_user_list.length; i++) {

				sub_user_list_arr.push({
					user_id: sub_user_list[i]._id,
					name: sub_user_list[i].name,
					email: sub_user_list[i].email,
					mobile_no: sub_user_list[i].mobile_no,
					sub_user_type: sub_user_list[i].sub_user_type

				})
			}
			var sub_user_count = sub_user_list.length;
			//console.log(testimonial_arr);
			callback({ success: true, message: "sub user list fetched", data: sub_user_list_arr, count: sub_user_count });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	},
	viewTransactionDetails: async function (authData, callback) {
		var transaction_data = await Transaction.find({ "transaction_user_id": authData.id }).exec();
		if (transaction_data.length > 0) {
			callback({ success: true, message: 'Transaction History fetched', data: transaction_data });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	viewSubscriptionDetails: async function (authData, callback) {
		var subscription_data = await Subscription.find({ "subscription_user_id": authData.id,"sub_user_type":"1" }).exec();
		if (subscription_data.length > 0) {
			callback({ success: true, message: 'subscription data fetched', data: subscription_data });
		}
		else {
			callback({ success: false, message: 'No data found' });
		}
	},
	deleteConnection: async function (authData, connection_id, callback) {
		if (!connection_id) {
			callback({ success: false, message: "Connection id required" });
		}
		await ConnectionRequest.deleteOne({ "_id": connection_id, "connection_status": 1 }).exec();

		callback({ success: true, message: "deleted successfully" });
	},
	deleteSubUser: async function (authData, sub_user_id, callback) {
		if (!sub_user_id) {
			callback({ success: false, message: "Sub user id required" });
		}
		await User.deleteOne({ "_id": sub_user_id }).exec();

		callback({ success: true, message: "Sub user deleted successfully" });
	},
	deleteAdditionalLicense: async function (authData, additiona_license_id, callback) {
		if (!additiona_license_id) {
			callback({ success: false, message: "Additional license id required" });
		}
		await UserAdditonalLicense.deleteOne({ "_id": additiona_license_id }).exec();

		callback({ success: false, message: "Additional license deleted successfully" });
	},
	deleteAdditionalCertificate: async function (authData, additiona_certificate_id, callback) {
		if (!additiona_certificate_id) {
			callback({ success: false, message: "Additional certificate id required" });
		}
		await UserAdditonalCertificate.deleteOne({ "_id": additiona_certificate_id }).exec();

		callback({ success: false, message: "Additional certificate deleted successfully" });
	},
	deleteAdditionalEducation: async function (authData, additiona_education_id, callback) {
		console.log('additiona_education_id', additiona_education_id);
		if (!additiona_education_id) {
			callback({ success: false, message: "Additional education id required" });
		}
		await UserAdditionalEducation.deleteOne({ "_id": additiona_education_id }).exec();

		callback({ success: false, message: "Additional education deleted successfully" });
	},
	deleteAdditionalEmployment: async function (authData, additiona_employement_id, callback) {
		if (!additiona_employement_id) {
			callback({ success: false, message: "Employment id required" });
		}
		await UserAdditionalEmployement.deleteOne({ "_id": additiona_employement_id }).exec();

		callback({ success: false, message: "Employment deleted successfully" });
	},
	getAboutusUserCount: async function (callback) {
		var hospital_count = await User.countDocuments({ user_type: '5' }).exec();

		// userModel.count({}, function( err, count){
		// 	console.log( "Number of users:", count );
		// })
		var Private_Recruiters_count = await User.countDocuments({ user_type: '4' }).exec();
		var Physicians_count = await User.countDocuments({ user_type: '3' }).exec();
		console.log(hospital_count);
		if (hospital_count > 0) {
			let res = { "hospital_count": hospital_count, "Private_Recruiters_count": Private_Recruiters_count, "Physicians_count": Physicians_count }
			callback({ success: true, message: "user list fetched", data: res });
		}
		else {
			callback({ success: false, message: "No data found" });
		}
	}
};

module.exports = websiteService;