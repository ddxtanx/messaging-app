var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    SocketServer = require('ws').Server,
    http = require('http');
var server = http.createServer(app);
var wss = new SocketServer({server});
app.set('views', './public');
app.use(express.static('./public'), bodyParser());

app.get("/", function(req, res){
    res.render("twig/index.twig");
});
var connections = 0;
wss.on('connection', function(ws){
    connections++;
    console.log("connecton");
    wss.clients.forEach(function(client){
        var data = {
            type: 'conn',
            usersConnected: connections
        };
        client.send(JSON.stringify(data));
    });
    ws.on('message', function(data){
        console.log("data "+data);
        wss.clients.forEach(function(client){
            console.log("sent to client");
            if(!data.includes("\"type\": ")){
                data = [data.slice(0, data.length-1), ", \"type\": \"message\"", data.slice(data.length-1)].join('')
            }
            console.log(data);
            client.send(data);
        });
    });
    ws.on('close',function(ws){
        console.log('disconnect '+ws);
        connections--;
        wss.clients.forEach(function(client){
        var data = {
            type: 'conn',
            usersConnected: connections
        };
        client.send(JSON.stringify(data));
    });
    });
});
server.listen(process.env.PORT || 8080);