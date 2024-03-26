import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as log from 'electron-log';
import * as fs from 'fs';
import { rootPath } from 'electron-root-path';

const args = process.argv.slice(1);
const serve = args.some(function (val) {
  return val === '--serve';
});
let connfilepath = serve ? path.join(rootPath, '/conndata.txt') : path.join(rootPath, '../../../conndata.txt');


log.transports.file.resolvePathFn = () =>
  serve ? path.join(rootPath, 'logs/main.log') : path.join(rootPath, '../../../logs/main.log');
log.info('application version:', app.getVersion());
log.info('connfilepath>>>>>>>>>', connfilepath)

export let win: any;

function createWindow() {
  win = new BrowserWindow({
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

  const ses = win.webContents.session;
  ses.clearCache();

  if (serve) {
    win.loadURL('http://localhost:4201');
    win.setIcon(path.join(__dirname, '../src/assets/images/logo/appicon.png'));
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
    win.setIcon(path.join(__dirname, '../dist/assets/images/logo/appicon.png'));
  }


  // The following is optional and will open the DevTools:
  // if (serve)
  win.webContents.openDevTools();

  // Hide menubar
  if (!serve)
    win.removeMenu();


  win.on('close', () => {
    win.webContents.executeJavaScript('localStorage.removeItem("cyonmap");', true);
    win.webContents.executeJavaScript('localStorage.removeItem("isConn");', true);
    win.webContents.executeJavaScript('localStorage.getItem("uasteard");', true)
      .then((result) => {
        let user = JSON.parse(atob(result));
        if (!user.rememberMe)
          win.webContents.executeJavaScript('localStorage.clear();', true);
      });
    win = null;
  });

  win.once('ready-to-show', () => {
    win.show();
  });
  win.maximize();
}

app.on('ready', () => {
  createWindow()
});

ipcMain.on('open-url', async (event, url) => {
  event.preventDefault();
  shell.openExternal(url);
});

ipcMain.on('printAlert', async (event, params) => {
  dialog.showMessageBox(win, {
    type: 'question',
    message: 'Do you wants to print invoice?',
    // detail: 'You are about to delete this record !',
    title: 'Print Alert',
    buttons: ['Yes', 'No'],
  }).then((response: any) => {
    return new Promise<any>(async (resolve, reject) => {
      if (response.response == 0) {
        event.returnValue = { data: 'Yes' };
        resolve(true);
      } else {
        event.returnValue = { data: 'No' };
        reject(false);
      }
    });
  });
});


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

ipcMain.on('print', async (event, params) => {
  let list = await win.webContents.getPrintersAsync();

  log.info('list', list);
  let options: any = {
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

  let PrintScreen = new BrowserWindow({
    show: false,
    //width: widthdata,
    //height: heightdata,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // serve ? path.join('D:/development/QuicksumERP', 'logs/main.log') : path.join(rootPath, '../../../logs/main.log');
  const filePath = serve ? path.join(rootPath, './src/print/print.html') : path.join(rootPath, '../../../print.html');
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
  fs.writeFile(
    filePath,
    `
  <html><head>
  <script src="../assets/js/invoice.js"></script>
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="../assets/css/app.min.css">
  <link rel="stylesheet" href="../assets/css/icons.min.css">
  <link rel="stylesheet" href="../assets/css/invoice.css">
  </head><body>${params}
  </body>
  </html>`,
    (error) => {
      log.info(error);
    }
  );

  PrintScreen.loadURL(`file://${filePath}`);

  PrintScreen.webContents.on('did-finish-load', () => {
    PrintScreen.webContents.print(options, (success, failureReason) => {
      if (!success) log.error(failureReason);
      else log.info('Printed');
    });
  });
});
