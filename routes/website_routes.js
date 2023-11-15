let express = require("express");
let jwt = require('jsonwebtoken');
const config = require('../config');
let websiteService = require('../services/websiteService');

let secretKey = config.secretKey;

module.exports = function (app, express) {

	let router = express.Router();
	
	
	router.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	router.get('/', function (req, res) {
		res.send("Website router OK from IP: "+req.connection.remoteAddress);
	});
	
	router.post('/signUp', function (req, res) {
		let registerData = req.body;
		websiteService.signUp(registerData, function (response) {
			res.send(response);
		});
	});
	
	router.post('/login', function (req, res) {
		//console.log('2123123132');
		let loginData = req.body;
		websiteService.login(loginData, function (response) {
			res.send(response);
		});
	});
	router.post('/emailconfirm', function (req, res) {
		//console.log('2123123132');
		let userData = req.body;
		websiteService.emailconfirm(userData, function (response) {
			res.send(response);
		});
	});
    router.post('/changePassword', function(req, res) {
		let passwordData = req.body;
		websiteService.changePassword(passwordData,  function (response) {
			res.send(response);
		});
	});
	router.post('/postotpmatch', function (req, res) {
		let userData = req.body.otp;
		websiteService.userOtpMatch(userData, function (response) {
			res.send(response);
		});
	});
	router.get('/getAboutUsDetails', function (req, res) {
		let cms_id = req.query.cms_id;
		websiteService.getAboutUsDetails(cms_id, function (response) {
			res.send(response);
		});
	});
	
	router.post('/socialLogin', function (req, res) {
		let loginData = req.body;
		websiteService.socialLogin(loginData, function (response) {
			res.send(response);
		});
	});
	router.get('/searchProvider', function (req, res) {
		let search_word = req.query.search_word;
		let user_id = req.query.user_id;
		websiteService.searchProvider(search_word, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/getFAQList', function (req, res) {
		websiteService.getFAQList(function (response) {
			res.send(response);
		});
	});
	router.get('/getAboutData', function (req, res) {
		websiteService.getAboutData(function (response) {
			res.send(response);
		});
	});
	router.get('/getPrivacyData', function (req, res) {
		websiteService.getPrivacyData(function (response) {
			res.send(response);
		});
	});
	router.get('/getAllDreamjobList', function (req, res) {
		websiteService.getAllDreamjobList(function (response) {
			res.send(response);
		});
	});
	router.post('/saveContactUs', function (req, res) {
		let contactData = req.body;
		websiteService.saveContactUs(contactData, function (response) {
			res.send(response);
		});
	});
	router.get('/getContactUsList', function (req, res) {
		
		websiteService.getContactUs( function (response) {
			res.send(response);
		});
	});
	
	router.get('/getTestimonialList', function (req, res) {
		websiteService.getTestimonialList(function (response) {
			res.send(response);
		});
	});
	router.get('/getTestimonialDetails', function (req, res) {
		let testimonial_id = req.query.testimonial_id;
		websiteService.getTestimonialDetails(testimonial_id, function (response) {
			res.send(response);
		});
	});
	router.get('/getAboutusUserCount', function (req, res) {
		websiteService.getAboutusUserCount( function (response) {
			res.send(response);
		});
	});
	
	/* Authentication middleware start */
	router.use(function (req, res, next) {
		// let token = req.body.token || req.param('token') || req.headers['token']||'';
		let token = req.body.token || req.param('token') || req.headers['token']||'';
		//console.log('token',req.param('token'));
		console.log(token,'token')
		if (token) {
			jwt.verify(token, secretKey, function (err, authDet) {
				if (err) {
					console.log('errr>>',err);
					//res.status(403).send({success: false,type:'Authentication error',message: "Authentication failed"});
					res.send({success: false,type:'tokenexpire',message: "Authentication failed"});
				} else {
					req.authDet = authDet;
					next();
				}
			});
		} else {
			//res.status(403).send({success: false,type:'Authentication error',message: "Authentication token required"});
			res.send({success: false,type:'Authentication error',message: "Authentication token required"});
		}
	});
	/* Authentication middleware end */
     
	router.post('/updatePersonalDetails', function (req, res) {
		console.log('1213213213131');
		//console.log('req.files',req.files);
		//console.log('req.file',req.file);
		let authData = req.authDet;
		let personalData = req.body;
		var docFile = req.files;
		websiteService.updatePersonalDetails(personalData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/getPersonalDetails', function (req, res) {
		let authData = req.authDet;
		websiteService.getPersonalDetails(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/updateLicenseDetails', function (req, res) {
		let authData = req.authDet;
		let LicenseData = req.body;
		var docFile = req.files;
		websiteService.updateLicenseDetails(LicenseData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	 router.post('/payment', function (req, res) {
		let authData = req.authDet;
		let userData = req.body;
		  console.log(authData,'authData')
		websiteService.createPayment(userData, authData,  function (response) {
			res.send(response);
		});
	  });
	router.get('/getPaymentDetails', function (req, res) {
		let authData = req.authDet;
		websiteService.getPaymentDetails(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/updateAdditionalLicenseDetails', function (req, res) {
		let authData = req.authDet;
		let LicenseData = req.body;
		var docFile = req.files;
		websiteService.updateAdditionalLicenseDetails(LicenseData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/getLicenseDetails', function (req, res) {
		let authData = req.authDet;
		websiteService.getLicenseDetails(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/updateCertificateDetails', function (req, res) {
		let authData = req.authDet;
		let certificateData = req.body;
		var docFile = req.files;
		websiteService.updateCertificateDetails(certificateData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateAdditionalCertificateDetails', function (req, res) {
		let authData = req.authDet;
		let certificateData = req.body;
		var docFile = req.files;
		websiteService.updateAdditionalCertificateDetails(certificateData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/getCertificateDetails', function (req, res) {
		let authData = req.authDet;
		websiteService.getCertificateDetails(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/updateEmployementDetails', function (req, res) {
    let authData = req.authDet;
    let empData = req.body;
    websiteService.updateEmployementDetails(empData, authData,  function (response) {
        res.send(response);
       });
    });
    router.post('/updateAdditionalEmployementDetails', function (req, res) {
    let authData = req.authDet;
    let empData = req.body;
    websiteService.updateAdditionalEmployementDetails(empData, authData,  function (response) {
        res.send(response);
        });
    });
    router.get('/getEmployementDetails', function (req, res) {
    let authData = req.authDet;
    websiteService.getEmployementDetails(authData, function (response) {
        res.send(response);
       });
    });
	router.post('/updateMedicalHistory', function (req, res) {
		let authData = req.authDet;
		let medicalData = req.body;
		var docFile = req.files;
		websiteService.updateMedicalHistory(medicalData, docFile, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/getMedicalHistoty', function (req, res) {
		let authData = req.authDet;
		websiteService.getMedicalHistoty(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/updateEducationDetails', function (req, res) {
		let authData = req.authDet;
		let eduData = req.body;
		websiteService.updateEducationDetails(eduData, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateAdditionalEducationDetails', function (req, res) {
		let authData = req.authDet;
		let eduData = req.body;
		websiteService.updateAdditionalEducationDetails(eduData, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/getEducationDetails', function (req, res) {
		let authData = req.authDet;
		websiteService.getEducationDetails(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/saveUserReferences', function (req, res) {
		let authData = req.authDet;
		let refData = req.body;
		websiteService.saveUserReferences(refData, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/getReferenceDetails', function (req, res) {
		let authData = req.authDet;
		websiteService.getReferenceDetails(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/getLegalQuestion', function (req, res) {
		let authData = req.authDet;
		websiteService.getLegalQuestion(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/saveLegalQuestionAnswer', function (req, res) {
		let authData = req.authDet;
		let ansData = req.body;
		websiteService.saveLegalQuestionAnswer(ansData, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/updateLegalQuestionAnswer', function (req, res) {
         let authData = req.authDet;
         let ansData = req.body;
		console.log(ansData,'ansData')
          websiteService.updateLegalQuestionAnswer(ansData, authData,  function (response) {
              res.send(response);
          });
       });
	router.get('/getLegalQuestionAnswer', function (req, res) {
		let authData = req.authDet;
		websiteService.getLegalQuestionAnswer(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/getRecruiterProfile', function (req, res) {
		let authData = req.authDet;
		websiteService.getRecruiterProfile(authData, function (response) {
			res.send(response);
		});
	});
	router.post('/updateRecruiterProfile', function (req, res) {
		let authData = req.authDet;
		let profileData = req.body;
		websiteService.updateRecruiterProfile(profileData, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/searchCandidate', function (req, res) {
		let authData = req.authDet;
		let search_word = req.query.search_word;
		let user_type = req.query.user_type;
		websiteService.searchCandidate(authData, search_word, user_type, function (response) {
			res.send(response);
		});
	});
	router.post('/sentConnectionRequest', function (req, res) {
		let authData = req.authDet;
		let conData = req.body;
		websiteService.sentConnectionRequest(conData, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/acceptConnectionRequest', function (req, res) {
		let authData = req.authDet;
		let conData = req.body;
		websiteService.acceptConnectionRequest(conData, authData,  function (response) {
			res.send(response);
		});
	});
	router.post('/rejectConnectionRequest', function (req, res) {
		let authData = req.authDet;
		let conData = req.body;
		websiteService.rejectConnectionRequest(conData, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/providerConnectionRequestList', function (req, res) {
		let authData = req.authDet;
		websiteService.providerConnectionRequestList(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/allConnectionRequestList', function (req, res) {
		let authData = req.authDet;
		websiteService.allConnectionRequestList(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/acceptConnectionList', function (req, res) {
		let authData = req.authDet;
		websiteService.acceptConnectionList(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteconnection', function (req, res) {
    let authData = req.authData;
    let connection_id = req.query.connection_id;
    websiteService.deleteConnection(authData, connection_id, function (response) {
        res.send(response);
       });
    });
	router.get('/nonProviderConnectionList', function (req, res) {
		let authData = req.authDet;
		websiteService.nonProviderConnectionList(authData, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderPersonalDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		websiteService.viewProviderPersonalDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderLicensureDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		websiteService.viewProviderLicensureDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderCertificateDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		websiteService.viewProviderCertificateDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderEmploymentDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		websiteService.viewProviderEmploymentDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderEducationDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		websiteService.viewProviderEducationDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderLegalHistoryDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		websiteService.viewProviderLegalHistoryDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderMedicalHistoryDetails', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		websiteService.viewProviderMedicalHistoryDetails(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/viewProviderReferences', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		websiteService.viewProviderReferences(authData, user_id, function (response) {
			res.send(response);
		});
	});
	router.post('/createSubUser', function (req, res) {
		let authData = req.authDet;
		let userData = req.body;
		websiteService.createSubUser(userData, authData,  function (response) {
			res.send(response);
		});
	});
	router.get('/getSubUserList', function (req, res) {
		let authData = req.authDet;
		let user_id = req.query.user_id;
		websiteService.getSubUserList(user_id, authData,  function (response) {
			res.send(response);
		});
	});
	
	router.get('/deleteSubUser', function (req, res) {
		let authData = req.authData;
		let sub_user_id = req.query.sub_user_id;
		websiteService.deleteSubUser(authData, sub_user_id, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteAdditionalLicense', function (req, res) {
		let authData = req.authData;
		let additiona_license_id = req.query.additiona_license_id;
		websiteService.deleteAdditionalLicense(authData, additiona_license_id, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteAdditionalCertificate', function (req, res) {
		let authData = req.authData;
		let additiona_certificate_id = req.query.additiona_certificate_id;
		websiteService.deleteAdditionalCertificate(authData, additiona_certificate_id, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteAdditionalEducation', function (req, res) {
		let authData = req.authData;
		let additiona_education_id = req.query.additiona_education_id;
		websiteService.deleteAdditionalEducation(authData, additiona_education_id, function (response) {
			res.send(response);
		});
	});
	router.get('/deleteAdditionalEmployment', function (req, res) {
		let authData = req.authData;
		let additiona_employement_id = req.query.additiona_employment_id;
		websiteService.deleteAdditionalEmployment(authData, additiona_employement_id, function (response) {
			res.send(response);
		});
	});
	
	return router;
}