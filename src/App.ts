import {app, BrowserWindow} from 'electron';
// import Main from './Main';
import Main from './BrowserManager';

app.allowRendererProcessReuse = true;
Main.run(app, BrowserWindow);
