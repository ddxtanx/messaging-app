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
var userNames = [];
var HOST = window.location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(HOST);
var messageId = 0;
ws.onopen = function(){
    var openData = {
        request: 'names'
    };
    ws.send(JSON.stringify(openData));
};
ws.onmessage = function(e){
    console.log(e);
    var data = e.data;
    data = JSON.parse(data);
    if(data.type=="message"){
        console.log("RECEIVED MESSAGE");
        if(data.id!=messageId){
            addMessage(data.message, 0, data.from);
        }
    }else if(data.type=="conn"){
        console.log("connection added");
        var connected = data.usersConnected;
        if(data.name!==userName){
            userNames.push(data.name);
        }
        var noun = (connected!=1)?"Users":"User";
        $("#usersH2").text(connected+" "+noun+" Connected");
        addMessage(data.name+" Has Connected", false, "SERVER");
    } else if(data.type=="close"){
        console.log("RECEIVED CLOSE");
        var connected = data.usersConnected;
        var noun = (connected!=1)?"Users":"User";
        $("#usersH2").text(connected+" "+noun+" Connected");
        addMessage(data.name+" Has Disconnected", false, "SERVER");
    } else if(data.type=="closeRequest"){
        var closeResData = {
            name: userName,
            type: 'closeRes'
        };
        console.log("RECEIVED CLOSE REQUEST "+JSON.stringify(closeResData));
        ws.send(JSON.stringify(closeResData));
    } else if(data.type=="names"){
        userNames = data.names;
        while ((userName=="" || !(userNames.indexOf(userName)==-1)) || userName==""){
            userName=prompt("What do you want your name to be?");
            console.log("USERNAME: "+userName+"\n INDEX: "+userNames.indexOf(userName));
        }
        console.log(userNames.indexOf(userName));
        var connData = {
            type: "conn",
            name: userName
        };
        ws.send(JSON.stringify(connData));
    }
};
$(document).ready(function(){
    $("#submit").click(function(){
        var message = $("#writeMessage").val();
        if(message!==""){
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
    $("#writeMessage").keypress(function(key){
        if($(this).val()!==""){
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
        }
    });
});