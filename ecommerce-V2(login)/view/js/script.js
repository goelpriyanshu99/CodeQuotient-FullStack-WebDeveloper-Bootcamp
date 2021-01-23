var close = document.getElementById("close");
var profile = document.getElementById("profile");
var main_cart = document.getElementById("main_cart");
var userHead = document.getElementById("userHead");
var login = document.getElementById("login");
var main = document.getElementById("main");
var pop = document.getElementById("item-desc");
var modal = document.getElementsByClassName("modal")[0];
var logout = document.getElementById("logout");
var checkout = document.getElementById('checkout');
var cart_login = document.getElementById('cart_login');
var cart_data = document.getElementById('cart_data');

var request = new XMLHttpRequest();
var STATUS_OK = 200, NO_LOGIN = 202;
var user_det = '';

close.addEventListener("click", abc);

function abc()
{
    modal.style.display = "none";
    pop.style.display = "none";
}

function refresh()
{
    request.open('POST','/data');
    request.send();

    request.onload = function()
    {
        var data =  JSON.parse(request.response);
        var prod = JSON.parse(data['prod']);
        if((request.status === STATUS_OK || request.status === NO_LOGIN) && data)
        {
            if(data["login"])
            {
                login.style.display = "none";
                logout.style.display = "inline";
                profile.style.display = "inline";
                userHead.innerText = "Welcome " + data['user'] ;
                user_det = data['email'];
            }
            else
            {
                userHead.innerText = "E-Commerce" ;
                login.style.display = "inline";
                logout.style.display = "none";
                profile.style.display = "none";
            }
            prod.forEach(ele => {
                appendData(ele["id"], ele["img"], ele["prod_name"], ele["prod_price"], data['added']);
            });
        }
    }
}

function appendData(id, imge, name, price, cart_data)
{
    var div = document.createElement("div");
    div.setAttribute("class","card");
    div.setAttribute("id",id);
    div.style.display = "inline-block";

    var img = document.createElement("img");
    img.setAttribute("class","card-img-top");
    img.setAttribute("src",imge);
    img.setAttribute("alt",name);

    var in_div = document.createElement("div");
    in_div.setAttribute("class","card-body");

    var h3 = document.createElement("h3");
    h3.setAttribute("class","card-title");
    h3.innerHTML = name;

    var p = document.createElement("p");
    p.setAttribute("class","card-text");
    p.innerHTML = "Price : ₹" + price;

    var btn1 = document.createElement("a");
    btn1.setAttribute("id",id+"cart");
    btn1.setAttribute("onClick", "cart("+id+")");
    if(!cart_data.includes(id))
    {
        btn1.setAttribute("class","btn btn-success");
        btn1.innerHTML = "Add to cart";
    }
    else
    {
        btn1.setAttribute("class","btn btn-danger");
        btn1.innerHTML = "Remove from cart"; 
    }

    var btn2 = document.createElement("a");
    btn2.setAttribute('onClick', "desc("+id+",1)");
    btn2.setAttribute("class","btn btn-info");
    btn2.innerHTML = "View Desc";

    in_div.appendChild(h3);
    in_div.appendChild(p);
    in_div.appendChild(btn1);
    in_div.appendChild(btn2);

    div.appendChild(img);
    div.appendChild(in_div);

    main.appendChild(div);

}

logout?.addEventListener('click', function()
{
    request.open('POST','/logout');
    request.send();

    request.onload = function()
    {
        if(request.status === STATUS_OK)
        {
            alert('Logged out successful');
            location.href = '/';
        }
        else
        {
            alert('Logged out not successful');
        }
    }
});

function cart(id)
{
    if(user_det !== "")
    {
        id = id.id??id;
        request.open('POST','/status');
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify({id: id}));

        request.onload = function()
        {
            var status = request.status;
            var str = JSON.parse(request.response);
            var node = document.getElementById(id+"cart");
            if(status === STATUS_OK)
            {
                if(str['add'])
                {
                    node.setAttribute("class","btn btn-danger");
                    node.innerHTML = "Remove from cart";
                }
                else
                {
                    node.setAttribute("class","btn btn-success");
                    node.innerHTML = "Add to cart";
                }
                set_desc_button(str['add'], id, 1);
            }
        }
    }
    else
    {
        alert("You have to login for this");
    }
}

function desc(id, opt)
{
    request.open('POST', '/desc');
    request.setRequestHeader("Content-type","application/json");
    request.send(JSON.stringify({id: id.id}));

    request.onload = function()
    {
        var res = JSON.parse(request.response);

        var img = document.getElementById("item-img");
        var desc = document.getElementById("desc");
        
        set_desc_button(res["add"], id, opt);
        modal.style.display  = "block";
        img.setAttribute('src', res["img"]);
        desc.innerText = res["desc"];
        pop.style.display = "block";
    }
}

function set_desc_button(added, id, opt)
{
    id = id.id??id;
    var btn = document.getElementsByClassName("desc-button btn-success")[0] ?? document.getElementsByClassName("desc-button btn-danger")[0] ;        
    if(added)
    {
        btn.setAttribute("class", "desc-button btn-danger");
        btn.innerHTML = "Remove from cart";
    }
    else
    {
        btn.setAttribute("class", "desc-button btn-success");
        btn.innerHTML = "Add to cart";
    }

    btn.setAttribute("id", id+"cart");
    if(opt)
    {
        btn.setAttribute("onclick", "cart("+id+")");
    }
    else
    {
        btn.setAttribute("onclick", "removeCart("+id+")");
    }           
}

