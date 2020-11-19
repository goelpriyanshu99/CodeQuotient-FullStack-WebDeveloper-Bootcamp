//array to store ques, their options and solution
var a = [{  title: "#include is called",   
                option: ['Preprocessor directive','Inclusion directive','File inclusion directive','None of the mentioned'],
                solution: 'Preprocessor directive'},
        {  title: "C preprocessors can have compiler specific features.",   
        option: ['true','false','Depends on the standard','Depends on the platform'],
        solution: 'true'},
        {  title: "C preprocessor is conceptually the first step during compilation",   
        option: ['true','false','Depends on the standard','Depends on the compiler'],
        solution: 'true'},
        {  title: "Which of the following is not JavaScript Data Types?",   
        option: ['Undefined','Number',' Boolean','Float'],
        solution: 'Float'},
        {  title: "Which company developed JavaScript?",   
        option: ['Netscape','Bell Labs','Sun Microsystems',' IBM'],
        solution: 'Netscape'},
        {  title: "Inside which HTML element do we put the JavaScript?",   
        option: ['script','head',' meta','style'],
        solution: 'script'},
        {  title: "What is the original name of JavaScript?",   
        option: ['LiveScript','EScript','Mocha','JavaScript'],
        solution: 'Mocha'},
        {  title: "HTML is what type of language ?",   
        option: ['Scripting Language','Markup Language','Programming Language','Network Protocol'],
        solution: 'Markup Language'},
        {  title: "Apart from 'b' tag, what other tag makes text bold ?",   
        option: ['fat','strong','black','emp'],
        solution: 'strong'},
        {  title: "What do we use to define a block of code in Python language?",   
        option: ['Key','Brackets','Indentation','None of these'],
        solution: 'Indentation'}
    ];


// Getting all the elements using their id through DOM

var form = document.getElementById("option");
var ques = document.getElementById("ques");
var head = document.getElementById("head");
var topHead = document.getElementById("topHead");
var ul = document.getElementById("ul");
var restart = document.getElementById("restart");

// label id
var opt1 = document.getElementById("opt1");
var opt2 = document.getElementById('opt2');
var opt3 = document.getElementById('opt3');
var opt4 = document.getElementById('opt4');

// input id
var op1 = document.getElementById("op1");
var op2 = document.getElementById('op2');
var op3 = document.getElementById('op3');
var op4 = document.getElementById('op4');

var result = document.getElementById('result');
var submit = document.getElementById('submit');
var score = 0;
var n = -1;

// function to print data to website
function print() {
    n++;
    ques.innerHTML = a[n].title;
    opt1.innerHTML = a[n].option[0];
    opt2.innerHTML = a[n].option[1];
    opt3.innerHTML = a[n].option[2];
    opt4.innerHTML = a[n].option[3];

    op1.value = a[n].option[0];
    op2.value = a[n].option[1];
    op3.value = a[n].option[2];
    op4.value = a[n].option[3];
}

print();

// event listener to listen click on submit button
submit.addEventListener("click", function() {
    let data = new FormData(form);
    let output = "";
    for (const entry of data) {
        output = output + entry[1];
    };
    console.log(output);

    // if submit button is shown

    if(submit.innerHTML == "Submit")
    {    
        // if nothing is selected by user
        if(output == "") {
            result.style.display = "block";
            result.style.width = "190px";
            result.style.backgroundColor = "#5efc82";
            result.style.color = "#009624";
            result.innerHTML = 'Please select an option';
        }
        else {

            op1.disabled = true;
            op2.disabled = true;
            op3.disabled = true;
            op4.disabled = true;
            result.style.display = "block";
            // console.log(n);
            // if the choosen option is correct
            if(output == a[n].solution) {
                result.innerHTML = 'Correct';
                result.style.backgroundColor = "#5efc82";
                result.style.color = "#009624";
                result.style.width = "60px";
                score++;
            }
            // if choosen option is wrong
            else {
                result.innerHTML = 'Incorrect';
                result.style.width = "70px";
                result.style.backgroundColor = "#ff867c";
                result.style.color = "#b61827";
            }
            submit.innerHTML = "Next";
            submit.style.color = "white";
            submit.style.backgroundColor = "green";
        }
    }
    // if next button is shown and questions left to display
    else if(submit.innerHTML == "Next" && n < a.length - 1)
    {
        result.style.display = "none";
        op1.disabled = false;
        op2.disabled = false;
        op3.disabled = false;
        op4.disabled = false;

        op1.checked = false;
        op2.checked = false;
        op3.checked = false;
        op4.checked = false;

        submit.innerHTML = "Submit";
        submit.style.color = "#c43e00";
        submit.style.backgroundColor = "yellow";
        print();
    }
    // showing result
    else 
    {
        head.innerHTML = "Score: " + score + " (Out of "+ a.length + ")";  
        topHead.style.display = "block";
        form.style.display = "none";
        result.style.display = "none";
        submit.style.display = "none";
        restart.style.display = "block";

        a.forEach( function(q, index) {
            var li = document.createElement('li');
            li.innerHTML = q.title + " - " + "<span id='a'>"+q.solution+"</span>";
            ul.appendChild(li);
        });
    }
});
// console.log(ques, opt1);
