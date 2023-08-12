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
exports.runLlm = void 0;
// モデル
const openai_1 = require("langchain/chat_models/openai");
// 埋め込み
const openai_2 = require("langchain/embeddings/openai");
// ベクトル検索エンジン
const hnswlib_1 = require("langchain/vectorstores/hnswlib");
// チェーン
const chains_1 = require("langchain/chains");
// メモリー
const memory_1 = require("langchain/memory");
// パス操作
const path = require('path');
// アプリケーション作成用のモジュールを読み込み
const { app, BrowserWindow, ipcMain } = require("electron");
// -----------------------------------------
// electronに必要な処理
// -----------------------------------------
// メインウィンドウ
let mainWindow;
const createWindow = () => {
    // メインウィンドウを作成します
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // プリロードスクリプトは、レンダラープロセスが読み込まれる前に実行され、
            // レンダラーのグローバル（window や document など）と Node.js 環境の両方にアクセスできます。
            preload: path.join(__dirname, "preload.js"),
        },
    });
    // メインウィンドウに表示するURLを指定します
    // （今回はmain.jsと同じディレクトリのindex.html）
    mainWindow.loadFile("index.html");
    // デベロッパーツールの起動
    // mainWindow.webContents.openDevTools();
    // メインウィンドウが閉じられたときの処理
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
};
//  初期化が完了した時の処理
app.whenReady().then(() => {
    createWindow();
    // アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
    app.on("activate", () => {
        // メインウィンドウが消えている場合は再度メインウィンドウを作成する
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// 全てのウィンドウが閉じたときの処理
app.on("window-all-closed", () => {
    // macOSのとき以外はアプリケーションを終了させます
    if (process.platform !== "darwin") {
        app.quit();
    }
});
// -----------------------------------------
// 回答を生成
// -----------------------------------------
const runLlm = (question) => __awaiter(void 0, void 0, void 0, function* () {
    const path = require('path');
    // APIキー読み込み
    try {
        require("dotenv").config({ path: path.join(__dirname, '.env') });
    }
    catch (error) {
        console.error('.envファイルの読み込みに失敗しました:', error);
    }
    // 作成済みのインデックスを読み込む
    const vectorStore = yield hnswlib_1.HNSWLib.load(path.join(__dirname, 'index'), // indexフォルダ
    new openai_2.OpenAIEmbeddings());
    // モデル
    const model = new openai_1.ChatOpenAI({});
    // チェーン
    const chain = chains_1.ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
        qaChainOptions: { type: "stuff" },
        memory: new memory_1.BufferMemory({
            memoryKey: "chat_history",
            inputKey: "question",
            outputKey: "text",
            returnMessages: true,
        }),
        // verbose: true,
    });
    // 質問する
    const res = yield chain.call({
        question: question,
    });
    // 回答を返す
    return res['text'];
});
exports.runLlm = runLlm;
// -----------------------------------------
// プロセス間通信
// -----------------------------------------
ipcMain.handle('channel_ichiri', (event, ...args) => __awaiter(void 0, void 0, void 0, function* () {
    // 【テスト】引数確認
    console.log(event);
    args.forEach(function (item, index) {
        console.log("[" + index + "]=" + item);
    });
    if (args.length !== 2) {
        console.error("channel_ichiriの引数が2個ではありません。");
        return;
    }
    // 回答生成
    const question = args[1];
    const res = (0, exports.runLlm)(question);
    // 回答を返す
    return res;
}));
