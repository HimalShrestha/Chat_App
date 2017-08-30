var express = require('express');
var mysql = require('mysql');
var path = require('path');
var port = 3000;
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');

app.use(express.static(path.join(__dirname,'public')));


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'chatapp'
});

connection.connect(function(err){
  if(!err) console.log('database connection established!!');
  else console.log(err);
});

app.get('/',function(req,res){
  res.sendFile('index.html');
});





connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

// connection.end();
io.on('connection', function (socket) {
  socket.on('user', function(data){
    if(data.username==='HIMAL'){
      socket.username=data.username;
      socket.emit('message',data.username + ' added');
      console.log(data);
    }
    else{
      socket.emit('message','user not accepted!!');
    }

  });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

server.listen(port,function(){
    console.log('Server listening on port ' + port);
});
