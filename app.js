var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'mmm'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var Person = {
     employee_id: Int32Array,
    employee_name: String,
    employee_gender: String,
    department_id: Int32Array,
     Department_name: String,
     picture_name: String

}


app.get('/', function(request, response) {
//	response.sendFile(path.join(__dirname + '/login.html'));
 response.render('login')
});

// To get pictures!!
app.use(express.static(path.join(__dirname,"public")));

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM employees e,departments d WHERE (e.employee_username = ? and e.employee_password = ?) and d.department_id = e.department_id ', [username, password], function(error, results, fields) {
            console.log(results);
            if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
                response.redirect('/home');
                Person.employee_id = results[0].employee_id;
                Person.employee_name = results[0].employee_name;
                Person.Department_name = results[0].department_name;
                Person.employee_gender = results[0].employee_gender;
                Person.department_id = results[0].department_id; 
                Person.picture_name = "src =" + results[0].employee_picture;
                
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});



//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')
app.get('/home', function(request, response, next ) {
	if (request.session.loggedin) {
      
        connection.query('SELECT * FROM orders o,orderitems ot WHERE o.employee_id = ? and o.order_id = ot.order_id ',[Person.employee_id], function(error, results, fields) {
			if (results.length > 0) {
             console.log(results);
              
                console.log(Person.Department_name)
                console.log(Person.picture_name)
             var res= results;
            

                return response.render('home',{val:Person ,items: results});
            }
            else
            {
                console.log('Query did not worked!')
            }
        } );
     console.log (Person.employee_name);
    
     
 
  //response.sendfile('home.html');
  
        
    }
	 else {
        //response.send('Please login to view this page!');
        response.render('login')
	}
//	response.end();
});
 

app.get('/items', function(request, response,next) {
  if (request.session.loggedin) 
  {
    connection.query('SELECT * FROM items', function(error, results, fields) {
			if (results.length > 0) {
             console.log(results);
            
                return response.render('items',{item: results});
            }
            else
            {
                console.log('Query did not worked!')
            }
        } );
  } 
  else {
    //	response.send('Please login to view this page!');
    response.render('login')
	}

});

app.get('/shops', function(request, response) {
	if (request.session.loggedin) {
    connection.query('SELECT s.shop_id,s.shop_name,s.shop_address,e.employee_username,e.employee_password from shops s CROSS JOIN employees e', function(error, results, fields) {
			if (results.length > 0) {
             console.log(results);
            
                return response.render('shops',{shop: results});
            }
            else
            {
                console.log('Query did not worked!')
            }
        } );
	} else {
        //response.send('Please login to view this page!');
        response.render('login')
	}

});

var shoo;
var itemm;
app.get('/orders', function(request, response) {
	if (request.session.loggedin) {
    connection.query('select * from shops', function(error, results, fields) {
			if (results.length > 0) {
             console.log(results);
             connection.query('select * from items LEFT JOIN orderitems on items.item_id = orderitems.item_id', function(error, result, fields) {
                if (results.length > 0) {
                 console.log(result);
               
                } 
                 shoo = results;
                 itemm = result;
                return response.render('orders',{shops: shoo, itemv : itemm });
            });
            }
            else
            {
                console.log('Query did not worked!')
            }
        } );
 
	} else {
        //response.send('Please login to view this page!');
        response.render('login')
	}

});


app.get('/logout', function(request, response) {
	if (request.session.loggedin) {
  
    request.session.destroy();
    response.render('login')
    

	} else {
        
        response.render('login')
	}

});

//Testing 
var tabelData = {

    Store:String,
    Item:String,
    Quantity:Int32Array,
    OrderID:Int32Array,
    ItemID:Int32Array,   
    StoreID:Int32Array,
    UnitPrice:Int32Array
}
var fin = []  ;
app.post('/confirm', function (req, res, next) {
    //console.log(req.body);
    if(req.body != null)
    {
        tabelData.OrderID = req.body.OrderId;
        tabelData.Store = req.body.Store;
        tabelData.Item = req.body.Item;
        tabelData.Quantity = req.body.Quantity;
        
       // testing insert query 
       
       connection.query('select item_id,unit_price from items where item_name  = ?',[tabelData.Item], function(error, ess, fields) {
        if (ess.length > 0) {
         tabelData.ItemID = ess[0].item_id;
         tabelData.UnitPrice = ess[0].unit_price;
         console.log(tabelData.UnitPrice);
        } 
    });
    console.log(tabelData.Store);
    connection.query('select shop_id from shops where shop_name  = ?',[tabelData.Store], function(error, ress, fields) {
        
        if (ress.length > 0) {
         tabelData.StoreID = ress[0].shop_id;
         console.log(ress[0].shop_id)
         console.log(tabelData.StoreID);
         
         
        } 
    });

    var mes ;
    console.log(tabelData.OrderID);
    connection.query('INSERT INTO orders set ? ',{order_id:tabelData.OrderID,employee_id:Person.employee_id,shop_id:tabelData.StoreID,booked_at: "000000"}, function(error, rest, fields) {
        if(error){
            console.log(error);
        }else
        {
        
            tabelData.UnitPrice = tabelData.UnitPrice * 2 ;
            console.log(tabelData.UnitPrice);
            console.log(tabelData.Item);
            connection.query('insert into orderitems set?',{order_id:tabelData.OrderID,item_id:tabelData.ItemID,item_quantity:tabelData.Quantity,total_price:tabelData.UnitPrice}, function(error, restt, fields) {
             if(error)
             {
                 console.log(error);
             } else
             {
               
                res.render('orders',{shops: shoo, itemv : itemm,ree:JSON.stringify(fin),message:"Data Entry Sucessful!"});
             } 
            
            });
        }
    });
   
    
    

       
       
     
        
        
    }
    
  });

app.listen(3000);