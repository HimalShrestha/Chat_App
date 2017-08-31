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


// connection.end();
io.on('connection', function (socket) {
  socket.on('emit other user',function(data){
    console.log('on other user ', data);
    socket.broadcast.emit('emit other user',data);
  })
  socket.on('user', function(data){
    if(data==='HIMAL' || data==='OTHER'){
      socket.username=data;
      socket.emit('message',data);
      console.log(data);
    }
    else{
      socket.emit('message','denied');
    }
  });
  socket.on('on message', function (data) {
    console.log(data);
    connection.query('INSERT INTO single_convo (convo,user) VALUES ("'+data.message+'","'+data.sender+'")', function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      socket.broadcast.emit('client', {message:data.message,sender:data.sender});
    });
  });
  socket.on('is typing',function(data){
    socket.broadcast.emit('is typing', data);
  })
});

server.listen(port,function(){
    console.log('Server listening on port ' + port);
});
