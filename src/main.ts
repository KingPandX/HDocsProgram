import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Load the template file
async function loadTemplateFile() {
  const filePath = '/home/ghost/Documents/js/my-app/Templates.json';
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(data).Templates;
  } catch (error) {
    console.error('Error reading file:', error);
    return [];
  }
}

// Save the template file
async function saveTemplateFile(templates : Template[]) {
  const filePath = '/home/ghost/Documents/js/my-app/Templates.json';
  try {
    await fs.promises.writeFile(filePath, JSON.stringify({ Templates: templates }, null, 2));
  }
  catch (error) {
    console.error('Error writing file:', error);
  }
}

// Handle ipc events

ipcMain.handle('load-templates', async () => {
  return await loadTemplateFile();
})

ipcMain.handle('save-template', async (event, template: Template[]) => {
  await saveTemplateFile(template);
})