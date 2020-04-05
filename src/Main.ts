import {BrowserWindow} from 'electron';
import path = require('path');

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow: typeof BrowserWindow;

    private static onWindowAllClosed(): void {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose(): void {
        // Dereference the window object.
        Main.mainWindow = null;
    }

    private static onReady(): void {
        Main.mainWindow = new Main.BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        });

        Main.mainWindow.loadFile(path.join(__dirname, '../index.html'));
        Main.mainWindow.on('closed', Main.onClose);

        // Open the DevTools.
        Main.mainWindow.webContents.openDevTools();
    }

    static run(app: Electron.App, browserWindow: typeof BrowserWindow): void {
        // we pass the Electron.App object and the
        // Electron.BrowserWindow into this function
        // so this class has no dependencies. This
        // makes the code easier to write tests for
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        app.whenReady().then(Main.onReady);

    }
}
