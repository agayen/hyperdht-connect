const { contextBridge, ipcRenderer } = require('electron/renderer')
let {HyperdhtClient} = require('./app.js');

let hyperdht_client = new HyperdhtClient();

window.addEventListener('DOMContentLoaded', () => {
    
})

contextBridge.exposeInMainWorld('electronAPI', {
    getToken:  async (payload) => {
        let data = await hyperdht_client.get_token(payload)
        return data
    },
    setToken: async (payload) => {
        let data = await hyperdht_client.set_token(payload)
        return data
    },
    sendMessage: async (message_data) => {
        let data = await hyperdht_client.send_message(message_data)
        return data
    },
    passVideoToken: async (payload) => {
        let data = await hyperdht_client.pass_video_token(payload)
        return data
    },
})