let express = require('express');
const mysql = require('mysql');
const config = require('./config');
let bodyparser = require('body-parser');
let path = require('path');
const cors = require('cors');
let fileUpload = require('express-fileupload');
const db = config.db;

db.connect((err) => {
	if(err){
		throw err;
	}
	console.log('MySql Connected........');
});

let app = express();
app.use(fileUpload());
app.use(cors());

app.use('/public', express.static(path.join(__dirname, 'public')));

//app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json({limit: '50mb'}));
app.use(bodyparser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use(bodyparser.json());

/*app.use(function (req, res, next) {
    req.setEncoding('utf8');
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader("Access-Control-Allow-Credentials", true);
		//res.setHeader('Access-Control-Allow-Origin', '*');
		//res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
		//res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		//res.setHeader('Access-Control-Allow-Credentials', true);


    
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});*/

app.get('/', function (req, res) {
    res.send("Connection OK from IP: "+req.connection.remoteAddress);
});

let adminRoutes = require('./routes/admin_routes.js')(app, express);
app.use('/admin', adminRoutes);

let userRoutes = require('./routes/user_routes.js')(app, express);
app.use('/user', userRoutes);

app.listen(config.port, () => {
	console.log('Server started on port ' + config.port);
	console.log('Server started on port ' + config.__baseUrl);
});