let express = require("express");
let jwt = require('jsonwebtoken');
const config = require('../config');
let adminService = require('../services/adminService');

let secretKey = config.secretKey;

module.exports = function (app, express) {

	let router = express.Router();


	router.use(function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	router.get('/', function (req, res) {
		res.send("Admin router OK from IP: " + req.connection.remoteAddress);
	});

	/*router.post('/generatePassword', function (req, res) {
		let loginData = req.body;
		adminService.generatePassword(loginData, function (response) {
			res.send(response);
		});
	});*/

	router.post('/login', function (req, res) {
		let loginData = req.body;
		console.log('loginData',loginData);
		adminService.adminLogin(loginData, function (response) {
			res.send(response);
		});
	});

	//=================================
	//Middleware to check token
	//=================================

	router.use(function (req, res, next) {
		//let token = req.body.token || req.param('token') || req.headers['token']||'';
		let token = req.body.token || req.query["token"] || req.headers['token'] || '';
		//let bearToken = bearerHeader.split(' ');
		//token=bearToken[1];
		if (token) {
			jwt.verify(token, secretKey, function (err, authData) {
				if (err) {
					console.log('+++++9+++++');
					res.status(403).send({ success: false, type: 'Authentication error', message: "Authentication failed" });
				} else {
					console.log('+++++000+++++');
					console.log('+++++000+++++' + authData.id);
					console.log('+++++000+++++' + authData.email);
					req.authData = authData;
					next();
				}
			});
		} else {
			res.status(403).send({ success: false, type: 'Authentication error', message: "Authentication token required" });
		}
	});

	//=======================
	//  Middleware end
	//=======================


	router.get('/getprofile', function (req, res) {
		let authData = req.authData;
		adminService.adminProfile(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/saveFAQ', function (req, res) {
		let faqData = req.body;
		let authData = req.authData;
		adminService.saveFAQ(authData, faqData, function (response) {
			res.send(response);
		});
	});
	router.post('/saveQuestion', function (req, res) {
		let faqData = req.body;
		let authData = req.authData;
		adminService.saveQuestion(authData, faqData, function (response) {
			res.send(response);
		});
	});
	router.post('/savePrivacy', function (req, res) {
	
		let privacyData = req.body;
		let authData = req.authData;
		adminService.saveprivacy(authData, privacyData, function (response) {
			res.send(response);
		});
	});
	router.post('/saveDreamjob', function (req, res) {
		let dreamjobData = req.body;
		let authData = req.authData;
		var docFile = req.files;
		adminService.saveDreamjob(authData, dreamjobData, docFile, function (response) {
			res.send(response);
		});
	});
	router.get('/getQuestionList', function (req, res) {
		let authData = req.authData;
		adminService.getQuestionList(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteQuestion', function (req, res) {
		let authData = req.authData;
		let question_id = req.query.question_id;
		adminService.deleteQuestion(authData, question_id, function (response) {
			res.send(response);
		});
	});
	router.get('/getFaqList', function (req, res) {
		let authData = req.authData;
		adminService.getFaqList(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/geFAQById', function (req, res) {
		let authData = req.authData;
		let faq_id = req.query.faq_id;
		adminService.geFAQById(authData, faq_id, function (response) {
			res.send(response);
		});
	});
	router.post('/updateFAQ', function (req, res) {
		let faqData = req.body;
		let authData = req.authData;
		adminService.updateFAQ(authData, faqData, function (response) {
			res.send(response);
		});
	});
	router.post('/saveTestimoial', function (req, res) {
		let testimonialData = req.body;
		let authData = req.authData;
		var docFile = req.files;
		adminService.saveTestimoial(authData, testimonialData, docFile, function (response) {
			res.send(response);
		});
	});
	router.get('/getContactUsList', function (req, res) {
		let authData = req.authData;
		adminService.getContactUs(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/getTestimonialList', function (req, res) {
		let authData = req.authData;
		adminService.getTestimonialList(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/getTestimonialDetailsById', function (req, res) {
		let authData = req.authData;
		let testimonial_id = req.query.testimonial_id;
		adminService.getTestimonialDetailsById(authData, testimonial_id, function (response) {
			res.send(response);
		});
	});
	router.post('/updateTestimoial', function (req, res) {
		let testimonialData = req.body;
		let authData = req.authData;
		var docFile = req.files;
		adminService.updateTestimoial(authData, testimonialData, docFile, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteTestimonial', function (req, res) {
		let authData = req.authData;
		let testimonial_id = req.query.testimonial_id;
		adminService.deleteTestimonial(authData, testimonial_id, function (response) {
			res.send(response);
		});
	});
	router.get('/getDreamjobList', function (req, res) {
		let authData = req.authData;
		adminService.getDreamjobList(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/getDreamjobDetailsById', function (req, res) {
		let authData = req.authData;
		let dreamjob_id = req.query.dreamjob_id;
		adminService.getDreamjobDetailsById(authData, dreamjob_id, function (response) {
			res.send(response);
		});
	});
	router.post('/updateDreamjob', function (req, res) {
		let dreamjobData = req.body;
		let authData = req.authData;
		var docFile = req.files;
		adminService.updateDreamjob(authData, dreamjobData, docFile, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteDreamjob', function (req, res) {
		let authData = req.authData;
		let dreamjob_id = req.query.dreamjob_id;
		adminService.deleteDreamjob(authData, dreamjob_id, function (response) {
			res.send(response);
		});
	});
	// router.post('/providerList', function(req, res) {
	// 	let authData = req.authData;
	// 	let search_word = req.body.search_word;
	// 	let user_type = req.body.user_type;
	// 	let page = req.body.page;
	// 	let limit = req.body.limit;
	// 	adminService.providerList(authData, search_word, user_type, page, limit,  function(response) {
	// 		res.send(response);
	// 	});
	// });
	router.post('/providerList', function(req, res) {
		let authData = req.authData;
		let search_word = req.body.search_word;
		let user_type = req.body.user_type;
		adminService.providerList(authData, search_word, user_type, function(response) {
			res.send(response);
		});
	});
	router.get('/ProviderConnectionData', function (req, res) {
    let authData = req.authDet;
    var non_provider_id=req.query.non_provider_id
	console.log(non_provider_id,'non_provider_id')
    adminService.ProviderConnectionData(authData,non_provider_id, function (response) {
        res.send(response);
    });
});
	router.get('/viewProviderPersonalDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		adminService.viewProviderPersonalDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderLicensureDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		adminService.viewProviderLicensureDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderCertificateDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		adminService.viewProviderCertificateDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderEmploymentDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		adminService.viewProviderEmploymentDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderEducationDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		adminService.viewProviderEducationDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderLegalHistoryDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		adminService.viewProviderLegalHistoryDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderMedicalHistoryDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		adminService.viewProviderMedicalHistoryDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderReferences', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		adminService.viewProviderReferences(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/getUserCount', function (req, res) {
		let authData = req.authDet;
		adminService.getUserCount(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/updateProviderPersonalDetails', function (req, res) {
		let authData = req.authDet;
		let personalData = req.body;
		var docFile = req.files;
		adminService.updateProviderPersonalDetails(personalData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateProviderLicenseDetails', function (req, res) {
		let authData = req.authDet;
		let LicenseData = req.body;
		var docFile = req.files;
		adminService.updateProviderLicenseDetails(LicenseData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateProviderAdditionalLicenseDetails', function (req, res) {
		let authData = req.authDet;
		let LicenseData = req.body;
		var docFile = req.files;
		adminService.updateProviderAdditionalLicenseDetails(LicenseData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateProviderCertificateDetails', function (req, res) {
		let authData = req.authDet;
		let certificateData = req.body;
		var docFile = req.files;
		adminService.updateProviderCertificateDetails(certificateData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateProviderAdditionalCertificateDetails', function (req, res) {
		let authData = req.authDet;
		let certificateData = req.body;
		var docFile = req.files;
		adminService.updateProviderAdditionalCertificateDetails(certificateData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateProviderEmploymentDetails', function (req, res) {
	let authData = req.authDet;
	let employmentData = req.body;
	adminService.updateProviderEmploymentDetails(employmentData, authData,  function (response) {
		res.send(response);
	});
   });
   router.post('/updateProviderAdditionalEmploymentDetails', function (req, res) {
	let authData = req.authDet;
	let employmentData = req.body;
	adminService.updateProviderAdditionalEmploymentDetails(employmentData, authData,  function (response) {
		res.send(response);
	});
   });
	router.post('/updateProviderMedicalHistory', function (req, res) {
		let authData = req.authDet;
		let medicalData = req.body;
		var docFile = req.files;
		adminService.updateProviderMedicalHistory(medicalData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateProviderEducationDetails', function (req, res) {
		let authData = req.authDet;
		let eduData = req.body;
		adminService.updateProviderEducationDetails(eduData, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateProviderAdditionalEducationDetails', function (req, res) {
		let authData = req.authDet;
		let eduData = req.body;
		adminService.updateProviderAdditionalEducationDetails(eduData, authData,  function (response) {
			res.send(response);
		});
	});
	
	router.post('/updateProviderReferences', function (req, res) {
		let authData = req.authDet;
		let refData = req.body;
		adminService.updateProviderReferences(refData, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/saveProviderLegalQuestionAnswer', function (req, res) {
		let authData = req.authDet;
		let ansData = req.body;
		adminService.saveProviderLegalQuestionAnswer(ansData, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateLegalQuestionAnswer', function (req, res) {
    let authData = req.authDet;
    let ansData = req.body;
   console.log(ansData,'ansData')
     adminService.updateLegalQuestionAnswer(ansData, authData,  function (response) {
         res.send(response);
     });
  });
	router.get('/getAboutus', function (req, res) {
		let authData = req.authData;
		adminService.getAboutus(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/updateAboutUs', function (req, res) {
		let authData = req.authDet;
		let aboutusData = req.body;
		adminService.updateAboutUs(aboutusData, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/getPrivacy', function (req, res) {
		let authData = req.authData;
		adminService.getPrivacy(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/updatePrivacy', function (req, res) {
		let authData = req.authDet;
		let privacyData = req.body;
		adminService.updatePrivacy(privacyData, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/deleteAdminAdditionalLicense', function (req, res) {
		let authData = req.authData;
		let additiona_license_id = req.query.additiona_license_id;
		adminService.deleteAdditionalLicense(authData, additiona_license_id, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteAdminAdditionalCertificate', function (req, res) {
		let authData = req.authData;
		let additiona_certificate_id = req.query.additiona_certificate_id;
		adminService.deleteAdditionalCertificate(authData, additiona_certificate_id, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteAdminAdditionalEmployment', function (req, res) {
		let authData = req.authData;
		let additional_employement_id = req.query.additional_employement_id;
		adminService.deleteAdditionalEmployement(authData, additional_employement_id, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteAdminAdditionalEducation', function (req, res) {
		let authData = req.authData;
		let additional_education_id = req.query.additional_education_id;
		adminService.deleteAdditionalEducation(authData, additional_education_id, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteAdminAdditionalEmployment', function (req, res) {
		let authData = req.authData;
		let additional_employment_id = req.query.additional_employment_id;
		adminService.deleteEmployment(authData, additional_employment_id, function (response) {
			res.send(response);
		});
	});
	
	// router.post('/nonProviderList', function(req, res) {
	// 	let authData = req.authData;
	// 	let search_word = req.body.search_word;
	// 	let user_type = req.body.user_type;
	// 	let page = req.body.page;
	// 	let limit = req.body.limit;
	// 	adminService.nonProviderList(authData, search_word, user_type, page, limit,  function(response) {
	// 		res.send(response);
	// 	});
	// });
	router.post('/nonProviderList', function(req, res) {
		let authData = req.authData;
		let search_word = req.body.search_word;
		let user_type = req.body.user_type;
		//let page = req.body.page;
		//let limit = req.body.limit;
		adminService.nonProviderList(authData, search_word, user_type, function(response) {
			res.send(response);
		});
	});
	router.post('/changePassword', function(req, res) {
		let authData = req.authData;
		let passwordData = req.body;
		adminService.changePassword(passwordData, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/getContactUsList', function (req, res) {
		let authData = req.authData;
		adminService.getContactUsList(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/deletecontactus', function (req, res) {
		let authData = req.authData;
		let contact_id = req.query.contact_id;
		adminService.deleteContactus(authData,contact_id, function (response) {
			res.send(response);
		});
		
		
	});
	router.get('/deletefaq', function (req, res) {
		let authData = req.authData;
		let faq_id = req.query.faq_id;
		adminService.deleteFaq(authData,faq_id, function (response) {
			res.send(response);
		});
		
		
	});
	router.get('/getContactUsDetails', function (req, res) {
		let authData = req.authData;
		let contact_us_id = req.query.contact_us_id;
		adminService.getContactUsDetails(authData, contact_us_id, function (response) {
			res.send(response);
		});
	});
	/*--------------------------*/
	return router;
}