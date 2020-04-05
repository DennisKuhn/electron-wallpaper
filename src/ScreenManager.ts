import {remote} from 'electron';
import DisplayView from './DisplayView';
import Display = Electron.Display;

/**
 * Creates a DisplayView for each display in screen.getAllDisplays
 */
class ScreenManager {


    displays: Display[] = [];
    views: DisplayView[] = [];
    screensWrapper = document.querySelector('[id = displayswrapper]');

    /** */
    constructor() {
        console.log(`${this.constructor.name}`);
        this.displays = remote.screen.getAllDisplays();

        this.displays.forEach(
            (display) => {
                this.views.push(new DisplayView(display, this.screensWrapper));
            }
        );
    }
}

export default new ScreenManager();
