import {app, BrowserWindow, ipcMain, screen} from 'electron';
import {attachWindowToDisplay, init} from 'node-win-wallpaper';
import path = require('path');
import Display = Electron.Display;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

interface BrowserList {
    [key: number]: BrowserWindow;
}

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static ipc = ipcMain;
    static browsers: BrowserList = {};
    static BrowserWindow: typeof BrowserWindow;

    private static onWindowAllClosed(): void {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose(): void {
        // Dereference the window object.
        Object.entries(Main.browsers).forEach(([browserId, browser]) => {
            browser.close();
            Reflect.deleteProperty(Main.browsers, browserId);
        });
        Main.mainWindow = null;
    }

    private static onReady(): void {
        Main.setupDisplays();
        Main.createMainWindow();
        init();

    }

    /**
     * Called by loadFile, ready-to-show sets initial bounds, calls show to trigger attaching to the desktop and adding to browsers
     *  */
    static createBrowser(display: Display): BrowserWindow {
        console.log(app.getAppPath());
        const windowProperties = {
            webPreferences: {
                nodeIntegration: true
            },
            show: false,
            transparent: true,
            frame: false,
            x: display.workArea.x,
            y: display.workArea.y,
            width: display.workArea.width,
            height: display.workArea.height
        };

        const browser = new BrowserWindow(windowProperties);

        // Called after file loaded
        browser.once('ready-to-show', () => {
            console.log(`${display.id}: once ready-to-show`);
            browser.setBounds(display.workArea);

            // call here so on-move and on-show are emitted
            browser.show();
        });
        browser.once('show', () => {
            console.log(`${display.id}: Once show`);
            try {
                browser.webContents.openDevTools();
                attachWindowToDisplay(display.id, browser);
                Main.browsers[display.id] = browser;
            } catch (error) {
                console.error(error);
                browser.close();
            }
        });
        browser.on('move', () => {
            console.log(`${display.id}: On move`);
        });

        return browser;
    }

    /**
     * creates an IPC channel for each display and connects loadFile
     */
    static setupDisplays(): void {
        // Screen is available when electron.app.whenReady is emitted
        screen.getAllDisplays().forEach((display) => {
                Main.ipc.on(`${display.id}-file`, (e, file) => {
                    console.log('Logs it')
                    Main.loadFile(display, file);
                });
            }
        );
    }


    static loadFile(display: Display, file: string): void {
        let browser;

        if (display.id in Main.browsers) {
            browser = Main.browsers[display.id];
        } else {
            browser = Main.createBrowser(display);
        }
        if (browser) {
            browser.loadFile(file)
                .then(() => {
                    console.log(`${display.id}: loaded: ${file}`);
                })
                .catch((reason) => {
                    console.error(`${display.id}: Failed loading: ${reason}, file: ${file}`);
                });
        }
    }

    static createMainWindow(): void {
        Main.mainWindow = new Main.BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js')
            },
            width: 800,
            height: 600,
        });

        Main.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
        // Main.mainWindow.loadFile(MAIN_WINDOW_WEBPACK_ENTRY);
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
