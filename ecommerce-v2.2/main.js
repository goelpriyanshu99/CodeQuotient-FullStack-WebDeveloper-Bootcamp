var express = require('express');
var fs = require("fs");
var bodyparser = require("body-parser");
var session = require("express-session");
var multer = require('multer');
var path = require('path');
var port = 3000;

var app = express();
var STATUS_OK = 200, PASSWORD_NOT_MATCHED = 201, USER_NOT_FOUND = 202, USER_EXISTS = 204, STATUS_FAIL = 400;

var multer_storage_config = multer.diskStorage(
{
    destination : function(req, res, callback)
    {
        callback(null, __dirname+"/data/uploadedPics")
    },
    filename : function(req,file, callback)
    {
        callback(null, `${file.originalname}_${Date.now()}${path.extname(file.originalname)}`);
    }
}
)

var uploader = multer({ storage: multer_storage_config});


// this is read the prod_data initially
app.use(function (req, res, next)
{
    readFile('./data/prod_data.txt', function(data)
    {
        req.prod_data = data;
        next();
    });
});
app.use(express.static('view-helper'));
app.use(express.static(__dirname+"/data/uploadedPics"));
app.set('view engine','ejs');
app.use(bodyparser.json());

app.use(function (req, res, next)
{
    readFile('./data/cart_prod.txt', function(data)
    {
        req.cart_data = data;
        next();
    });
});

app.use('/desc', function(req, res, next)
{
    readFile('./data/prod_desc.txt', function(data)
    {
        req.prod_desc = data;
        next();
    }); 
})

app.use(session({
    secret: "Hello from E-commerce",
    resave: false,
    saveUninitialized: true,
}));

function readFile(file_loc, callback)
{
    fs.readFile(file_loc, function(err, data)
    {
        if(err)
        {
            throw err;
        }
        callback(data);
    });
}

function writeData(file_name, data)
{
    fs.writeFile(file_name, data, function(err)
    {
        if(err)
        {
            throw err;
        }
    })
}

app.get('/', function(req, res)
{
    var data = JSON.parse(req.prod_data.toString());
     //for checking user is logged in or not
    if(req.session.login)
    {
        var email = req.session.userId, i = 0, cart_added = [];
        var cart_data = JSON.parse(req.cart_data.toString());
        for(; i < cart_data.length; i++)
        {
        if(cart_data[i]['user'] === email)
        {
            cart_added = JSON.stringify(cart_data[i]["added"]);
            break;
        } 
        }
        var d = {user: true, disp: 'Welcome ' + req.session.name, prod: data, added: cart_added, pic: req.session.avatar};
        res.render('index',d);
    }
    else
    {
        res.render('index',{
            user: false,
            disp: 'E-commerce', 
            prod: data, 
            added: [],
            pic: ''
        });
    }
});

app.get('/cart.html', function(req, res)
{
    var i = 0;
    if(!req.session.login)
    {
        res.render('cart',{
            user: false,
            disp: 'E-commerce', 
            pic: '',
            data: []
           }); 
    }
    else
    {        
        var cart_data = JSON.parse(req.cart_data.toString());
        for(; i < cart_data.length; i++)
        {
            if(cart_data[i]['user'] === req.session.userId)
            {
                var d = {user: true, disp: 'Welcome ' + req.session.name, data: cart_data[i]['prod'], pic: req.session.avatar};
                res.render('cart',d);
                break;
            }
        }
        if(i === cart_data.length)
        {
            var d = {user: true, disp: 'Welcome ' + req.session.name, data: [], pic: req.session.avatar};
            res.render('cart',d);
        }
    }
});

app.get('/user.html', function(req, res)
{
    if(req.session.login)
    {
        res.render('user',{
            login: true,
            pic: req.session.avatar,
            name: req.session.name,
            email: req.session.userId
        });
    }
    else
    {
        res.render('user',{
            login: false,
            pic: '',
            name: '',
            email: ''
        });
    }
});

app.post('/status', function(req, res)
{
    var user_data = req.body;
    var prod_data = JSON.parse(req.prod_data.toString()), cart_data = JSON.parse(req.cart_data.toString());;
    var i = 0, j = 0, added = false;

    for(; i < cart_data.length; i++)
    {
        if(cart_data[i]["user"] === req.session.userId)
        {
            if(cart_data[i]['added'].includes(user_data["id"]))
            {
                var index = cart_data[i]['added'].indexOf(user_data["id"]);
                cart_data[i]['added'].splice(index,1);
                j = 0;
                for(; j < cart_data[i]['prod'].length; j++)
                {
                    if(cart_data[i]['prod'][j]['id'] === user_data["id"])
                    {
                        break;
                    }
                }
                cart_data[i]['prod'].splice(j,1);
            }
            else
            {
                cart_data[i]['added'].push(user_data["id"]);
                j = 0;
                for(; j < prod_data.length; j++)
                {
                    if(prod_data[j]['id'] === user_data["id"])
                    {
                        break;
                    }
                }
                added = true;
                var obj = prod_data[j];
                obj.qty = 1;
                cart_data[i]['prod'].push(obj);
            }
            break;
        }  
    }
    // User which is new to add value to cart
    if(i === cart_data.length)
    {
        added = true;
        var obj = {
            "user" : req.session.userId,
            "added" : [user_data["id"]] 
        };
        j = 0;
        for(; j < prod_data.length; j++)
        {
            if(prod_data[j]['id'] === user_data["id"])
            {
                break;
            }
        }
        var prod_obj = prod_data[j];
        prod_obj.qty = 1;
        var prods = [prod_obj];
        obj.prod = prods;
        cart_data.push(obj);
    }
    writeData('./data/cart_prod.txt', JSON.stringify(cart_data));
    res.writeHead(STATUS_OK);
    // str is true when item is added to cart and we end request by sending 1
    if(added)
    {
        res.write(JSON.stringify({add:1}));
    }
    else
    {
        res.write(JSON.stringify({add:0}));
    }
    res.end();
});