//code for cart.html

function refresh_cart()
{
    request.open('POST','/cart_data');
    request.setRequestHeader("Content-type","application/json");
    request.send();

    request.onload = function()
    {
        var d = JSON.parse(request.response);
        if(request.status === STATUS_OK )
        {
            var data =  d['data'] ;
            userHead.innerText = "Welcome " + d['user'] ;
            if(data.length)
            {
                data.forEach(ele => {
                    appendCartData(ele["id"], ele["img"], ele["prod_name"], ele["prod_price"], ele["qty"]);
                });
                checkout.style.display = "block";
                cart_login.style.display = "none";
                cart_data.style.display = "none";
            }
            else
            {
                cart_data.style.display = "block";
            }
        }
        else if(request.status === NO_LOGIN && !d['user'])
        {
            cart_data.style.display = "none";
            checkout.style.display = "none";
            cart_login.style.display = "block";
            userHead.innerText = "E-Commerce" ;
        }
    }
}

function appendCartData(id, imge, name, price, qty)
{
    var div = document.createElement("div");
    div.setAttribute("class","card");
    div.setAttribute("id",id);
    div.style.display = "inline-block";

    var img = document.createElement("img");
    img.setAttribute("class","card-img-top");
    img.setAttribute("src",imge);
    img.setAttribute("alt",name);

    var in_div = document.createElement("div");
    in_div.setAttribute("class","card-body");

    var h3 = document.createElement("h3");
    h3.setAttribute("class","card-title");
    h3.innerHTML = name;

    var p = document.createElement("p");
    p.setAttribute("class","card-text");
    p.innerHTML = "Price : ₹" + price;

    var div_bb = document.createElement("div");
    var p1 = document.createElement("p");
    p1.setAttribute("class", "card-text");
    p1.style.float = "left";
    p1.innerHTML = "Quantity : ";

    var span = document.createElement("span");
    span.setAttribute("id",id+"qty");
    span.innerHTML = qty;

    var div_b = document.createElement("div");
    var btn_plus = document.createElement("button");
    var btn_minus = document.createElement("button");
    var br = document.createElement("br");

    btn_plus.style.marginLeft = "12px";
    btn_minus.style.marginLeft = "8px";
    btn_plus.setAttribute("class","btn btn-primary");
    btn_plus.setAttribute("onclick","plus("+id+")");
    btn_minus.setAttribute("class","btn btn-primary");
    btn_minus.setAttribute("onclick","minus("+id+")");

    btn_plus.innerHTML = "&plus;";
    btn_minus.innerHTML = "&minus;";

    var btn1 = document.createElement("a");
    btn1.setAttribute("id",id+"cart");
    btn1.setAttribute("onClick", "removeCart("+id+")");
    btn1.setAttribute("class","btn btn-danger");
    btn1.innerHTML = "Remove from cart"; 
    

    var btn2 = document.createElement("a");
    btn2.setAttribute('onClick', "desc("+id+", 0)");
    btn2.setAttribute("class","btn btn-info");
    btn2.innerHTML = "View Desc";

    p1.appendChild(span);
    
    div_b.appendChild(btn_plus);
    div_b.appendChild(btn_minus);
    div_bb.appendChild(p1);
    div_bb.appendChild(div_b);

    in_div.appendChild(h3);
    in_div.appendChild(p);
    in_div.appendChild(div_bb);
    // in_div.appendChild(div_b);
    in_div.appendChild(br);
    in_div.appendChild(btn1);
    in_div.appendChild(btn2);

    div.appendChild(img);
    div.appendChild(in_div);

    main_cart.appendChild(div);

}

function removeCart(id)
{
    var i = id.id??id;
    request.open('POST','/status');
    request.setRequestHeader("Content-type","application/json");
    request.send(JSON.stringify({id: i}));

    request.onload = function()
    {
        var res = JSON.parse(request.response);
        if(!res["add"])
            main_cart.removeChild(id);
            pop.style.display = "none";
            abc();
    }
}

function plus(id)
{
    id = id.id;
    request.open('POST','/add');
    request.setRequestHeader("Content-type","application/json");
    request.send(JSON.stringify({id: id}));

    request.onload = function()
    {
        var res = JSON.parse(request.response);
        if(res["code"])
        {
            var inc = document.getElementById(id+"qty");
            inc.innerHTML =  parseInt(inc.innerHTML) + 1;
        }
    }
}

function minus(id)
{
    id = id.id;
    var inc = document.getElementById(id+"qty");
    if(parseInt(inc.innerHTML) > 1)
    {
        request.open('POST','/minus');
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify({id: id}));

        request.onload = function()
        {
            var res = JSON.parse(request.response);
            if(res["code"])
            {
                inc.innerHTML =  parseInt(inc.innerHTML) - 1;
            }
        }
    }
    else
    {
        alert("The quantity must be one minimum.");
    }
}

function checkOut()
{
    request.open('POST','/checkout');
    request.send();

    request.onload = function()
    {
        var res = JSON.parse(request.response);
        alert("Your total amout of products is : Rs "+ res["total"]);
    }
}