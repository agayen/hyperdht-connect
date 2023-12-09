const { contextBridge, ipcRenderer } = require('electron/renderer')
let {HyperdhtClient} = require('./app.js');

let hyperdht_client = new HyperdhtClient();

window.addEventListener('DOMContentLoaded', () => {
    
})


contextBridge.exposeInMainWorld('electronAPI', {
    getToken:  async () => {
        let data = await hyperdht_client.get_token()
        return data
    },
    setToken: async (token, error_message) => {
        let data = await hyperdht_client.set_token(token, error_message)
        return data
    },
    sendMessage: async (message_data) => {
        await hyperdht_client.send_message(message_data)
    }
})