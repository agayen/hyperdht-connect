// enter_app 

const getToken = document.getElementById('get_token')
const joinToken = document.getElementById('join_token')
const enterApp = document.getElementById('enter_app');
const mainApp = document.getElementById('main_app');

const errorTip = (error_m) => {
    Swal.fire({
        title: "Oops..",
        text: error_m,
        icon: "error",
    });
}

const successTip = (success_m) => {
    Swal.fire({
        title: "Good job!",
        text: success_m,
        icon: "success"
    });
}

const getTokenMessage = (success_m, token) => {
    Swal.fire({
        title: "Good job!",
        text: success_m,
        html: `<div>Room Token ${token}</div>`,
        icon: "success",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
    });
}

const verifyToken =  () => {
    Swal.fire({
        title: "Enter Token to Join in Room",
        input: "text",
        inputAttributes: {
          autocapitalize: "off",
          required: 'true'
        },
        showCancelButton: true,
        confirmButtonText: "Look up",
        showLoaderOnConfirm: true,
        preConfirm: async (token_value) => {
            if (!token_value) errorTip('Enter a valid token')
            
            let isConnected = await window.electronAPI.setToken(token_value)
            if(isConnected) {
                mainApp.classList.add('main_app');
                enterApp.remove()
                successTip('Token is verified')
            }else{
                errorTip('Not able to connect')
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
}

joinToken.addEventListener('click', () =>{
    verifyToken()
});

getToken.addEventListener('click', async () => {
    let room_token = await window.electronAPI.getToken()

    if(room_token){
        mainApp.classList.add('main_app');
        enterApp.remove()
        getTokenMessage('Token has been created successfully', room_token)
    }else{
        errorTip('Not able to create token')
    }
})


//  in chat app
const sendMessage = document.getElementById('send_message')
const messageInput = document.getElementById('chat_send')
sendMessage.addEventListener('click', () => {
    const message = messageInput.value
    console.log('enter message', message)
    window.electronAPI.sendMessage(message)
    messageInput.value = '';
})

