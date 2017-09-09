$(document).ready(function(){

  var socket={};
  let username;
  $('#btn').on('click',function(event){
    socket = io.connect('http://192.168.1.180:3001');
    event.preventDefault();
    username = $('#username').val();
    $('#verify').html('Hi '+username+' now you can chat with your friends');
    init();
    socket.emit('init',username);
  });
  function init(){
    var messageBox=$('#message');
    $('#btn1').click(function(){
      socket.emit('chat with friend',$(this).html());
    });
    // socket.on('message', function (data) {
    //   console.log(data);
    //
    //   if(data!=='denied'){
    //     $('#verify').html('');
    //     messageBox.html('<h3>'+data+' is Online!</h3>');
    //     socket.emit('emit other user', data);
    //   }
    //   else{
    //     messageBox.html('');
    //     messageBox.html('<h3>Get lost!</h3>');
    //   }
    //
    // });
    socket.on('all users',function(data){
      console.log(data);
      for(let item of data){
        $('#active-users').append('<button data-id="'+item.id+'">'+item.name+'</button>');
      }
      // messageBox.append('<h3>'+data+' is Online!</h3>');
    });
    socket.on('new user',function(data){
      console.log(data);
      $('#notification').append('<h3>'+data.name+' is Online!</h3>')
      $('#active-users').append('<button data-id="'+data.id+'">'+data.name+'</button>');
      // messageBox.append('<h3>'+data+' is Online!</h3>');
    });
    socket.on('user disconnected',function(data){
      $('#active-users [data-id="'+data+'"]').remove();
    });


    //==============Send Message event==================
    $('#submit-btn').on('click',function(event){
      event.preventDefault();

      var message = $('#msg-body').val();
      if(message===''){
        return false;
      }
      else{
        var sender = username;
        $('#msg-body').val('').focus();
        $('html, body').animate({
            scrollTop: $(document).height()
        }, 1000);
        socket.emit('on message',{message,sender});
        messageBox.append('<div class="me-container"><p class="me"><strong>'+sender+': </strong>'+message+'</p></div>');
      }

    });
    //============or on enter===========
    $('#msg-body').keyup(function(event) {
      if(event.keyCode!= 8 || event.keyCode!= 46){
        socket.emit('is typing',username+ ' is typing....');
      }
      if (event.keyCode == 13||event.keyCode == 8 || event.keyCode == 46) {
          socket.emit('not typing');
          if (event.keyCode == 13) {
              $('#submit-btn').trigger('click');
              return false;
           }
          return false;
       }


    });

    //chat with a single user
    $('#active-users').on('click','button',function(){
      console.log($(this).attr('data-id'));
      socket.emit('connect single',$(this).attr('data-id'));
    });

    socket.on('single chat',function(data){
      alert(data.id,data.user,'wants to chat');
    });



    socket.on('is typing',function(data){
      $('#is-typing').html(data);
      $('#is-typing').show();
      // var st=setTimeout(function(){
      //   console.log('helloooooo');
      //   $('#is-typing').hide();
      // },3000);
      // clearTimeout(st);
    });

    socket.on('finish typing',function(){
      $('#is-typing').hide();
    });

    socket.on('client',function(data){
      console.log(data);
      $('html, body').animate({
          scrollTop: $(document).height()
      }, 1000);
      if(data.sender===username){
        messageBox.append('<div class="me-container"><p class="me"><strong>'+data.sender+': </strong>'+data.message+'</p></div>');
      }
      else{
        messageBox.append('<div class="other-container"><p class="other"><strong>'+data.sender+': </strong>'+data.message+'</p></div>');
      }
    });


  }
});
