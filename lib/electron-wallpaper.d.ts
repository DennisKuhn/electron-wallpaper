import {BrowserWindow, BrowserWindowConstructorOptions} from 'electron'
import BrowserWindowConstructorOptions = Electron.BrowserWindowConstructorOptions;

export type electronWallpaper = {
  attachWindow: (handler: Buffer) => undefined
  createWallpaperWindow: (options?: BrowserWindowConstructorOptions) => BrowserWindow;
};

declare module 'electron-wallpaper' {
  const defaultExport: electronWallpaper;
  export = defaultExport;
}
