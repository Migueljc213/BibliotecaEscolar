const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  // Criar a janela do navegador
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Adicione um ícone se tiver
    title: 'Sistema de Biblioteca - Igreja'
  })

  // Carregar o app
  // Usar o servidor de desenvolvimento do Next.js
  mainWindow.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools()

  // Menu personalizado
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Sobre',
          click: () => {
            require('electron').dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre',
              message: 'Sistema de Biblioteca da Igreja',
              detail: 'Versão 1.0.0\nDesenvolvido para gerenciar livros e empréstimos.'
            })
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// Este método será chamado quando o Electron terminar de inicializar
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // No macOS, é comum recriar uma janela no app quando o
    // ícone do dock é clicado e não há outras janelas abertas
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit quando todas as janelas estiverem fechadas
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// Neste arquivo você pode incluir o resto do código específico
// do processo principal do seu app. Você também pode colocar
// eles em arquivos separados e requeridos-as aqui. 