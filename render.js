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

//  in chat app
const sendMessage = document.getElementById('send_message')
const messageInput = document.getElementById('chat_send')
const chatBody = document.getElementById('chat_body')

const sendMessageText = async () => {
    const message = messageInput.value
    if (message.trim().length === 0) return

    const message_data = {
        action_type: 'chat',
        message
    }

    const res = await window.electronAPI.sendMessage(message_data)
    if (res){
        const msgHTML  = `
        <div class="message">
            <div></div>
            <div class="right-message">${message_data?.message}</div>
        </div>`;
        if (chatBody) chatBody.insertAdjacentHTML('beforeend', msgHTML);
        messageInput.value = '';
    }else{
        errorTip('not able to send message')
    }
}
messageInput.addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
        sendMessageText()
    }
});



sendMessage.addEventListener('click', async () => {
    sendMessageText()
})

const addMessageInChatBody = (message_data) => {
    const msgHTML  = `
        <div class="message">
            <div class="left-message">${message_data?.message}</div>
            <div></div>
        </div>
        `;
    if (chatBody) chatBody.insertAdjacentHTML('beforeend', msgHTML);
}

// in video call
let localStream = null;
let remoteStream = null;
let peerConnection = null;

const videoApp = document.getElementById('video_app');
const voiceCall = document.getElementById('voice_call');
const videoCall = document.getElementById('video_call');
const end_call = document.getElementById('end_call');
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

const registerPeerConnectionListeners = () => {
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

videoCall.addEventListener('click', async ()=> {
    await startVideoAudioCall(true)
})
voiceCall.addEventListener('click', async() => {
    await startVideoAudioCall(false)
})
end_call.addEventListener('click', () => {
        hangUp()
    }
)

const openUserMedia = async (video_on) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: video_on});
        document.querySelector('#localVideo').srcObject = stream;
        localStream = stream;
        remoteStream = new MediaStream();
        document.querySelector('#remoteVideo').srcObject = remoteStream;
        videoApp.classList.add('video_app');
        console.log('Stream:', document.querySelector('#localVideo').srcObject);
        return localStream;
    }catch(e){
        console.log(e)
        return null;
    }
}

const passVideoToken = async (token_data, call_status) => {
    const video_call_data = {
        token_data,
        call_status,
        action_type: 'video',
    }
    const res = await window.electronAPI.passVideoToken(video_call_data)
    if(res){

    }
    else{
        console.error('not able to pass token');
        hangUp();
    }
}

const passWebrtcCred = async (token_data) => {
    const video_call_data = {
        token_data,
        action_type: 'webrtc_ice_cred',
    }
    const res = await window.electronAPI.passVideoToken(video_call_data)
    if(res){

    }
    else{
        console.error('not able to pass webrtc_ice_cred');
        hangUp();
    }
}

const startVideoAudioCall = async (video_on) => {
    let local_stream = await openUserMedia(video_on)
    voiceCall.disabled = true
    videoCall.disabled = true

    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();

    local_stream?.getTracks()?.forEach(track => {
        peerConnection.addTrack(track, local_stream);
    });

    // Code for collecting ICE candidates below
    peerConnection.addEventListener('icecandidate', event => {
        if (!event.candidate) {
        console.log('Got final candidate!');
        return;
        }
        console.log('Got candidate: need to save', event.candidate);
        passWebrtcCred(event.candidate.toJSON())
    });
    // Code for collecting ICE candidates above

    // offer need to send to peer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const roomWithOffer = {
        'offer': {
            type: offer.type,
            sdp: offer.sdp,
        },
    };

    if (video_on){
        roomWithOffer['call_type'] = 'video';
    }else{
        roomWithOffer['call_type'] = 'audio';
    }

    await passVideoToken(roomWithOffer, 'incoming')

    peerConnection.addEventListener('track', event => {
        console.log('Got remote track:', event.streams[0]);
        event.streams[0].getTracks().forEach(track => {
          console.log('Add a track to the remoteStream:', track);
          remoteStream.addTrack(track);
        });
    });
}

const iceTokenCredUpdate = async(data) => {
    if (peerConnection && data?.token_data){
        await peerConnection.addIceCandidate(new RTCIceCandidate(data?.token_data));
    }
}

const hangUp = async(from_peer = false) => {
    const tracks = document.querySelector('#localVideo')?.srcObject?.getTracks();
    tracks?.forEach(track => {
      track.stop();
    });

    if(localStream){
        localStream?.getTracks().forEach(track => track.stop());
    }
  
    if (remoteStream) {
      remoteStream?.getTracks().forEach(track => track.stop());
    }
  
    if (peerConnection) {
      peerConnection.close();
    }
        
  
    document.querySelector('#localVideo').srcObject = null;
    document.querySelector('#remoteVideo').srcObject = null;
    voiceCall.disabled = false
    videoCall.disabled = false
    videoApp.classList.remove('video_app');

    if (!from_peer) await passVideoToken({}, 'ended')
}

const joinMeeting = async (offer_data) =>{
    const call_type = offer_data?.call_type
    const offer_token = offer_data?.offer
    let local_stream = null;

    if (call_type === 'video'){
        local_stream = await openUserMedia(true)
    }else{
        local_stream = await openUserMedia(false)
    }

    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();
    local_stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, local_stream);
    });

    // Code for collecting ICE candidates below
    peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate: need to save', event.candidate);
      passWebrtcCred(event.candidate.toJSON())
    });
    // Code for collecting ICE candidates above

    peerConnection.addEventListener('track', event => {
        console.log('Got remote track:', event.streams[0]);
        event.streams[0].getTracks().forEach(track => {
          console.log('Add a track to the remoteStream:', track);
          remoteStream.addTrack(track);
        });
    });

    // Code for creating SDP answer below
    console.log('Got offer:', offer_token);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer_token));
    const answer = await peerConnection.createAnswer();
    console.log('Created answer:', answer);
    await peerConnection.setLocalDescription(answer);

    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    };
    await passVideoToken(roomWithAnswer, 'answered');
}

const handsack = async(answer) => {
    console.log('Got remote description: ', answer);
    const rtcSessionDescription = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(rtcSessionDescription);
}

const addVideoCallActivity = (message_data) => {
    const token_data = message_data?.token_data
    const call_status = message_data?.call_status

    if(token_data && call_status){
        switch (call_status){
            case 'incoming':
                joinMeeting(token_data)
                break;
            case 'answered':
                handsack(token_data?.answer)
                break;
            case 'ended':
                hangUp(true)
                break;
            default:
                console.error('call_status does not exit')
        }
    }
}

// get socket data 
const socketDataCallBackFun = (message_data) => {
    console.log('socketDataCallBack' , message_data)

    switch (message_data?.action_type){
        case 'chat':
            addMessageInChatBody(message_data)
            break;
        case 'video':
            addVideoCallActivity(message_data)
            break;
        case 'webrtc_ice_cred':
            iceTokenCredUpdate(message_data)
            break;
        default:
            console.error("Invalid action type");
    }
    
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
            
            let isConnected = await window.electronAPI.setToken({token_value, cb_fn: socketDataCallBackFun})
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
    let room_token = await window.electronAPI.getToken({cb_fn: socketDataCallBackFun})

    if(room_token){
        mainApp.classList.add('main_app');
        enterApp.remove()
        getTokenMessage('Token has been created successfully', room_token)
    }else{
        errorTip('Not able to create token')
    }
})