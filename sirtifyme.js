let express = require('express');
const mysql = require('mysql');
const config = require('./config');
let bodyparser = require('body-parser');
let jwt = require('jsonwebtoken');
let path = require('path');
const cors = require('cors');
var fs = require('fs');
var http = require('http');
var https = require('https');
let fileUpload = require('express-fileupload');
var logger = require('morgan');
const db = config.db;



/*db.connect((err) => {
	if(err){
		throw err;
	}
	console.log('MySql Connected........');
});*/

let app = express();
app.use(fileUpload());
app.use(cors());
app.use(logger('dev'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));

//app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json({limit: '50mb'}));
app.use(bodyparser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use(bodyparser.json());

/*var credentials = {
	key: fs.readFileSync('/etc/letsencrypt/live/nodeserver.mydevfactory.com/privkey.pem', 'utf8'),
	cert: fs.readFileSync('/etc/letsencrypt/live/nodeserver.mydevfactory.com/fullchain.pem', 'utf8')
};*/

//var server = https.createServer(credentials, app);
var server = http.createServer(app);


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

//let userRoutes = require('./routes/user_routes.js')(app, express);
//app.use('/user', userRoutes);

//let webRoutes = require('./routes/web_routes.js')(app, express);
//app.use('/web', webRoutes);

//let serviceProviderRoutes = require('./routes/service_provider_routes.js')(app, express);
//app.use('/serviceProvider', serviceProviderRoutes);

let websiteRoutes = require('./routes/website_routes.js')(app, express);
app.use('/website', websiteRoutes);

//let serviceDispatcherRoutes = require('./routes/service_dispatcher_routes.js')(app, express);
//app.use('/serviceDispatcher', serviceDispatcherRoutes);

//let cronRoutes = require('./routes/cron_routes.js')(app, express);
//app.use('/cron', cronRoutes);

//let userRoutes2 = require('./routes/user_routes_2.js')(app, express);
//app.use('/user2', userRoutes2);

var notificationPage = require('./helper/notification');
var generalHelper = require('./helper/general_helper');
const { subscriptionEmailSendTask } = require('./cronTasks.js');


/*----------------------Socket----------------------*/
var io = require('socket.io')(server);
var users={};
io.use(function(socket, next){
    if (socket.handshake.query && socket.handshake.query.token){
		
        jwt.verify(socket.handshake.query.token, 'secretkey', function(err, decoded) {
            if(err){
                console.log('token mismatch');
				console.log(err);
                return next(new Error('Access Denied'));
            }
			console.log('token found');
            console.log(decoded);
            socket.decoded = decoded;
            next();
        });
    } else {
        console.log('no token found.');
        next(new Error('Access Denied'));
    }
});
/*io.use(function(socket, next){
	if (socket.handshake.query && socket.handshake.query.token){
		console.log('token',socket.handshake.query.token);
		socket.decoded = socket.handshake.query.token
        next();
	} else {
		next(new Error('Access Denied'));
	}
});*/

io.on('connection',(socket)=>{
	console.log('connected');
	let user_id=socket.decoded.id;
	users[user_id]=socket.id;
	socket.emit('connected','Welcome');
	
	socket.on('disconnect', ()=>{
		console.log('disconnected');
		socket.emit('bye','good bye bye');
        delete users[user_id];
	});
});
console.log('socket is listening..');
global.sendToClient=(client_id, send_type, data)=>{
    if(!users[client_id]) return false;
	//console.log(client_id);
	//console.log(data);
	console.log('socket hit');
    return io.to(users[client_id]).emit(send_type,data);
}
/*------------------------------------------------*/


// ======== cron task run =========== //
subscriptionEmailSendTask.start();



server.listen(config.port, function (err) {
    if (err) {
        throw err;
    } else {
        //console.log(` server is running and listening to ${config.serverhost}:${app.get('port')} `);
		console.log(config.port);
    }
});

/*app.listen(config.port, () => {
	console.log('Server started on port ' + config.port);
	console.log('Server started on port ' + config.__baseUrl);
});*/