// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'

let Templates: Template[] = [];


const BridgeAPI = () => {
    contextBridge.exposeInMainWorld('API', {
        Templates,
        saveTemplateFile : (templates: Template[]) => saveTemplateFile(templates)
    });
}

const load = async () =>{
    const result = await ipcRenderer.invoke('load-templates')
    Templates = result;
    console.log(Templates)
    BridgeAPI()
}

function saveTemplateFile(templates: Template[]) {
    ipcRenderer.invoke('save-template', templates)
    BridgeAPI()
}

load()
