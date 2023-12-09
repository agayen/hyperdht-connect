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
    const message_data = {
        action_type: 'chat',
        message: messageInput.value
    }
    console.log('enter message', message_data)
    window.electronAPI.sendMessage(message_data)
    messageInput.value = '';
})


// in video call
let videoApp = document.getElementById('video_app')
let localStream = null;
let remoteStream = null;

const configuration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
};

async function openUserMedia(video_on) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: video_on});
        document.querySelector('#localVideo').srcObject = stream;
        localStream = stream;
        remoteStream = new MediaStream();
        document.querySelector('#remoteVideo').srcObject = remoteStream;
        videoApp.classList.add('video_app');
        console.log('Stream:', document.querySelector('#localVideo').srcObject);
    }catch(e){
        console.log(e)
    }
}

const startVideoAudioCall = async (video_on) => {
    await openUserMedia(video_on)
    // voiceCall.disabled = true
    // videoCall.disabled = true

    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();

    localStream?.getTracks()?.forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
}

const voiceCall = document.getElementById('voice_call')
const videoCall = document.getElementById('video_call')
videoCall.addEventListener('click', async ()=> {
    try{
        await startVideoAudioCall(true)
    }catch (e){
        console.error(e)
    }
})
voiceCall.addEventListener('click', async() => {
    await startVideoAudioCall(false)
})


function registerPeerConnectionListeners() {
    peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
          `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });
  
    peerConnection.addEventListener('connectionstatechange', () => {
      console.log(`Connection state change: ${peerConnection.connectionState}`);
    });
  
    peerConnection.addEventListener('signalingstatechange', () => {
      console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });
  
    peerConnection.addEventListener('iceconnectionstatechange ', () => {
      console.log(
          `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
}

  