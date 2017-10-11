var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var mongoose = require('mongoose');
var axios = require('axios');
var querystring = require('querystring');
const https = require('https');
const { URL } = require('url');

var db = mongoose.createConnection("mongodb://localhost:27017/mydb")

var objectSchema = new mongoose.Schema({  
  _id: String,
  hd: Number,
  Name: String,
  Object: String,
  Info: String,
  Price: Number,
  img: String,
  Skymap: String,
  availableQty: Number
});


require('dotenv').config();

var bodyParser = require('body-parser');
app.use( bodyParser.json() );



app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/search', function(req, res) {
  var Object = db.model('things', objectSchema);  
  var name = req.body.search.charAt(0).toUpperCase() + req.body.search.slice(1);
  var HD = Number(req.body.search);
  var query;

  isNaN(HD) ? query = {Name: name} : query = {hd: HD}
  
  Object.findOne(query, function (err, data) {
    
    if (data === null){
      res.send("No Result")
    }else{
      var object = {};
      object[data.hd] = data;
      object[data.hd].availableQty = 1;
      res.send(object);
    }

  });
  
});

app.post('/random', function(req, res){

  var Object = db.model('things', objectSchema);
  var search = req.body.search

  Object.aggregate({ $match: {Object: search} }, {$sample: {size: 1} }, function(err, data){
    var object = {};
    console.log(data)
    object[data[0].hd] = data[0];
    object[data[0].hd].availableQty = 1;
    res.send(object)
  });

});

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/public', express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV !== 'production') {
  require('reload')(server, app);
}

server.listen(process.env.PORT, function () {
  console.log('Listening on port '.concat(process.env.PORT))
});
