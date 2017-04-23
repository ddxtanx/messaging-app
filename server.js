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
wss.on('connection', function(ws){
    console.log("connecton");
    ws.on('message', function(data){
        console.log("data "+data);
        wss.clients.forEach(function(client){
            console.log("sent to client");
            client.send(data);
        });
    });
    ws.on('close',function(ws){
        console.log('disconnect '+ws);
    });
});
server.listen(process.env.PORT || 8080);