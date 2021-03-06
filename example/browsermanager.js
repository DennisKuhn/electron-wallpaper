const {
  app, ipcMain, BrowserWindow, screen
} = require('electron');

const electronWallpaper = require('..');

/**
 * @summary Creates and manages the mainwindow and all display windows
 */
class BrowserManager {

  ipc = ipcMain;
  browsers = {};

  /** @type {Electron.BrowserWindow} */
  mainWindow;

  /** @summary Hooks to electron.app events */
  constructor() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.whenReady()
      .then(() => {
        this.start();
      })
      .catch((reason) => {
        console.log(`Error starting: ${reason}`, reason);
      });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.mainWindow === null) {
        this.createMainWindow();
      }
    });
  }

  /** triggered by app.whenReady to start electronWallpaper, setupDisplays and createMainWindow */
  start() {
    electronWallpaper.init();
    this.setupDisplays();
    this.createMainWindow();
  }

  /**
   * Called by loadFile, ready-to-show sets initial bounds, calls show to trigger attaching to the desktop and adding to browsers
   * @param {Electron.Display} display used for positioning
   * @returns {Electron.BrowserWindow}
   *  */
  createBrowser(display) {
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
        browser.webContents.openDevTools({
          mode: 'detach',
          activate: false
        });
        electronWallpaper.attachWindowToDisplay(display.id, browser);
        this.browsers[display.id] = browser;
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
  setupDisplays() {
    // Screen is available when electron.app.whenReady is emited
    screen.getAllDisplays().forEach(
      (display) => {
        this.ipc.on(`${display.id}-file`, (e, file) => {
          this.loadFile(display, file);
        });
      }
    );
  }

  /**
   * Connected by setupDisplays, called be ScreenManager. Maybe createBrowser(display), defintely browser[display.id].loadFile
   * @param {Electron.Display} display display to load file for
   * @param {string} file path to load
   */
  loadFile(display, file) {
    /** @type {Electron.BrowserWindow} */
    let browser;

    if (display.id in this.browsers) {
      browser = this.browsers[display.id];
    } else {
      browser = this.createBrowser(display);
    }
    if (browser) {
      browser.loadFile(file)
        .then(
          console.log(`${display.id}: loaded: ${file}`)
        )
        .catch(
          (reason) => {
            console.error(`${display.id}: Failed loading: ${reason}, file: ${file}`);
          }
        );
    }
  }

  /**
   * @summary Loads screenmanager.html and connets on-closed to close displays browsers
   */
  createMainWindow() {

    const windowProperties = {
      webPreferences: {
        nodeIntegration: true
      },
      width: 800,
      height: 600
    };

    this.mainWindow = new BrowserWindow(windowProperties);
    this.mainWindow.loadFile('screenmanager.html');

    this.mainWindow.on('closed', () => {
      Object.entries(this.browsers).forEach(([ browserId, browser ]) => {
        browser.close();
        Reflect.deleteProperty(this.browsers, browserId);
      });
      this.mainWindow = null;
    });
  }
}

const browserManager = new BrowserManager();

module.exports = browserManager;
