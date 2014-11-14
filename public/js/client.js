var socket = io.connect();

// helper funcs
function displayMsg(msg, pseudo){
    // pattern for image path. string must have no spaces and end in a valid image extension
    var imagePattern = new RegExp(/^([\S]+)\.(gif|jpg|jpeg|tiff|png)$/i);
    var linkPattern = new RegExp("^(http|https)://", "i");
    var message;
    if(imagePattern.test(msg)){
        message = '<img src="' + msg + '"/>';        
    } else if (linkPattern.test(msg)) {
        message = '<a href="' + msg + '" target="_blank">' + msg + '</a>';        
    } else {        
        message = sanitizeHtml(msg)
    }
    $('#chatEntries').find('.last').removeClass('last');
    $('#chatEntries').append(
        '<div class="message last"><span class="pseudo">'
        + pseudo
        + '</span>: <span class="msg">' + message + '</span></div>'
    );
    $("#chatEntries").scrollTop($("#chatEntries")[0].scrollHeight);
}
function sendMsg() {
    if( $('#messageInput').val() !== ''){
        socket.emit('message', $('#messageInput').val());
        displayMsg($('#messageInput').val(), 'Me');
        $('#messageInput').val('');
    }
}

function playSound(){
    var sound = new Audio('/sounds/beep.mp3'); // buffers automatically when created
    sound.play();
}

function translateToLinks(msg){
    // return msg with link
}

// TODO: load this via browserify
function sanitizeHtml (string) {
  return string.replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#39;')
}

// set up events
socket.on('connect', function() {
    console.log("Welcome to Vince's chat server!");
});
socket.on('welcome', function(data){
    console.log('welcome')
    $('#chatEntries').append('<div class="welcome message"><em>' + data['pseudo'] + ' has entered the room.</em></div>');
    $('#userlist').append('<p class="' + data['pseudo'] + '"">' + data['pseudo'] + '</p>');
});
socket.on('disconnect', function(data){
    console.log('disconnect')
    $('#chatEntries').append('<div class="welcome message"><em>' + data['pseudo'] + ' has left the room.</em></div>');
    $('.' + data['pseudo']).remove();
});

socket.on('message', function(data){
    displayMsg(data['message'], data['pseudo']);
    playSound();

    $(window).focus(function(){
        window.clearInterval(intervalID);
        document.title = "Team Central Chat";
    });

    var $pseudo = $('#chatEntries').find('.last').find('.pseudo').text(),
        $msg = $('#chatEntries').find('.last').find('.msg').text(),
        docTitle = false,
        intervalID = setInterval(function(){
        if(!docTitle){
            docTitle = true;
            document.title = $pseudo + " - " + $msg;
        }
        else {
            docTitle = false;
            document.title = "Team Central Chat";
        }
    }, 1000);
});

// attach events
$(function(){
    $('#submit').click(function(){
        sendMsg();
    });
    $('input').bind('keyup',function(e){
        if(e.which === 13){
            $('button').click();
        }
    });
    $('#beep').click(function(e){
        e.preventDefault();

    })
});
