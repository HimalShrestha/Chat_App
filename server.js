var express = require('express');
var mysql = require('mysql');
var path = require('path');
var fs = require('fs');
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
// app.get('/:user',function(req,res){
//
// });

var online_all=[];
// connection.end();
io.on('connection', function (socket) {
  const sockId=socket.id;
  socket.on('init',function(msg){
    socket.username=msg;
    online_all.push({id:sockId,name:msg});
    connection.query('SELECT * FROM single_convo WHERE user="'+msg+'" ORDER BY id DESC LIMIT 5 ;', function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      socket.broadcast.emit('new user',{id:sockId,name:msg,convo:results});
    });

  });
  socket.on('disconnect',function(){
    console.log('disonnected: '+sockId);
    socket.broadcast.emit('user disconnected',socket.username);
  })
  socket.on('emit other user',function(data){
    console.log('on other user ', data);
    socket.broadcast.emit('emit other user',data);
  });
  // socket.on('user', function(id,data){
  //   console.log('envoked');
  //   if(data==='HIMAL' || data==='OTHER'){
  //     socket.username=data;
  //     socket.broadcast.to(id).emit('message',data);
  //     console.log(data);
  //   }
  //   else{
  //     socket.broadcast.to(id).emit('message','denied');
  //   }
  // });
  socket.on('chat with friend',function(id, msg){
    console.log(id, msg);
    socket.broadcast.to(id).emit('emit other user',msg);
  });
  socket.on('on message', function (data) {
    console.log(data);
    // fs.appendFile('chat.txt',data.message,function(err){
    //   if(!err) console.log('file writte');
    // })
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
