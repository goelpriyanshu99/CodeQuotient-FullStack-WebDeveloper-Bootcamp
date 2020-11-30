var q = [];
var res = localStorage.getItem("arr");
res = JSON.parse(res);
q = res || [];

var title = document.getElementById('title_q');
var desc = document.getElementById('desc');
var sub = document.getElementById('add');
var query = document.getElementById("queries");
var search = document.getElementById("search");

var raise_q = document.getElementById('raise_q');
var show_query = document.getElementById('show_query');
var show_title = document.getElementById('show_title');
var show_desc = document.getElementById("show_desc");
var show = document.getElementById("show");
// var show_name = document.getElementById("show_name");
// var show_comment = document.getElementById("show_comment");
var res_name = document.getElementById("res_name");
var comment = document.getElementById("comment");
var done = document.getElementById("done");
var resolve = document.getElementById("resolve");

display(q);

sub.addEventListener("click", function() {    
    var d = desc.value;
    var t = title.value;

    if(t !== "" && d !== "") {
        var a = document.getElementById("alert1");
        var b = document.getElementById("alert2");
        a.style.display = "none";
        b.style.display = "none";
    
        desc.value = "";
        title.value = "";
        var obj = {};

        obj.title = t;
        obj.desc = d;
        obj.resolved = 0;
        obj.sol = [];
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        obj.issued = today.toDateString();

        q.push(obj);

        var json_data = JSON.stringify(q);
        localStorage.setItem("arr",json_data);

        display(q);
        search.value = "";
    }
    else if(t === "") {
        var a = document.getElementById("alert1");
        var b = document.getElementById("alert2");
        b.style.display = "none";
        a.style.display = "inline-block";
    }
    else if(d === "") {
        var a = document.getElementById("alert1");
        var b = document.getElementById("alert2");
        a.style.display = "none";
        b.style.display = "inline-block"
    }
})

search.addEventListener("keydown", keydown)
function keydown(event) {
    var x = search.value.toLowerCase();

    if(event.which > 45) {
        x += event.key.toLowerCase();
    }
    if(event.which == 8) {
        x = x.substr(0,x.length-1);
    }
    var temp = [];

    if(x == "" ) {
        display(q);
    }
    else {
        q.forEach(function(que, index) {
            if(que.title.toLowerCase().includes(x)) {
                temp.push(que);
            }
        })
        if(temp.length == 0) {
            var di = document.getElementById("dis");
            if(di != null) {
                query.removeChild(di);
            }
            var d = document.createElement("div");
            d.setAttribute("class","disp");
            d.setAttribute("id","dis");
            var h = document.createElement("h1");
            h.innerHTML = "No Match Found";
            d.appendChild(h);
            query.appendChild(d);
        } 
        else {
            display(temp);
        }
    }
}


function display(q1) {
    var di = document.getElementById("dis");
    if(di != null) {
        query.removeChild(di);
    }
    var dis = document.createElement("div");
    dis.setAttribute("id","dis");
    q1.forEach(function(val, index) {
        if(val.resolved === 0) {
            var d = document.createElement("div");
            d.setAttribute("class","disp");
            var h = document.createElement("h1");
            h.innerHTML = val.title;
            var desc = document.createElement("p");
            desc.innerHTML = val.desc;
            d.appendChild(h);
            d.appendChild(desc);
            
            d.addEventListener("click", function() {
                raise_q.style.display = "none";
                show_query.style.display = "block";   
        
                show_title.innerHTML = val.title;
                show_desc.innerHTML = val.desc;

                show_response(val.sol);    

                resolve.setAttribute("value",val.title);
                done.setAttribute("value",val.title);                
                
                done.addEventListener("click", function() {
                    var n = res_name.value;
                    var c = comment.value;

                    if(n !== "" && c !== "") {
                        var a = document.getElementById("alert3");
                        var b = document.getElementById("alert4");
                        a.style.display = "none";
                        b.style.display = "none";
                        
                        var x = {};
                        x.name = n;
                        x.comment = c;

                        for(var i = 0; i < q.length; i++) {
                            if(q[i].title == done.value) {
                                q[i].sol.push(x);
                                var json = JSON.stringify(q);
                                localStorage.setItem("arr",json);
                                show_response(q[i].sol);
                                res_name.value = "";
                                comment.value = "";
                                break;
                            }
                        }
                    }
                    else if(n === "") {
                        var a = document.getElementById("alert3");
                        var b = document.getElementById("alert4");
                        b.style.display = "none";
                        a.style.display = "inline-block";
                    }
                    else if(c === "") {
                        var a = document.getElementById("alert3");
                        var b = document.getElementById("alert4");
                        a.style.display = "none";
                        b.style.display = "inline-block";
                    }
                });
                
            });
            dis.appendChild(d);
        }
    });
    query.appendChild(dis);
}

function reso() {
    var v = resolve.value;
    for(var i = 0; i < q.length; i++) {
        if(q[i].title === v) {
            q[i].resolved = 1;
            var json = JSON.stringify(q);
            localStorage.setItem("arr",json);
            break;
        }
    }
    display(q);
    new_ques();
}

function new_ques() {    
    raise_q.style.display = "block";
    show_query.style.display = "none";
    search.value = "";
    display(q);    
}

function show_response(temp) {
    if(temp.length == 0) {
        var help = document.getElementById("help");
        if(help != null) {
            show.removeChild(help);
        }
        var d = document.createElement("div");
        d.setAttribute("id","help");
        var second = document.createElement("div");
        var h1 = document.createElement("h2");
        h1.innerHTML = "No Response yet.";
        second.append(h1);
        d.append(second);
        show.append(d);
    }
    else {
        var help = document.getElementById("help");
        if(help != null) {
        show.removeChild(help);
        }
        var x = document.createElement("div");
        x.setAttribute("id","help");
        temp.forEach(function(r, index) {
            var d = document.createElement("div");
            var h1 = document.createElement("h2");
            h1.innerHTML = r.name;
            d.append(h1);
            var p = document.createElement("p");
            p.innerHTML = r.comment;
            d.append(p);
            x.append(d);
            // show_name.innerHTML =  r.name;
            // show_comment.innerHTML = r.comment;
        })
        show.append(x);
    }
}
