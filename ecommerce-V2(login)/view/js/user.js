var request = new XMLHttpRequest();
var login = document.getElementById("loginUser");
var register = document.getElementById("register");
var detUser = document.getElementById("detUser");
var username = document.getElementById("username");
var useremail = document.getElementById("useremail");

function user()
{
    request.open('POST','/check');
    request.send();

    request.onload = function()
    {
        if(request.status === 202)
        {
            login.style.display = "block";
            detUser.style.display = "none";
        }
        else if(request.status === 200)
        {
            var resp = JSON.parse(request.response);
            login.style.display = "none";
            detUser.style.display = "block";
            username.setAttribute("value", resp['name']);
            useremail.setAttribute("value", resp['email']);
        }   
    }
}

function userLogin()
{           
    var email = document.getElementById("logemail");
    var password = document.getElementById("logpassword");
    if(email.value && password.value)
    {
        if(ValidateEmail(email.value))
        {
            request.open('POST','/login');
            request.setRequestHeader('Content-type','application/json');
            request.send(JSON.stringify({email: email.value, password: password.value})); 
        }
        else
        {
        alert("Enter a valid email address");
        }
    } 
    else
    {
        alert("Enter all the details correctly");
    } 
    
    request.onload = function()
    {
        if(request.status === 200)
        {
            location.href = '/';
        }
        else if(request.status === 201)
        {
            alert("Wrong Password. Try again!");
        }
        else if(request.status === 202)
        {
            alert("No such User Exists.");
        }
    }        
}

function ValidateEmail(mail) 
{
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail))
    {
        return (true);
    }
    return (false);
}

function CheckPassword(pass) 
{ 
    var decimal=  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    if(pass.match(decimal)) 
    { 
        return true;
    }
    return false;
} 



function userRegister()
{
    var name = document.getElementById("name");
    var confirm = document.getElementById("confirm");
    var email = document.getElementById("email");
    var password = document.getElementById("password");

    if(ValidateEmail(email.value) && password.value && name.value && confirm.value)
    {
        if(CheckPassword(password.value))
        {
            if(confirm.value === password.value)
            {
                request.open('POST','/register');
                request.setRequestHeader('Content-type','application/json');
                request.send(JSON.stringify({name: name.value, email: email.value, password: password.value})); 
            }
            else
            {
                alert("Both the passwords must be same");
            }
        }
        else
        {
            alert("Password Criteria: 8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character");
        }
    } 
    else
    {
        alert("Enter all the details correctly");
    } 
    
    request.onload = function()
    {
        if(request.status === 204)
        {
            alert('User exists. Kindly login.');
        }
        else if(request.status === 200)
        {
            window.location.href = '/';
        }
    }
}

function doRegister()
{
    login.style.display = "none";
    detUser.style.display = "none";
    register.style.display = "block";
}
function doLogin()
{
    register.style.display = "none";
    detUser.style.display = "none";
    login.style.display = "block";
}