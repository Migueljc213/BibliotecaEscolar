const { contextBridge, ipcRenderer } = require('electron')

// Expor APIs seguras para o processo de renderização
contextBridge.exposeInMainWorld('electronAPI', {
  // Funções para comunicação com o processo principal
  showMessage: (message) => ipcRenderer.invoke('show-message', message),
  
  // Funções para gerenciamento de arquivos
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  
  // Funções para backup do banco
  backupDatabase: () => ipcRenderer.invoke('backup-database'),
  restoreDatabase: () => ipcRenderer.invoke('restore-database'),
  
  // Funções para configurações
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Funções para impressão
  printReport: (data) => ipcRenderer.invoke('print-report', data),
  
  // Funções para notificações
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body)
})

// Expor informações do ambiente
contextBridge.exposeInMainWorld('electronInfo', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron
}) 