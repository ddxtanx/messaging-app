var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    SocketServer = require('ws').Server,
    http = require('http');
var server = http.createServer(app);
var wss = new SocketServer({server});
var connections = 0;
var userNames = [];
var userNamesCopy = [];
var requestsIndex = 0;
var webSockets = {};
function randInt(min, max){
    return Math.floor(Math.random()*(max-min))+min
}
app.set('views', './public');
app.use(express.static('./public'), bodyParser());

app.get("/", function(req, res){
    console.log(userNames);
    res.render("twig/index.twig");
});
wss.on('connection', function(ws){
    connections++;
    console.log("connecton");
    webSockets[randInt(50,500)] = ws;
    ws.on('message', function(data){
        console.log("data "+data);
        if(JSON.parse(data).type=="closeRes"){
            console.log("RECEIVED CLOSE RES");
            userNamesCopy = userNamesCopy.filter(function(item){
                return item!==JSON.parse(data).name;
            });
            requestsIndex++;
        } else if (JSON.parse(data).request=="names"){
            ws.send(JSON.stringify({
                type: "names",
                names: userNames
            }));
            console.log("Sending names");
        }else {
            wss.clients.forEach(function(client){
                console.log("sent to client");
                if(!data.includes("\"type\":")){
                    data = [data.slice(0, data.length-1), ", \"type\": \"message\"", data.slice(data.length-1)].join('');
                }
                data = JSON.parse(data);
                if(data.type=="conn"){
                    if(userNames.indexOf(data.name)==-1){
                        userNames.push(data.name);
                        userNamesCopy = userNames;
                        console.log(userNames+"???"+userNamesCopy);
                    }
                }
                data.usersConnected = connections;
                client.send(JSON.stringify(data));
                data = JSON.stringify(data);
            });
        }
        if(requestsIndex!=0&&requestsIndex==connections){
            console.log("AT NUMBER");
            var disconnectedUser = userNamesCopy[0];
            console.log(userNamesCopy);
            userNames = userNames.filter(function(name){
                return name!==disconnectedUser;
            });
            console.log(userNamesCopy);
            requestsIndex=0;
            userNamesCopy = userNames;
            wss.clients.forEach(function(client){
                var closeResData = {
                   type: 'close',
                   usersConnected: connections,
                   name: disconnectedUser
               };
               console.log(closeResData);
               client.send(JSON.stringify(closeResData));
            });
        }
    });
    ws.on('close', function(closeData){
        console.log("closed "+closeData);
        connections--;
        wss.clients.forEach(function(client){
            var closeData = {
                usersConnected: connections,
                type: 'closeRequest'
            };
            client.send(JSON.stringify(closeData));
        });
    });
});
server.listen(process.env.PORT || 8080);