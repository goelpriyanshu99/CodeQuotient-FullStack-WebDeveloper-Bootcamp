var input_todo = document.getElementById("input_todo");
var task_container = document.getElementById("task_container");

var k = document.getElementById("no");
// console.log(list);
input_todo.addEventListener("keydown", handleInput);

var tasks = [];    

var result = localStorage.getItem("items");

result = JSON.parse(result);

tasks = result || [];

if(tasks.length == 0) {
k.innerText = "List Empty!!";
}


tasks.forEach(function(data)
{
createTodo(data);            

});



function handleInput(event)
{
    if( event.keyCode === 13 )
    {
        
        createTodo(input_todo.value);

        tasks.push(input_todo.value);

        var json_data = JSON.stringify(tasks);

        localStorage.setItem("items",json_data);

        //task_input.style.backgroundColor = "red";
        input_todo.value = "";
    }

}

//    function createTodo(text, index)
function createTodo(text)
{
    k.innerHTML = "";
    var ele = document.createElement("li");
            
    ele.innerHTML = text;

    // ele.setAttribute("id",index);

    ele.addEventListener("click", deleteTodo)

    task_container.appendChild(ele);
}


function deleteTodo(event)
{
    task_container.removeChild(event.target);

    var d = event.target.innerHTML;

    tasks.splice(tasks.indexOf(d), 1);

    if(tasks.length == 0) {
        k.innerText = "List Empty!!";
    }
    // if we use id to delete the value from localStorage we have to reload it after each delete 
    // tasks.splice(event.target.id, 1);
    // window.location.reload();

    // console.log(event.target.innerHTML);

    localStorage.setItem("items",JSON.stringify(tasks));
    
    // console.log(event.target.innerHTML);

    localStorage.setItem("items",JSON.stringify(tasks));
}
