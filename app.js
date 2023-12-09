
let  DHT = require('hyperdht');
let goodbye = require('graceful-goodbye')
let b4a = require('b4a')


class HyperdhtClient {
    constructor() {
        this.socket = {};
    }

    get_token  = async ({cb_fn}) => {
        const dht = new DHT()
        // This keypair is your peer identifier in the DHT
        const keyPair = DHT.keyPair()
    
        const server = dht.createServer(conn => {
            // console.log('got connection!')
            this.socket = conn
            this.server_socket({cb_fn})
        })
    
        await server.listen(keyPair)
        let server_token = b4a.toString(keyPair.publicKey, 'hex')

        const element = document.getElementById('token')
        if (element) element.innerText = `Server : ${server_token}`;

        // console.log('listening on:', server_token)
        goodbye(() => server.close())

        return server_token
    }

    set_token  = async ({token_value, cb_fn}) => {
        const publicKey = b4a.from(token_value,'hex')
        const dht = new DHT()
        try{
            this.socket = await dht.connect(publicKey)

            const element = document.getElementById('token')
            if (element) element.innerText = `Clent : ${token_value}`;

            this.client_socket({cb_fn})
            return true
        }catch (err) {
            console.error(err)
            return false
        }
    };

    server_socket = ({cb_fn}) => {
        this.socket.on('data', (data) => {
            const message_data = JSON.parse(data);
            cb_fn(message_data);
        });
    }

    client_socket = ({cb_fn}) => {
        this.socket.on('data', (data) => {
            const message_data = JSON.parse(data);
            cb_fn(message_data);
            console.log('comming data -> ',data.toString());
        });

        this.socket.once('open', () => console.log('got connection!'))
    
        this.socket.on('error', function (err) {
            console.error('Client errored:', err)
        })
    
        this.socket.on('close', function () {
            console.error('Client closed...')
        })
    
        this.socket.on('end', function () {
            console.error('Client ended...')
            conn.end()
        })
    }

    send_message = (data) => {
        try{
            this.socket.write(Buffer.from(JSON.stringify(data)))
            return true
        }catch(e){
            console.error('not able to send message ->', e)
            return false
        }
    }

    pass_video_token = (data) => {
        try{
            this.socket.write(Buffer.from(JSON.stringify(data)))
            return true
        }catch(e){
            console.error('not able to video call token ->', e)
            return false
        }
    }
}

module.exports ={
    HyperdhtClient
}



     
