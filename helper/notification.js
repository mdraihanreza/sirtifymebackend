var FCM = require('fcm-push');
let nodemailer = require('nodemailer');
let moment = require('moment');
module.exports = {
	
	sendNoti: async function (token_array) {
		console.log('eseche');
		
		return new Promise((resolve,reject) => {
			var serverKey = 'AAAAGjhRTls:APA91bFx2RPW5IeEyASICLsxYrtHzdGZ2YWKsjw8pvJh9UUl-oRhD5Ehetu8IXIgCuW_mvncIvsa8g48JGrqgEkxXylmvCbL6pkyx-OXVeYTnH9VloCvZBvOe4HsVD3IsJUdaiFum86n';
			var fcm = new FCM(serverKey);
	
			var tokens = token_array;
	
			var message = {
				/*to: tokens,*/ // for single token
				  registration_ids: tokens,	// for multiple token
				data: {
					title: 'YADY Notification',
					body: 'This is a test notification'
				},
				notification: {
					title: 'YADY Notification',
					body: 'This is a test notification',
					sound: 'default',
					click_action: 'FCM_PLUGIN_ACTIVITY',
					icon: 'fcm_push_icon'
				}
			};
	
			fcm.send(message, function(err, response){
				if (err) {
					console.log("Something has gone wrong!",err);
					reject(err);
				} else {
					console.log("Successfully sent with response: ", response);
					resolve(response);
				}
			});
		})
	},
	sendSpConfirmationNotification: async function (token_array,msg) {
		//console.log('eseche');
		
		return new Promise((resolve,reject) => {
			var serverKey = 'AAAAGjhRTls:APA91bFx2RPW5IeEyASICLsxYrtHzdGZ2YWKsjw8pvJh9UUl-oRhD5Ehetu8IXIgCuW_mvncIvsa8g48JGrqgEkxXylmvCbL6pkyx-OXVeYTnH9VloCvZBvOe4HsVD3IsJUdaiFum86n';
			var fcm = new FCM(serverKey);
	
			var tokens = token_array;
	
			var message = {
				/*to: tokens,*/ // for single token
				  registration_ids: tokens,	// for multiple token
				data: {
					title: 'YADY Booking Confirmation Notification',
					body: msg
				},
				notification: {
					title: 'YADY Booking Confirmation Notification',
					body: msg,
					sound: 'default',
					click_action: 'FCM_PLUGIN_ACTIVITY',
					icon: 'fcm_push_icon'
				}
			};
	
			fcm.send(message, function(err, response){
				if (err) {
					console.log("Something has gone wrong!",err);
					reject(err);
				} else {
					console.log("Successfully sent with response: ", response);
					resolve(response);
				}
			});
		})
	},
	sendSrConfirmationNotification: async function (token_array,msg,title) {
		//console.log('eseche');
		
		return new Promise((resolve,reject) => {
			var serverKey = 'AAAAGjhRTls:APA91bFx2RPW5IeEyASICLsxYrtHzdGZ2YWKsjw8pvJh9UUl-oRhD5Ehetu8IXIgCuW_mvncIvsa8g48JGrqgEkxXylmvCbL6pkyx-OXVeYTnH9VloCvZBvOe4HsVD3IsJUdaiFum86n';
			var fcm = new FCM(serverKey);
	
			var tokens = token_array;
	
			var message = {
				/*to: tokens,*/ // for single token
				  registration_ids: tokens,	// for multiple token
				data: {
					title: title,
					body: msg
				},
				notification: {
					title: title,
					body: msg,
					sound: 'default',
					click_action: 'FCM_PLUGIN_ACTIVITY',
					icon: 'fcm_push_icon'
				}
			};
	
			fcm.send(message, function(err, response){
				if (err) {
					console.log("Something has gone wrong!",err);
					reject(err);
				} else {
					console.log("Successfully sent with response: ", response);
					resolve(response);
				}
			});
		})
	},
	sendSRAcceptNotification: async function (token_array,msg,title) {
		//console.log('eseche');
		
		return new Promise((resolve,reject) => {
			var serverKey = 'AAAAGjhRTls:APA91bFx2RPW5IeEyASICLsxYrtHzdGZ2YWKsjw8pvJh9UUl-oRhD5Ehetu8IXIgCuW_mvncIvsa8g48JGrqgEkxXylmvCbL6pkyx-OXVeYTnH9VloCvZBvOe4HsVD3IsJUdaiFum86n';
			var fcm = new FCM(serverKey);
	
			var tokens = token_array;
	
			var message = {
				/*to: tokens,*/ // for single token
				  registration_ids: tokens,	// for multiple token
				data: {
					title: title,
					body: msg
				},
				notification: {
					title: title,
					body: msg,
					sound: 'default',
					click_action: 'FCM_PLUGIN_ACTIVITY',
					icon: 'fcm_push_icon'
				}
			};
	
			fcm.send(message, function(err, response){
				if (err) {
					console.log("Something has gone wrong!",err);
					reject(err);
				} else {
					console.log("Successfully sent with response: ", response);
					resolve(response);
				}
			});
		})
	},
	sendMailNotification: async function (to_email, email_subject, template_des) {
		let currYear = moment().format('YYYY');
		let transporter = nodemailer.createTransport({
			host: 'smtp.zoho.com',
			secure: true,
			port: 465,
			auth: {
				user: 'notifications@yadyapp.com',
				pass: 'c2lEkig#'
			}
		});
		let mailOptions = {
			from: 'Yady <notifications@yadyapp.com>',
			to: to_email,
			subject: email_subject,
			html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><style></style></head><body><table style="background-color: #fff; padding: 0px; margin: 50px auto 50px auto; max-width: 600px; width: 100%; box-shadow: 0 0 10px #85749e;"><thead><tr><th colspan="2" style=" background: #015050; padding: 15px 10px 10px 10px;"><img src="https://nodeserver.mydevfactory.com/projects/pranay/rahul/yady/yady_website/assets/images/logo.png" style="width: 100px;" /></th></tr></thead><tbody>${template_des}</tbody><tfoot style="background-color: #015050;"><tr><td colspan="2"><p style="color: #fff; text-align: center;margin-bottom: 20px;margin-top: 20px;">Copyright @'+currYear+' <a href="#" style="color: #00ebeb">Yady</a> All rights reserved.</p></td></tr></tfoot></table></body></html>`
		};
		transporter.sendMail(mailOptions, function (err, info) {
			if (err) {
				console.log('err',err);
			} else {
				console.log('Mail resent: ' + info.response);
			}
		});
	},
	sendPushNotification: async function (token_array,msg,title) {
		return new Promise((resolve,reject) => {
			var serverKey = 'AAAAGjhRTls:APA91bFx2RPW5IeEyASICLsxYrtHzdGZ2YWKsjw8pvJh9UUl-oRhD5Ehetu8IXIgCuW_mvncIvsa8g48JGrqgEkxXylmvCbL6pkyx-OXVeYTnH9VloCvZBvOe4HsVD3IsJUdaiFum86n';
			var fcm = new FCM(serverKey);
	
			var tokens = token_array;
	
			var message = {
				/*to: tokens,*/ // for single token
				  registration_ids: tokens,	// for multiple token
				data: {
					title: title,
					body: msg
				},
				notification: {
					title: title,
					body: msg,
					sound: 'default',
					click_action: 'FCM_PLUGIN_ACTIVITY',
					icon: 'fcm_push_icon'
				}
			};
	
			fcm.send(message, function(err, response){
				if (err) {
					console.log("Something has gone wrong!",err);
					reject(err);
				} else {
					console.log("Successfully sent with response: ", response);
					resolve(response);
				}
			});
		})
	},
	sendMailNotificationWithAttachment: async function (to_email, email_subject, template_des, mail_attachment) {
		let currYear = moment().format('YYYY');
		let transporter = nodemailer.createTransport({
			host: 'smtp.zoho.com',
			secure: true,
			port: 465,
			auth: {
				user: 'invoice@yadyapp.com',
				pass: 'Bs6rntc&'
			}
		});
		let mailOptions = {
			from: 'Yady <invoice@yadyapp.com>',
			to: to_email,
			subject: email_subject,
			html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><style></style></head><body><table style="background-color: #fff; padding: 0px; margin: 50px auto 50px auto; max-width: 600px; width: 100%; box-shadow: 0 0 10px #85749e;"><thead><tr><th colspan="2" style=" background: #015050; padding: 15px 10px 10px 10px;"><img src="https://nodeserver.mydevfactory.com/projects/pranay/rahul/yady/yady_website/assets/images/logo.png" style="width: 100px;" /></th></tr></thead><tbody>${template_des}</tbody><tfoot style="background-color: #015050;"><tr><td colspan="2"><p style="color: #fff; text-align: center;margin-bottom: 20px;margin-top: 20px;">Copyright @${currYear} <a href="#" style="color: #00ebeb">Yady</a> All rights reserved.</p></td></tr></tfoot></table></body></html>`,
			attachments: [{
				filename: 'Invoice.pdf',
				path: mail_attachment,
				contentType: 'application/pdf'
			}],
		};
		transporter.sendMail(mailOptions, function (err, info) {
			if (err) {
				console.log('err',err);
			} else {
				console.log('Mail resent: ' + info.response);
			}
		});
	},
};