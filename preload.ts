// -----------------------------------------
// プロセス間通信
// -----------------------------------------
const {contextBridge ,ipcRenderer} = require('electron');
// レンダラープロセス内で実行される非同期関数api1を定義
const api1 = async (...args: any[]) => {
  // メインプロセス（バックエンド）の処理channel_ichiriを呼び出す
  const result = await ipcRenderer.invoke('channel_ichiri', ...args);
  return result;
};
// contextBridgeを使って、レンダラープロセス内（ブラウザ側）で使用可能なAPIを設定する
contextBridge.exposeInMainWorld(
    // 'chatApi'という名前でAPIを公開する
    'chatApi', {
      api1: async (...args: Array<any>) => api1('channel_ichiri', ...args),
})