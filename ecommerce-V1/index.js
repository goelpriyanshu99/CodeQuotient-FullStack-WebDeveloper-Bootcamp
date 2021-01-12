//SERVER FILE
var http = require("http");
var fs = require("fs");
var express = require("express");
var app = express();
var STATUS_OK = 200;
var STATUS_FAIL = 400;

app.use(express.static("view"));

function readJSON(request, callback)
{
    var body = '';
    request.on('data', function(chunk)
    {
        body += chunk;
    }); 
    
    request.on('end', function() 
    {
        var data = JSON.parse(body);
        callback(data);
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
    readFile('./data/prod_data.txt', function(data)
    {
        response.write(data);
        response.end();
    })
});

app.post('/status', function(req, res)
{
    readJSON(req, function(user_data)
    {
        readFile('./data/prod_data.txt', function(all_data)
        {
            var i = 0;
            all_data = JSON.parse(all_data);
            for(; i < all_data.length; i++)
            {
                if(all_data[i]["id"] === user_data["id"])
                {
                    all_data[i]["cart"] = !all_data[i]["cart"];
                    break;
                }  
            }

            readFile('./data/cart_prod.txt', function(cart_data)
            {
                cart_data = JSON.parse(cart_data);

                if(all_data[i]["cart"])
                {
                    var obj = {'id': all_data[i]["id"], 'img': all_data[i]["img"], 'prod_name': all_data[i]['prod_name'], 'prod_price': all_data[i]['prod_price'], 'qty': 1};
                    cart_data.push(obj);
                }
                else
                {
                    for(var j = 0; j < cart_data.length; j++)
                    {
                        if(cart_data[j]['id'] === user_data["id"])
                        {
                            break;
                        }
                    }
                    cart_data.splice(j, 1);
                }

                writeData('./data/cart_prod.txt', JSON.stringify(cart_data));
            });

            
            writeData('./data/prod_data.txt', JSON.stringify(all_data));

            res.writeHead(STATUS_OK);
            // str is true when item is added to cart and we end request by sending 1
            if(all_data[i]["cart"])
            {
                res.write(JSON.stringify({add:1}));
            }
            else{
                res.write(JSON.stringify({add:0}));
            }
            res.end();
        });
    });
});

app.post('/desc', function(req, res)
{
    readJSON(req, function(user_data)
    {
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
                if(cart_data.length)
                {
                    for(var j = 0; j < cart_data.length; j++)
                    {
                        if(cart_data[j]['id'] === user_data["id"])
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
        });
    })
});

app.post('/cart_data', function(req, res)
{
    readFile('./data/cart_prod.txt', function(cart_data)
    {
        res.writeHead(STATUS_OK);
        res.write(cart_data);
        res.end();
    })
});

app.post('/add', function(req, res)
{
    readJSON(req, function(user_data)
    {
        readFile('./data/cart_prod.txt', function(cart_data)
        {
            cart_data = JSON.parse(cart_data);
            for(var i = 0; i < cart_data.length; i++)
            {
                if(cart_data[i]["id"] === user_data["id"])
                {
                    cart_data[i]["qty"] = cart_data[i]["qty"]+1;
                    break;
                }
            }
            writeData('./data/cart_prod.txt', JSON.stringify(cart_data));
            res.writeHead(STATUS_OK);
            res.write(JSON.stringify({code: 1}));
            res.end();
        });
    });
});

app.post('/minus', function(req, res)
{
    readJSON(req, function(user_data)
    {
        readFile('./data/cart_prod.txt', function(cart_data)
        {
            cart_data = JSON.parse(cart_data);
            for(var i = 0; i < cart_data.length; i++)
            {
                if(cart_data[i]["id"] === user_data["id"])
                {
                    cart_data[i]["qty"] = cart_data[i]["qty"]-1;
                    break;
                }
            }
            writeData('./data/cart_prod.txt', JSON.stringify(cart_data));
            res.writeHead(STATUS_OK);
            res.write(JSON.stringify({code: 1}));
            res.end();
        });
    });
});

app.post('/checkout', function(req, res)
{
    readFile('./data/cart_prod.txt', function(all_data)
    {
        var tot = 0;
        all_data = JSON.parse(all_data);
        if(all_data.length !== 0)
        {
            all_data.forEach(data => {
                tot += parseInt(data["prod_price"]) * data["qty"];
            });
        }
        res.write(JSON.stringify({total: tot}));
        res.end();
    });
});



app.listen(2828);
console.log("Server running at port 2828");