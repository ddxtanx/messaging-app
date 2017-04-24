function addMessage(message, mine, author){
    var className = (mine)?"myMessage":"theirMessage";
    var byLine = (author=="")?message:"<span class='name'>"+author+"</span><span class='said'> Said:</span> "+message;
    var element = "<div class='"+className+" message'>\
                        <div class='messageContainer'>\
                            "+byLine+"\
                        </div>\
                    </div>";
    $("#messages").append(element);
    $("#writeMessage").val("");
}
function randInt(max){
    return Math.floor(Math.random()*max);
}
var userName = "";
while (userName==""){
    userName=prompt("What do you want your name to be?");
}
var HOST = window.location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(HOST);
var messageId = 0;
ws.onmessage = function(e){
    var data = e.data;
    data = JSON.parse(data);
    if(data.type=="message"){
        if(data.id!=messageId){
            addMessage(data.message, 0, data.from);
        }
    }else if(data.type=="conn"){
        console.log("connection added")
        var connected = data.usersConnected;
        var noun = (connected!=1)?"Users":"User";
        $("#usersH2").text(connected+" "+noun+" Connected");
    }
};
$(document).ready(function(){
    $("#submit").click(function(){
        var message = $("#writeMessage").val();
        messageId = randInt(9999999);
        var messageData = {
            message: message,
            id: messageId,
            from: userName
        };
        ws.send(JSON.stringify(messageData));
        addMessage(message, 1, "");
    });
    $("#writeMessage").keypress(function(key){
        if(key.which==13){
            var message = $("#writeMessage").val();
            messageId = randInt(9999999);
            var messageData = {
                message: message,
                id: messageId,
                from: userName
            };
            ws.send(JSON.stringify(messageData));
            addMessage(message, 1, "");
        }
    });
})