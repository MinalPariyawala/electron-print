"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.win = void 0;
const electron_1 = require("electron");
const path = require("path");
const url = require("url");
const log = require("electron-log");
const fs = require("fs");
const electron_root_path_1 = require("electron-root-path");
const args = process.argv.slice(1);
const serve = args.some(function (val) {
    return val === '--serve';
});
let connfilepath = serve ? path.join(electron_root_path_1.rootPath, '/conndata.txt') : path.join(electron_root_path_1.rootPath, '../../../conndata.txt');
log.transports.file.resolvePathFn = () => serve ? path.join(electron_root_path_1.rootPath, 'logs/main.log') : path.join(electron_root_path_1.rootPath, '../../../logs/main.log');
log.info('application version:', electron_1.app.getVersion());
log.info('connfilepath>>>>>>>>>', connfilepath);
function createWindow() {
    exports.win = new electron_1.BrowserWindow({
        minHeight: 850,
        minWidth: 850,
        show: false,
        icon: __dirname + '../dist/assets/images/logo/appicon.png',
        webPreferences: {
            nodeIntegration: true,
            webSecurity: true,
            contextIsolation: false,
        },
    });
    const ses = exports.win.webContents.session;
    ses.clearCache();
    if (serve) {
        exports.win.loadURL('http://localhost:4201');
        exports.win.setIcon(path.join(__dirname, '../src/assets/images/logo/appicon.png'));
    }
    else {
        exports.win.loadURL(url.format({
            pathname: path.join(__dirname, '../dist/index.html'),
            protocol: 'file:',
            slashes: true,
        }));
        exports.win.setIcon(path.join(__dirname, '../dist/assets/images/logo/appicon.png'));
    }
    // The following is optional and will open the DevTools:
    // if (serve)
    exports.win.webContents.openDevTools();
    // Hide menubar
    if (!serve)
        exports.win.removeMenu();
    exports.win.on('close', () => {
        exports.win.webContents.executeJavaScript('localStorage.removeItem("cyonmap");', true);
        exports.win.webContents.executeJavaScript('localStorage.removeItem("isConn");', true);
        exports.win.webContents.executeJavaScript('localStorage.getItem("uasteard");', true)
            .then((result) => {
            let user = JSON.parse(atob(result));
            if (!user.rememberMe)
                exports.win.webContents.executeJavaScript('localStorage.clear();', true);
        });
        exports.win = null;
    });
    exports.win.once('ready-to-show', () => {
        exports.win.show();
    });
    exports.win.maximize();
}
electron_1.app.on('ready', () => {
    createWindow();
});
electron_1.ipcMain.on('open-url', (event, url) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    electron_1.shell.openExternal(url);
}));
electron_1.ipcMain.on('printAlert', (event, params) => __awaiter(void 0, void 0, void 0, function* () {
    electron_1.dialog.showMessageBox(exports.win, {
        type: 'question',
        message: 'Do you wants to print invoice?',
        // detail: 'You are about to delete this record !',
        title: 'Print Alert',
        buttons: ['Yes', 'No'],
    }).then((response) => {
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            if (response.response == 0) {
                event.returnValue = { data: 'Yes' };
                resolve(true);
            }
            else {
                event.returnValue = { data: 'No' };
                reject(false);
            }
        }));
    });
}));
// ipcMain.on('print', async (event, params) => {
//   let list = await win.webContents.getPrintersAsync();
//   log.info('name----------', list)
//   let options = {
//     silent: true,
//     printBackground: true,
//     deviceName: 'HP504F76 (HP Smart Tank 510 series)',
//     dpi: { horizontal: 600, vertical: 600 },
//     margin: { marginType: 'none' },
//     landscape: false,
//   };
//   let PrintScreen = new BrowserWindow({
//     show: false,
//     resizable: false,
//     webPreferences: {
//       nodeIntegration: true,
//     },
//   });
//   // const filePath = path.join(rootPath, 'print.html');
//   // log.info('file', `${filePath}`)
//   const filePath = url.format({
//     pathname: path.join(__dirname, '../print.html'),
//     protocol: 'file:',
//     slashes: true,
//   });
//   log.info('file----------', filePath)
//   PrintScreen.loadURL(filePath);
//   PrintScreen.webContents.on('did-finish-load', () => {
//     log.info('PrintScreen===========', PrintScreen.webContents)
//     PrintScreen.webContents.print(options, (success, failureReason) => {
//       if (!success) log.error('error-----', failureReason);
//       log.info('Printed');
//     });
//   });
// });
electron_1.ipcMain.on('print', (event, params) => __awaiter(void 0, void 0, void 0, function* () {
    let list = yield exports.win.webContents.getPrintersAsync();
    log.info('list', list);
    let options = {
        silent: true,
        printBackground: false,
        pageSize: 'A4',
        deviceName: 'Microsoft Print to PDF',
        // deviceName: 'HP504F76 (HP Smart Tank 510 series)',
        margin: {
            marginType: 'printableArea',
        },
        dpi: { horizontal: 600, vertical: 600 },
    };
    let PrintScreen = new electron_1.BrowserWindow({
        show: false,
        //width: widthdata,
        //height: heightdata,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    // serve ? path.join('D:/development/QuicksumERP', 'logs/main.log') : path.join(rootPath, '../../../logs/main.log');
    const filePath = serve ? path.join(electron_root_path_1.rootPath, './src/print/print.html') : path.join(electron_root_path_1.rootPath, '../../../print.html');
    log.info('filePath :>> ', filePath);
    log.info('filePath :>> ', path.join(__dirname, '../dist/assets/bootstrap.min.css'));
    // log.info('static path :>> ', win.loadURL('file:///path/to/app.asar/static/index.html'));
    // path.join(__dirname, '../dist/assets/assets/css/bootstrap.min.css')
    // let bootstrapCSS = fs.readFileSync('/path/to/app.asar/bootstrap.min.css');
    // let appCSS = fs.readFileSync('/path/to/app.asar/app.min.css');
    // let iconsCSS = fs.readFileSync('/path/to/app.asar/icons.min.css');
    // let invoiceCSS = fs.readFileSync('/path/to/app.asar/invoice.css');
    // let invoiceJS = fs.readFileSync('/path/to/app.asar/invoice.js');
    let bootstrapCSS = path.join(__dirname, '../dist/assets/css/bootstrap.min.css');
    let appCSS = path.join(__dirname, '../dist/assets/css/app.min.css');
    let iconsCSS = path.join(__dirname, '../dist/assets/css/icons.min.css');
    let invoiceCSS = path.join(__dirname, '../dist/assets/css/invoice.css');
    let invoiceJS = path.join(__dirname, '../dist/assets/js/invoice.js');
    // Print Form HTML
    // fs.writeFile(
    //   filePath,
    //   `
    // <html><head>
    // <script src="${invoiceJS}"></script>
    // <link rel="stylesheet" href="${bootstrapCSS}">
    // <link rel="stylesheet" href="${appCSS}">
    // <link rel="stylesheet" href="${iconsCSS}">
    // <link rel="stylesheet" href="${invoiceCSS}">
    // </head><body>${params}
    // </body>
    // </html>`,
    //   (error) => {
    //     log.info(error);
    //   }
    // );
    fs.writeFile(filePath, `
  <html><head>
  <script src="../assets/js/invoice.js"></script>
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="../assets/css/app.min.css">
  <link rel="stylesheet" href="../assets/css/icons.min.css">
  <link rel="stylesheet" href="../assets/css/invoice.css">
  </head><body>${params}
  </body>
  </html>`, (error) => {
        log.info(error);
    });
    PrintScreen.loadURL(`file://${filePath}`);
    PrintScreen.webContents.on('did-finish-load', () => {
        PrintScreen.webContents.print(options, (success, failureReason) => {
            if (!success)
                log.error(failureReason);
            else
                log.info('Printed');
        });
    });
}));
//# sourceMappingURL=main.js.map