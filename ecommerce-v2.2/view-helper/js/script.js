var request = new XMLHttpRequest(), STATUS_OK = 200;
var modal = document.getElementsByClassName("modal")[0];
var pop = document.getElementById("item-desc");
var close = document.getElementById("close");

close.addEventListener("click", abc);

function abc()
{
    modal.style.display = "none";
    pop.style.display = "none";
}

function desc(id)
{
    request.open('POST', '/desc');
    request.setRequestHeader("Content-type","application/json");
    request.send(JSON.stringify({id: id}));

    request.onload = function()
    {
        var res = JSON.parse(request.response);

        var img = document.getElementById("item-img");
        var desc = document.getElementById("desc");
        
        set_desc_button(res["add"], id);
        modal.style.display  = "block";
        img.setAttribute('src', res["img"]);
        desc.innerText = res["desc"];
        pop.style.display = "block";
    }
}

function set_desc_button(added, id)
{
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
    btn.setAttribute("onclick", "cart("+id+")");         
} 