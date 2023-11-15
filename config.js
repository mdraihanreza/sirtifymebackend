const express = require('express');
const mysql = require('mysql');
const mongoose = require('mongoose');
//const tunnel = require('tunnel-ssh');

mongoose.connect('mongodb://0.0.0.0:27017/sirtifyme_db', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', function() {
    console.log('Connected');
}).on('error', function(error) {
    console.log('Errorssssss:', error);
});

// mongoose.connect('mongodb://eiplorg:cXfUy&W^%3FVKs@localhost:27017/sirtifyme_db', { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connection.once('open', function() {
//     console.log('Connected');
// }).on('error', function(error) {
//     console.log('Error:', error);
// });








// const ssh_config = {
// 	username: 'root',
// 	password: 'Ei{#rhr20lS2Aar@',
// 	host: 'elvirainfotech.org',
// 	port: "22",
// 	dstHost: "localhost",
// 	dstPort: "27017",
// 	localHost: "127.0.0.1",
// 	localPort: "27000"
//   }

//   tunnel(ssh_config, (err, server) => {
// 	const db = mongoose.createConnection('mongodb://localhost:27017/sirtifyme_db', {
// 	  useNewUrlParser: true,
// 	  useUnifiedTopology: true
// 	})
// 	db.once('open', () => {
  
// 	  console.log('DB Connected');
// 	  db.db.stats((err, stats) => {
// 		console.log('db.stats():', stats)
// 	  })
  
// 	})
//   })







/*var config = {
	host : 'localhost',
	user : 'brainiumNode',
	password : '20206hAqk86',
	database : 'db_yadi'
	
};*/

//const db = mysql.createConnection(config);

module.exports = {
	//db: db,
	port : process.env.PORT || 3377,
	secretKey : "secretkey",
	dev_mode : true,
    __rootDir: __dirname,
    __siteUrl: 'https://nodeserver.mydevfactory.com:3009/#/',
    __baseUrl: 'https://nodeserver.mydevfactory.com/projects/pranay/rahul/yadi'
    /*__siteUrl: 'http://localhot:4204/#/',
    __baseUrl: 'http://localhost:4204'*/
	
}