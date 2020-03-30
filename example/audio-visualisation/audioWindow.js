'use strict';
const electronWallpaper = require('../../lib/electron-wallpaper');
// eslint-disable-next-line node/no-extraneous-require
const electron = require('electron');
const file = 'audio-visualisation/audio.html';
const name = 'audio window';

class AudioWindow {

  constructor({ messageElement, debug = false }) {
    this.audioWindow = undefined;
    this.messageElement = messageElement;
    this.debug = debug;
    window.addEventListener('beforeunload', () => this.detach());
  }

  attach(windowProperties = {}) {
    if (this.audioWindow) {
      return;
    }
    const defaultWindowProperties = {
      ...electron.remote.screen.getPrimaryDisplay().workAreaSize,
      x: 0,
      y: 0,
      webPreferences: { nodeIntegration: true }
    };

    try {
      if (this.debug) {
        this.audioWindow = new electron.remote.BrowserWindow({ ...defaultWindowProperties, ...windowProperties });
      } else {
        this.audioWindow = electronWallpaper.createWallpaperWindow({ ...defaultWindowProperties, ...windowProperties });
      }
      this.audioWindow.loadFile(file);
      this.setMessage(`Attached ${name}`);
    } catch (error) {
      this.setMessage(`Unable to attach ${name}: Error ` + error.message);
      console.error(error);
      if (this.audioWindow) {
        this.audioWindow.close();
        this.audioWindow = undefined;
      }
    }
  }

  detach() {
    if (this.audioWindow) {
      this.audioWindow.close();
      this.audioWindow = undefined;
      this.setMessage(`Detached ${name}`);
    } else {
      console.log('wont detach');
    }
  }

  setMessage(message) {
    this.messageElement.innerText = message;
  }
}

module.exports = AudioWindow;
