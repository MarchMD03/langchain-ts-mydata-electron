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
// -----------------------------------------
// プロセス間通信
// -----------------------------------------
const { contextBridge, ipcRenderer } = require('electron');
// レンダラープロセス内で実行される非同期関数api1を定義
const api1 = (...args) => __awaiter(void 0, void 0, void 0, function* () {
    // メインプロセス（バックエンド）の処理channel_ichiriを呼び出す
    const result = yield ipcRenderer.invoke('channel_ichiri', ...args);
    return result;
});
// contextBridgeを使って、レンダラープロセス内（ブラウザ側）で使用可能なAPIを設定する
contextBridge.exposeInMainWorld(
// 'chatApi'という名前でAPIを公開する
'chatApi', {
    api1: (...args) => __awaiter(void 0, void 0, void 0, function* () { return api1('channel_ichiri', ...args); }),
});
