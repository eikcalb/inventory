require('dotenv').config()
const { app, BrowserWindow, Menu } = require('electron')
const { resolve } = require('path')
const log = require('electron-log')
log.transports.console.level = 'silly'
log.transports.file.level = 'silly'


app.requestSingleInstanceLock()

const firstRun = process.argv[1] === '--squirrel-firstrun'

if (firstRun) {
    log.info('First run --- Welcome!')
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 600,
        minWidth: 800,
        show: false,
        center: true,
        darkTheme: true,
        backgroundColor: '#111',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        title: 'Inventory Application'
    })

    log.info('Starting application window...')

    if (process.env.LOAD_HOST) {
        win.loadURL(process.env.LOAD_HOST).then(() => {
            win.show()
            win.once('focus', () => win.flashFrame(false))
            win.flashFrame(true)
        })
    } else {
        win.loadFile(resolve(process.env.LOAD_URL)).then(() => {
            win.show()
            win.once('focus', () => win.flashFrame(false))
            win.flashFrame(true)
        })
    }
}

async function createAppMenu() {
    const isMac = process.platform === 'darwin'
    const template = [
        // { role: 'appMenu' }
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        // { role: 'editMenu' }
        {
            role: 'help',
            submenu: [{
                label: 'About Author',
                click: async() => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://github.com/eikcalb')
                }
            }]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

app.whenReady().then(createAppMenu).then(createWindow).catch((e) => {
    log.error(e)
    new Notification({
        title: 'Failed to initialize application',
        body: 'There was an error starting application resources.'
    }).show()
    app.quit()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})