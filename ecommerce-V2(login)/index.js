//SERVER FILE
var http = require("http");
var fs = require("fs");
var express = require("express");
var bodyparser = require("body-parser");
var session = require("express-session");
const { json } = require("express");

var app = express();
var STATUS_OK = 200, PASSWORD_NOT_MATCHED = 201, USER_NOT_FOUND = 202, USER_EXISTS = 204, STATUS_FAIL = 400;

app.use(express.static("view"));
app.use(bodyparser.json());
// this is read the prod_data initially
app.use(readFILE);

app.use(session({
    secret: "Hello from E-commerce",
    resave: false,
    saveUninitialized: true,
}));

function readFILE(req, res, next)
{
    readFile('./data/prod_data.txt', function(data)
    {
        req.prod_data = data;
        next();
    });
}

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

app.post('/data', function(request, response)
{
    // if(request.session.views)
    // {
    //     request.session.views++;
    // }
    // else
    // {
    //     request.session.views = 1;
    // }
    
    var data = request.prod_data.toString();
    //for checking user is logged in or not
    if(request.session.login)
    {
        response.writeHead(STATUS_OK);
        var email = request.session.userId, i = 0, cart_added = [];
        readFile('./data/cart_prod.txt', function(cart_data)
        {
            cart_data = JSON.parse(cart_data);
            for(; i < cart_data.length; i++)
            {
               if(cart_data[i]['user'] === email)
               {
                    cart_added = JSON.stringify(cart_data[i]["added"]);
                    break;
               } 
            }
            var d = {login: true, prod: data, added: cart_added, user: request.session.name, email: email};
            response.write(JSON.stringify(d));
            response.end();
        });
    }
    else
    {
        request.session.login = false;
        response.writeHead(USER_NOT_FOUND);
        response.write(JSON.stringify({login: false, prod: data, added: []}));
        response.end();
    }
});

app.post('/status', function(req, res)
{
    var user_data = req.body, prod_data = JSON.parse(req.prod_data.toString());
    readFile('./data/cart_prod.txt', function(cart_data)
    {
        var i = 0, j = 0, added = false;
        cart_data = JSON.parse(cart_data);
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
        else{
            res.write(JSON.stringify({add:0}));
        }
        res.end();
    });
});

app.post('/desc', function(req, res)
{
    var user_data = req.body;
    var added = 0;

    readFile('./data/prod_desc.txt', function(all_data)
    {
        all_data = JSON.parse(all_data);
        var i = 0, code = STATUS_FAIL;
        for(; i < all_data.length; i++)
        {
            if(all_data[i]["id"] === user_data["id"])
            {
                code = STATUS_OK;
                break;
            }
        }
        readFile('./data/cart_prod.txt', function(cart_data)
        {
            cart_data = JSON.parse(cart_data);
            
            for(var j = 0; j < cart_data.length; j++)
            {
                if(cart_data[j]['user'] === req.session.userId && cart_data[j]['added'].includes(user_data['id']))
                {
                    added = 1;
                    break;
                }
            }

            res.writeHead(code);
            res.write(JSON.stringify({img: all_data[i]["img"], desc: all_data[i]["desc"], add: added}));
            res.end();
        });
    });
});

app.post('/cart_data', function(req, res)
{
    var i = 0, d = [];
    if(!req.session.login)
    {
        res.writeHead(USER_NOT_FOUND);
        res.write(JSON.stringify({user: false}));
        res.end(); 
    }
    else
    {
        readFile('./data/cart_prod.txt', function(cart_data)
        {
            cart_data = JSON.parse(cart_data);
            for(; i < cart_data.length; i++)
            {
                if(cart_data[i]['user'] === req.session.userId)
                {
                    res.writeHead(STATUS_OK);
                    res.write(JSON.stringify({user: req.session.name, data: cart_data[i]['prod']}));
                    res.end();
                    break;
                }
            }
            if(i === cart_data.length)
            {
                res.writeHead(STATUS_OK);
                res.write(JSON.stringify({user: req.session.name, data: d}));
                res.end();
            }
        });
    }
});

app.post('/add', function(req, res)
{
    var user_data = req.body;

    readFile('./data/cart_prod.txt', function(cart_data)
    {
        cart_data = JSON.parse(cart_data);
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
});

app.post('/minus', function(req, res)
{
    var user_data = req.body;

    readFile('./data/cart_prod.txt', function(cart_data)
    {
        cart_data = JSON.parse(cart_data);
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
});

app.post('/checkout', function(req, res)
{
    readFile('./data/cart_prod.txt', function(cart_data)
    {
        var tot = 0, i = 0;
        cart_data = JSON.parse(cart_data);
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
});

//if user go to user.html after logging in it shows his profile
app.post('/check', function(req, res)
{
    if(req.session.login)
    {
        res.writeHead(STATUS_OK);
        res.write(JSON.stringify({email: req.session.userId, name: req.session.name}));
        res.end();
    }
    else
    {
        res.writeHead(USER_NOT_FOUND);
        res.end(); 
    }
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

app.post('/register', function(req, res)
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
            all_data.push(user_data);
            writeData('./data/user_data.txt', JSON.stringify(all_data));
            req.session.login = true;
            req.session.userId = user_data['email'];
            req.session.name = user_data['name'];
            res.writeHead(STATUS_OK);
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

app.listen(2828, function()
{
    console.log("Server running at port 2828");
});