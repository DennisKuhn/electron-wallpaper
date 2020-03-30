/*
 * Copyright 2018 Robin Andersson <me@robinwassen.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const bindings = require('bindings');

const electron = require('electron');
const electronWallpaperNative = bindings('electron-wallpaper');
const os = require('os');

/**
 *
 * @type {electronWallpaper}
 */
const defaultExport = {
  ...electronWallpaperNative,
  createWallpaperWindow: function(options) {
    const window = new electron.remote.BrowserWindow({
      ...options,
      type: 'desktop',
      frame: false
    });
    if (os.platform() === 'win32') {
      electronWallpaperNative.attachWindow(window.getNativeWindowHandle());
    }
    window.once('focus', (e) => {
      e.sender.blur(); //Blur the window to send it behind the desktop icons in X11
    });
    return window;
  }
};
module.exports = defaultExport;
