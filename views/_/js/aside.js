var socket = io();
logTracker = [];
//console.log(Cookies.get());
//console.log(typeof #{config.comp_id});

//THIS LINE IS VERY IMPORTANT
//console.log(!{JSON.stringify(config.user.fname)});
// please remember this line
//console.log(document.config.user.fname);



$(function () {
  var dropZoneId = "panel-body";
  var buttonId = "clickHere";
  var mouseOverClass = "mouse-over";

  var dropZone = $("#" + dropZoneId);
  var ooleft = dropZone.offset().left;
  var ooright = dropZone.outerWidth() + ooleft;
  var ootop = dropZone.offset().top;
  var oobottom = dropZone.outerHeight() + ootop;
  var inputFile = dropZone.find("input");
  document.getElementById(dropZoneId).addEventListener("dragover", function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.addClass(mouseOverClass);
      var x = e.pageX;
      var y = e.pageY;

      if (!(x < ooleft || x > ooright || y < ootop || y > oobottom)) {
          inputFile.offset({ top: y - 15, left: x - 100 });
      } else {
          inputFile.offset({ top: -400, left: -400 });
      }

  }, true);

  if (buttonId != "") {
      var clickZone = $("#" + buttonId);

      var oleft = clickZone.offset().left;
      var oright = clickZone.outerWidth() + oleft;
      var otop = clickZone.offset().top;
      var obottom = clickZone.outerHeight() + otop;

      $("#" + buttonId).mousemove(function (e) {
          var x = e.pageX;
          var y = e.pageY;
          if (!(x < oleft || x > oright || y < otop || y > obottom)) {
              inputFile.offset({ top: y - 15, left: x - 160 });
          } else {
              inputFile.offset({ top: -400, left: -400 });
          }
      });
  }

  document.getElementById(dropZoneId).addEventListener("drop", function (e) {
      $("#" + dropZoneId).removeClass(mouseOverClass);
  }, true);

});



function parseLog(log){
  if(log.charAt(log.length-1) === "!"){
    console.log("ahhhhhhhaaaga");
    //$('#messages').append($('<li>').html('<a href="/upteams/' + #{config.user.team} + '/' + log.slice(0,log.indexOf(':'))
    //+ '">' + log.slice(log.indexOf(':') + 1, log.lastIndexOf(':')) + '</a>'));

    return log.slice(log.lastIndexOf(':') + 1, log.length-1);
  }
  else{$('#messages').append($('<li>').text(log.slice(0,log.indexOf(':'))));
    return log.slice(log.lastIndexOf(':') + 1, log.length);
  }
};

function logCheck(log){
  return log.slice(log.indexOf(':') + 1, log.lastIndexOf(':'));
};


$(document).ready(function() {
  console.log('woah');
  //$('#panel_chat-title').val(#{config.user.team} + " Chat");

  $('#uploadForm').submit(function() {
    console.log(this);
    if($('#m').val() && $('#m').val() != '' && $('#m').val().length != 0){ 
      socket.emit('send_message', $('#m').val());
      $('#messages').append($('<li>').text($('#m').val()));
      $('#m').val('');
    }
    $(this).ajaxSubmit({
      error: function(xhr) {
        console.log(xhr);
        status('Error: ' + xhr.status);
      },
      success: function(response) {
          console.log(response)
          parseLog(response);

          $("#status").empty().text(response);
          $('#uploadForm').empty();
      }
    });
    return false;
  });    
});

socket.on('log_pic' + #{config.user.id}, function(usr, pic){

});

socket.on('file_message:' + #{config.user.team}, function(usr, file_name, fpath){
 $('#messages').append($('<li>').html('<a href="/upteams/' + #{config.user.team} + '/' + fpath
   + '">' + file_name + '</a>'));
});

socket.on('chat_log:'+ #{config.user.id}, function(chat){
  $('#messages').removeAttr();
  //var pic_requested = [#{config.user.id}];
  for (var i = 0; i < chat.length; i++) {
    var log = parseInt(parseLog(chat[i]));
    if(!pic_requested.includes(log)){
      pic_requested.push(log);
      //request the pic here
    }
   }
  console.log(pic_requested);
 });

 socket.on('new_message:' + #{config.user.team}, function(usr, msg){
   if(usr != #{config.user.id}){notify(msg, usr, 'success');$('#messages').append($('<li>').text(msg));}
});