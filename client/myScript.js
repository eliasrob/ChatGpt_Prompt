import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form =document.querySelector('form');
// const textArea = document.getElementById("prompt");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;
// the loading animation to print . . .
function loader(element)
{
    element.textContent = '';
    loadInterval = setInterval(() => {
         element.textContent += ".";

         if(element.textContent === "...."){
            element.textContent = "";
         }

    }, 300);
    
}

// the function to print  AIresponse character by charatcer
function typeResponse(element, text)
{
    let index = 0;
    
    let interval = setInterval(() => {
        if(index < text.length){
            element.innerHTML += text.charAt(index);
            index++;
        }else{
            clearInterval(interval)
        }
    }, 20);

    

}


// the function to generate a uniquieId for the AI response message
function generateUniqueId(){
    const timeStamp = Date.now();
    const randomNumber = Math.random();
    const HexadecimalNumber = randomNumber.toString(16);

    return `Id-${timeStamp}-${HexadecimalNumber}`;
}


// since we do not have a place to hold the AI response, 
// we will create a function to generate a messageDiv to display that response.
function generatedDiv(isAi, text, uniqueId)
{
    const runtimediv = `
    <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
            <div class="profile">
                <img 
                  src=${isAi ? bot : user} 
                  alt="${isAi ? 'bot' : 'user'}" 
                />
            </div>
            <div class="message" id=${uniqueId}>${text}</div>
        </div>
    </div>
    `
    return runtimediv;
    
}

const handleSubmit = async(e) => {
//    always prevent the default form behaviour to run your custom behaviour
    e.preventDefault();

    const inputData = new FormData(form);
    const input = inputData.get('prompt');
    // users div
    chatContainer.innerHTML += generatedDiv(false, input);
    // clear text area
    form.reset();

    // ai div
    const resId = generateUniqueId();
    // var aiResponsediv = 
    chatContainer.innerHTML += generatedDiv(true, " ", resId);

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // select ai div to fill it with response unsing the unique ID
    const messageDiv = document.getElementById(resId);

    // use the loader to fill ai response message with ...
    loader(messageDiv)
 
// await fetch the url , and pass the method and request body
    const chatGptPromise = await fetch("http://localhost:5000", {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body : JSON.stringify({
            prompt: input
        })

    });

    clearInterval(loadInterval)
    messageDiv.innerHTML = " ";

    if(chatGptPromise.ok){
        const aiResponse = await chatGptPromise.json();
        const parsedResponse = aiResponse.bot.trim();
        typeResponse(messageDiv, parsedResponse);
    }else{
        const aiResponse = await chatGptPromise.text();
        messageDiv.innerHTML = "something Went Wrong";
    }

    // fetch gives us a promise of a response, then we have to json() that into an actual response
    

};




// we added an event listener to the submit action
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) =>{
    if(e.keyCode === 13){
        handleSubmit(e);
    }
})

