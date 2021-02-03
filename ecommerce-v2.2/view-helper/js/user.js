var request = new XMLHttpRequest();
var login = document.getElementById("loginUser");
var register = document.getElementById("register");

function userLogin()
{           
    event.preventDefault();
    var email = document.getElementById("logemail");
    var password = document.getElementById("logpassword");
    var logemailerr = document.getElementById("logemailerr");
    var logpasserr = document.getElementById("logpasserr");

    if(!email.value)
    {
        logpasserr.style.display = 'none';
        logemailerr.style.display = 'block';
        logemailerr.innerHTML = "Email is required";
    }
    else if(!ValidateEmail(email.value))
    {
        logpasserr.style.display = 'none';
        logemailerr.style.display = 'block';
        logemailerr.innerHTML = "Enter a valid email";
    }
    else if(!password.value)
    {
        logemailerr.style.display = 'none';
        logpasserr.style.display = 'block';
        logpasserr.innerHTML = "Password is required";
    }
    else
    {
        request.open('POST','/login');
        request.setRequestHeader('Content-type','application/json');
        request.send(JSON.stringify({email: email.value, password: password.value})); 

        request.onload = function()
        {
            if(request.status === 200)
            {
                location.href = '/';
            }
            else if(request.status === 201)
            {
                logemailerr.style.display = 'none';
                logpasserr.style.display = 'block';
                logpasserr.innerHTML = "Entered password is wrong. Try Again !!";
            }
            else if(request.status === 202)
            {
                logpasserr.style.display = 'none';
                logemailerr.style.display = 'block';
                logemailerr.innerHTML = "No such User Exists.";
            }
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
    event.preventDefault();
    var name = document.getElementById("name");
    var confirm = document.getElementById("confirm");
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    var pic = document.getElementById('pic');

    var regerr = document.getElementById("regerr");

    if(!email.value || !password.value || !name.value || !confirm.value || !pic.files[0])
    {
        regerr.style.display = 'block';
        regerr.innerHTML = "All the details are required";
    }
    else if(!ValidateEmail(email.value))
    {
        regerr.style.display = 'block';
        regerr.innerHTML = "Enter a valid email";   
    }
    else if(!CheckPassword(password.value))
    {
        regerr.style.display = 'block';
        regerr.innerHTML = "Password must contain 8 to 15 characters which contain atleast one lowercase letter, one uppercase letter, one numeric digit, and one special character";   
    }
    else if(confirm.value !== password.value)
    {
        regerr.style.display = 'block';
        regerr.innerHTML = "Both the passwords must be same";   
    }
    else
    {
        request.open('POST','/checkUser');
        request.setRequestHeader('Content-type','application/json');
        request.send(JSON.stringify({email: email.value})); 

        request.onload = function()
        {
            if(request.status === 204)
            {
                regerr.style.display = 'block';
                regerr.innerHTML = "User exists. Kindly login.";
            }
            else if(request.status === 200)
            {
                var form = new FormData();
                form.append('avatar', pic.files[0]);
                form.append('name', name.value);
                form.append('email', email.value);
                form.append('password', password.value);

                request.open('POST','/register');
                request.send(form);

                request.onload = function()
                {
                    if(request.status === 200)
                    {
                        window.location.href = '/';
                    }
                    else if(request.status === 400)
                    {
                        regerr.style.display = 'block';
                        regerr.innerHTML = "Something went wrong!";
                    }
                }
            }
        }
    }
}

function doRegister()
{
    login.style.display = "none";
    register.style.display = "block";
}
function doLogin()
{
    register.style.display = "none";
    login.style.display = "block";
}