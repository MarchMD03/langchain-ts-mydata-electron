// モデル
import { ChatOpenAI } from "langchain/chat_models/openai";
// 埋め込み
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// ベクトル検索エンジン
import { HNSWLib } from "langchain/vectorstores/hnswlib";
// チェーン
import { ConversationalRetrievalQAChain } from "langchain/chains";
// メモリー
import { BufferMemory } from "langchain/memory";
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
export const runLlm = async ( question: string ) => {
  const path = require('path');
  // APIキー読み込み
  try {
    require("dotenv").config({ path: path.join(__dirname, '.env') });

  } catch (error) {
    console.error('.envファイルの読み込みに失敗しました:', error);
  }

  // 作成済みのインデックスを読み込む
  const vectorStore = await HNSWLib.load(
    path.join(__dirname, 'index'),                          // indexフォルダ
    new OpenAIEmbeddings()
  );
  // モデル
  const model = new ChatOpenAI({});
  // チェーン
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      qaChainOptions: {type: "stuff"},
      memory: new BufferMemory({
        memoryKey: "chat_history",
        inputKey: "question",
        outputKey: "text",
        returnMessages: true,
      }),
    // verbose: true,
    }

  );
  // 質問する
  const res = await chain.call({
    question: question,
  });

  // 回答を返す
  return res['text'];
};


// -----------------------------------------
// プロセス間通信
// -----------------------------------------
ipcMain.handle('channel_ichiri', async (event: Object, ...args: Array<any>) => {
  // 【テスト】引数確認
  console.log(event);
  args.forEach( function(item, index) {
    console.log("[" + index + "]=" + item);
  });

  if ( args.length !== 2 ) {
    console.error( "channel_ichiriの引数が2個ではありません。" );
    return;
  }

  // 回答生成
  const question = args[1];
  const res = runLlm(question);
  // 回答を返す
  return res;
})