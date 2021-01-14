const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const {ipcMain, dialog, shell} = require('electron')
const appRoot = require('electron-root-path').rootPath;
const ProgressBar = require('electron-progressbar');
const isDev = require('electron-is-dev');
let tools = require('./assets/shared_tools');
let ws;
let mainWindow = null;

function connect() {
  try{
    const WebSocket = require('ws');
    ws = new WebSocket('ws://127.0.0.1:6849');
  }catch(e){
    console.log('Socket init error. Reconnect will be attempted in 1 second.', e.reason);
  }

  ws.on('open', ()=> {
    console.log('websocket in main connected')
      init_server();
  });

  ws.on('ping',()=>{
    
    ws.send(tools.parseCmd('pong','from main'));
  })

  ws.on('message',(message)=>{
    try{
      msg = tools.parseServerMessage(message);
      // console.log(msg)
      let cmd = msg.cmd;
      let data = msg.data;
      switch(cmd) {
        case 'ping':
          ws.send(tools.parseCmd('pong',data));
          break;
        case 'reply_init_ok':
            createWindow();
            break;
        case 'reply_getStock':
            mainWindow.webContents.send('update-query-stock',data)
            break;
        case 'reply_closed_all':
          app.quit();
          break;
        default:
          console.log('Not found this cmd ' + cmd)
          break;
      }
    }catch(e){
      console.error(e)
    }
  });

  ws.onclose = function(e) {
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(function() {
      connect();
    }, 5000);
  };

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
  };
}

connect()

/*************************************************************
 * py process
 *************************************************************/

const PY_DIST_FOLDER = 'pyserver_dist'
const PY_FOLDER = 'public/server'
const PY_MODULE = 'api' // without .py suffix
let PY_INIT_OK = false;

let pyProc = null
let pyPort = null

//
const guessPackaged = () => {
  const fullPath = path.join(appRoot, PY_DIST_FOLDER)
  console.log('full server Path:')
  console.log(fullPath);
  console.log('does server existed:')
  console.log(require('fs').existsSync(fullPath))
  return require('fs').existsSync(fullPath)
}

const getScriptPath = () => {
  if (!guessPackaged()) {
    return path.join(appRoot, PY_FOLDER, PY_MODULE + '.py')
  }
  if (process.platform === 'win32') {
    return path.join(appRoot, PY_DIST_FOLDER, PY_MODULE, PY_MODULE + '.exe')
  }
  return path.join(appRoot, PY_DIST_FOLDER, PY_MODULE, PY_MODULE)
}

const selectPort = () => {
  pyPort = 4242
  return pyPort
}

const createPyProc = () => {
  let script = getScriptPath()
  let port = '' + selectPort()

  if (guessPackaged()) {
    pyProc = require('child_process').execFile(script, [port])
    console.log('Found server exe:')
    console.log(script);
  } else {
    pyProc = require('child_process').spawn('python', [script, port],{ stdio: 'ignore' })
    // var batchFile = path.join(__dirname, PY_FOLDER,'start_python_server.bat')
    // var bat = shell.openItem(batchFile);
    // console.log(bat)
  }
 
  if (pyProc != null) {
    //console.log(pyProc)
    console.log('child process success on port ' + port);
    

  }
}

const exitPyProc = () => {
  pyProc.kill();
  pyProc = null;
  pyPort = null;
}

// init config and database
var init_server = function(){
  ws.send(tools.parseCmd('isInited'));
}


app.on('ready', createPyProc)
app.on('will-quit', exitPyProc)


/*************************************************************
 * window management
 *************************************************************/

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1024, 
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.loadURL(
    //  'http://localhost:3000' 
    isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, "../build/index.html")}`
    )

  mainWindow.maximize();

  if (isDev){
    mainWindow.webContents.openDevTools();
  }else {
    mainWindow.removeMenu();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

}


app.on('window-all-closed', (e) => {
  app.quit();
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/*************************************************************
 * iPC handler
 *************************************************************/

 ipcMain.on('request-get-stock', (event,data)=>{
  ws.send(tools.parseCmd('getStock',data));
 })
 