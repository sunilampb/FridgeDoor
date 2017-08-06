var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var fs = require('fs');
app.use(express.static('public')); 

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var commonmark = require('commonmark');
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();



//--------------------Data base connection-------
    const DataStore = require('nedb');
db = new DataStore({filename: __dirname + '/FridgeDB', autoload: true});
//-------------------------------------------------

    
//--------------------Showing pages--------------
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
 
app.get('/noteForm', function (req, res) {
    "use strict";
        
    res.render('noteForm');
});

app.get('/', function (req, res) {
    "use strict";    

    
         db.find({}, function(err, docs) {
    if (err) {
        console.log("something is wrong");
    } else {
        console.log("We found " + docs.length + " documents");
        
        
        var byDate = docs.slice(0);
        byDate.sort(function(a,b) {
    return b.intDate- a.intDate;
});
        console.log(byDate);
        
        res.render('allNotes',{note:byDate});
        
        
         
    }
});
    
});

app.get('/deleteForm', function (req, res) {
    "use strict";
      db.find({}, function(err, docs) {
    if (err) {
        console.log("something is wrong");
    } else {
        console.log("We found " + docs.length + " documents");
        
          
        var byDate = docs.slice(0);
        byDate.sort(function(a,b) {
    return b.intDate- a.intDate;
});
        console.log(byDate);
        
        
        res.render('deleteForm',{note:byDate});
         
    }
});
});

app.get('/note/:id',function (req, res) {
    "use strict";
     var p;
    let id = req.params.id;
    
//    var value = req.query;
//    var id = value.id;
    console.log(id);
    
    db.find({"_id": id}, function(err, doc){
    if (err) {
        console.log("something is wrong");
    } else {
        console.log(`found`);
        console.log(doc);
         p = doc[0];
        
         let parsed = reader.parse(p.body);
        
        let niceMessage = " "+writer.render(parsed);
        p.body1 = niceMessage;
        
        
        
        console.log(p.body);
        
     res.render('note',p);
    }
       
});

});
//-----------------------------------------------


//------------------Operations-------------------

app.post('/Delete', urlencodedParser, function(req,res){
    "use strict";
    
  let del = req.body;
    console.log(del.del);
     
       console.log(del.del.length);
    console.log(del.del instanceof Array);
    
    if(del.del instanceof Array){
       
        
        
        for(var k=0;k<del.del.length;k++){
             console.log(del.del[0]);
        db.remove({"_id": del.del[k]}, { multi: true }, 
    function (err, numRemoved) {
        console.log("removed " + numRemoved);
}); }
}else{
       console.log(del.del);
          db.remove({"_id": del.del}, { multi: true }, 
    function (err, numRemoved) {
        console.log("removed " + numRemoved);
});
        
        
    }
        
    
         db.find({}, function(err, docs) {
    if (err) {
        console.log("something is wrong");
    } else {
        console.log("We found " + docs.length + " documents");
        res.render('allNotes',{note:docs});
         
    }
});
});



app.post('/Add', urlencodedParser, function (req, res) {
    "use strict";
    
    let t = req.body;
    console.log(t.title);
    //let note={title:"XYZ", author:"Dr Aditya", body:"Kaay yaar"};
    
   var today = new Date();
//var dd = today.getDate();
//var mm = today.getMonth()+1; //January is 0!
//var yyyy = today.getFullYear();
//
//if(dd<10) {
//    dd='0'+dd
//} 
//
//if(mm<10) {
//    mm='0'+mm
//} 
//
//  var h = today.getHours();
//  var m = today.getMinutes();
//  var s = today.getSeconds();
//    var u = today.get
//
//    

//    
//let today1 = mm+'/'+dd+'/'+yyyy+','+h+':'+m+':'+s;

    let today1 = today.toLocaleString();

//    let parsed = reader.parse(t.body);
//    let niceMessage = writer.render(parsed);

    

    let note={title:t.title, author:t.author, body:t.body, when: today1, intDate:today.valueOf()};
    var id = db.insert(note);
    
             db.find({}, function(err, docs) {
    if (err) {
        console.log("something is wrong");
    } else {
        console.log("We found " + docs.length + " documents");
        
        
        var byDate = docs.slice(0);
        byDate.sort(function(a,b) {
    return b.intDate- a.intDate;
});
        console.log(byDate);
        
    //    res.render('allNotes',{note:byDate});
        
        
             let parsed = reader.parse(note.body);
        
        let niceMessage = " "+writer.render(parsed);
        note.body1 = niceMessage;
        
        
        
        
        
        
      res.render('note',note);
        
        
         
    }
});
 //   res.render('allNotes');
});

app.post('/Delete', function (req, res) {
    "use strict";
    
    
    
    res.render('allNotes');
});



//-----------------------------------------------
function getAll(){
    
     db.find({}, function(err, docs) {
    if (err) {
        console.log("something is wrong");
    } else {
        console.log("We found " + docs.length + " documents");
        
         return docs;
    }
});
    
    
    
}

//---------------------------------------------------

app.listen(3000);