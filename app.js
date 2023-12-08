
let  DHT = require('hyperdht');
let goodbye = require('graceful-goodbye')
let b4a = require('b4a')


class HyperdhtClient {
    constructor() {
        this.socket = {};
    }

    get_token  = async () => {
        const dht = new DHT()
        // This keypair is your peer identifier in the DHT
        const keyPair = DHT.keyPair()
    
        const server = dht.createServer(conn => {
            console.log('got connection!')
            this.socket = conn
            this.server_socket()
        })
    
        await server.listen(keyPair)
        let server_token = b4a.toString(keyPair.publicKey, 'hex')

        const element = document.getElementById('token')
        if (element) element.innerText = `Server : ${server_token}`;

        console.log('listening on:', server_token)
        goodbye(() => server.close())

        return server_token
    }

    set_token  = async (token) => {
        const publicKey = b4a.from(token,'hex')
        const dht = new DHT()
        try{
            this.socket = await dht.connect(publicKey)

            const element = document.getElementById('token')
            if (element) element.innerText = `Clent : ${token}`;

            this.client_socket()
            return true
        }catch (err) {
            console.error(err)
            return false
        }
    };

    server_socket = () => {
        // this.socket.write('hello world!')
        this.socket.on('data', (data) => {
            // this.socket.write(Buffer.from(data.toString()))
            const msgHTML  = `
            <div class="message">
                <div class="left-message">${data}</div>
                <div></div>
            </div>`;
            const chat_body_el = document.getElementById('chat_body')
            if (chat_body_el) chat_body_el.insertAdjacentHTML('beforeend', msgHTML);

            console.log('comming data -> ',data.toString());
        });
    }

    client_socket = () => {
        // this.socket.write('hello world!')
        this.socket.on('data', (data) => {
            // this.socket.write(Buffer.from(data.toString()))
            const msgHTML  = `
            <div class="message">
                <div class="left-message">${data}</div>
                <div></div>
            </div>
            `;
            const chat_body_el = document.getElementById('chat_body')
            if (chat_body_el) chat_body_el.insertAdjacentHTML('beforeend', msgHTML);

            console.log('comming data -> ',data.toString());
        });

        this.socket.once('open', () => console.log('got connection!'))
    
        this.socket.on('error', function (err) {
            console.log('Client errored:', err)
        })
    
        this.socket.on('close', function () {
            console.log('Client closed...')
        })
    
        this.socket.on('end', function () {
            console.log('Client ended...')
            conn.end()
        })
    }

    send_message = (data) => {
        this.socket.write(Buffer.from(data.toString()))
        const msgHTML  = `
        <div class="message">
            <div></div>
            <div class="right-message">${data}</div>
        </div>`;
        const chat_body_el = document.getElementById('chat_body')
        if (chat_body_el) chat_body_el.insertAdjacentHTML('beforeend', msgHTML);
    }
}

module.exports ={
    HyperdhtClient
}



     
