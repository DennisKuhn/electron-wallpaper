import {ipcRenderer, remote} from 'electron';
import {createHash} from 'crypto';
import createAndAppend from './utils';
import Display = Electron.Display;
import OpenDialogReturnValue = Electron.OpenDialogReturnValue;

/**
 * Views information about one Display/Monitor
 */
export default class DisplayView {

    display: Display;

    ipc = ipcRenderer;

    /** @type {HTMLDivElement} */
    container: HTMLDivElement;

    /** @type {HTMLElement} */
    fileDisplay: HTMLElement;

    /** @type {string} */
    fileStorageKey: string;

    /** @type {string} */
    file: string;

    configStorageKey: string;

    /**
     *
     * @param {Electron.Display} display to view information about and user settings editor
     * @param {Element} parent element to attach view to
     */
    constructor(display: Display, parent: Element) {
        console.log(`${this.constructor.name}(${display.id})`);

        this.display = display;
        this.fileStorageKey = `${this.display.id}-file`;
        this.file = window.localStorage.getItem(this.fileStorageKey);

        this.container = createAndAppend('div', {
            parent: parent,
            className: 'display'
        }) as HTMLDivElement;

        const topRow = createAndAppend('div', {
            parent: this.container,
            className: 'row'
        });

        createAndAppend('h2', {
            parent: topRow,
            className: 'title',
            text: this.display.id.toString()
        });

        createAndAppend('span', {
            parent: topRow,
            className: 'size',
            text: `${this.display.workAreaSize.width} * ${this.display.workAreaSize.height} @ ${this.display.workArea.x}, ${this.display.workArea.y}`
        });

        const fileRow = createAndAppend('div', {
            parent: this.container,
            className: 'row'
        });

        createAndAppend('button', {
            parent: fileRow,
            className: 'button',
            text: 'Choose file'
        }).onclick = (): void => {
            this.openFile();
        };

        this.fileDisplay = createAndAppend('span', {
            parent: fileRow,
            className: 'displayfile',
            text: this.file
        });
        this.fileDisplay.title = this.file;
        if (this.file) {
            this.configStorageKey = `${this.display.id}-${createHash('md5').update(this.file).digest('hex')}-config`;
            this.ipc.send(this.fileStorageKey, this.file);
        }
    }

    /**
     * Calls setFile if showDialog wasn't canceled
     */
    openFile(): void {
        this.showDialog()
            .then((result) => {
                console.log(`${this.constructor.name}(${this.display.id}) Dialog: canceled=${result.canceled}`);
                if (result.canceled) {
                    console.log(`${this.constructor.name}(${this.display.id}) Dialog: canceled=${result.canceled}`);
                } else {
                    console.log(`${this.constructor.name}(${this.display.id}) Dialog: file=${result.filePaths[0]}`);
                    this.setFile(result.filePaths[0]);
                }
            })
            .catch((err) => {
                console.error(`Error showing Open File Dialog: ${err}`, err);
            });
    }

    /**
     * to open a file, e.g. web pages, images, movies or any file. Defaults to this.file or "My Documents"
     * @returns {Promise<Electron.OpenDialogReturnValue>}
     */
    showDialog(): Promise<OpenDialogReturnValue> {
        return remote.dialog.showOpenDialog({
            properties: ['openFile'],
            defaultPath: this.file ? this.file : remote.app.getPath('documents'),
            filters: [
                {
                    name: 'Web pages',
                    extensions: ['html', 'htm']
                },
                {
                    name: 'Images',
                    extensions: ['jpg', 'png', 'gif']
                },
                {
                    name: 'Movies',
                    extensions: ['mkv', 'avi', 'mp4']
                },
                {
                    name: 'All Files',
                    extensions: ['*']
                }
            ]
        });
    }

    setFile(file: string): void {
        this.file = file;
        this.fileDisplay.textContent = this.file;
        window.localStorage.setItem(this.fileStorageKey, this.file);
        this.ipc.send(this.fileStorageKey, this.file);
    }
}