app.post('/desc', function(req, res)
{
    var user_data = req.body, added = 0;
    var all_data = JSON.parse(req.prod_desc.toString()), cart_data = JSON.parse(req.cart_data.toString()); 
    
    var i = 0, code = STATUS_FAIL;
    for(; i < all_data.length; i++)
    {
        if(all_data[i]["id"] === user_data["id"])
        {
            code = STATUS_OK;
            break;
        }
    }
        
    if(req.session.login)
    {   
        for(var j = 0; j < cart_data.length; j++)
        {
            if(cart_data[j]['user'] === req.session.userId && cart_data[j]['added'].includes(user_data['id']))
            {
                added = 1;
                break;
            }
        }
    }

    res.writeHead(code);
    res.write(JSON.stringify({img: all_data[i]["img"], desc: all_data[i]["desc"], add: added}));
    res.end();
});

app.post('/add', function(req, res)
{
    var user_data = req.body;
    var cart_data = JSON.parse(req.cart_data.toString());

    for(var i = 0; i < cart_data.length; i++)
    {
        if(cart_data[i]["user"] === req.session.userId)
        {
            for(var j = 0; j < cart_data[i]['prod'].length; j++)
            {
                if(cart_data[i]['prod'][j]['id'] === user_data['id'])
                {
                    cart_data[i]['prod'][j]["qty"] = cart_data[i]['prod'][j]["qty"]+1;
                    break;
                }
            }
            break;
        }
    }
    writeData('./data/cart_prod.txt', JSON.stringify(cart_data));
    res.writeHead(STATUS_OK);
    res.write(JSON.stringify({code: 1}));
    res.end();
});

app.post('/minus', function(req, res)
{
    var user_data = req.body;
    var cart_data = JSON.parse(req.cart_data.toString());

    for(var i = 0; i < cart_data.length; i++)
    {
        if(cart_data[i]["user"] === req.session.userId)
        {
            for(var j = 0; j < cart_data[i]['prod'].length; j++)
            {
                if(cart_data[i]['prod'][j]['id'] === user_data['id'])
                {
                    cart_data[i]['prod'][j]["qty"] = cart_data[i]['prod'][j]["qty"]-1;
                    break;
                }
            }
            break;
        }
    }
    writeData('./data/cart_prod.txt', JSON.stringify(cart_data));
    res.writeHead(STATUS_OK);
    res.write(JSON.stringify({code: 1}));
    res.end();
});

app.post('/checkout', function(req, res)
{
    var tot = 0, i = 0;
    var cart_data = JSON.parse(req.cart_data.toString());
    for(; i < cart_data.length; i++)
    {
        if(cart_data[i]['user'] === req.session.userId)
        {
            cart_data[i]['prod'].forEach(data => {
                tot += parseInt(data["prod_price"]) * data["qty"];
            });
        }
    }
    res.write(JSON.stringify({total: tot}));
    res.end();
});

app.post('/login', function(req, res)
{
    readFile('./data/user_data.txt', function(all_data)
    {
        var user_data = req.body, i = 0;
        all_data = JSON.parse(all_data);
        for( ; i < all_data.length; i++)
        {
            if(all_data[i]['email'] === user_data['email'])
            {
                if(all_data[i]['password'] === user_data['password'])
                {
                    res.writeHead(STATUS_OK);
                    req.session.login = true;
                    req.session.userId = user_data['email'];
                    req.session.name = all_data[i]["name"];
                    req.session.avatar = all_data[i]['avatar']
                    res.end();
                }
                else
                {
                    res.writeHead(PASSWORD_NOT_MATCHED);
                    res.end();
                }
                break;
            }
        }
        if(i === all_data.length)
        {
            res.writeHead(USER_NOT_FOUND);
            res.end();  
        }
    });
});

app.post('/checkUser', function(req, res)
{
    readFile('./data/user_data.txt', function(all_data)
    {
        var user_data = req.body, i = 0;
        all_data = JSON.parse(all_data);
        for( ; i < all_data.length; i++)
        {
            if(all_data[i]['email'] === user_data['email'])
            {
                res.writeHead(USER_EXISTS);
                res.end();
                break;
            }
        }
        if(i === all_data.length)
        {
            res.writeHead(STATUS_OK);
            res.end();
        }
    });
})

app.post('/register', uploader.single("avatar"), function(req, res)
{
    readFile('./data/user_data.txt', function(all_data)
    {
        var user_data = req.body;
        all_data = JSON.parse(all_data);
        if(user_data !== {})
        {
            user_data.avatar = req.file.filename;
            all_data.push(user_data);
            writeData('./data/user_data.txt', JSON.stringify(all_data));
            req.session.login = true;
            req.session.userId = user_data['email'];
            req.session.name = user_data['name'];
            req.session.avatar = req.file.filename;
            res.writeHead(STATUS_OK);
            res.end();
        }
        else
        {
            res.writeHead(STATUS_FAIL);
            res.end();
        }
    });
});

app.post('/logout', function(req, res)
{
    req.session.destroy((err) => {
        if(err) {
            res.writeHead(USER_NOT_FOUND);
            res.end();
            throw err;
        }
        res.writeHead(STATUS_OK);
        res.end();
    });
});

app.listen(3000, (err) =>
{
    if(err)
    {
        throw err;
    }
    console.log(`Server running at http://localhost:${port}`);
})