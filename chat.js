// クロージャー
(() => {
    document.getElementById("exeAnswer").addEventListener("click", chat);
    // メッセージ送信ボタン押下時の処理
    async function chat() {
        // 質問取得
        const question = getQuestion();
        updateQ(question);
        // 回答を生成
        const answer = await getAnswer( question );
        updateA(answer);
    }
    
    // -----------------------------------------
    // UI更新
    // -----------------------------------------
    // 人間メッセージ追加
    function addMessageHuman(message) {
        const html = `
        <li class="list-group-item chat-message me">
          <strong>あなた：</strong> ${message}
        </li>
        `;

        // メッセージ追加
        document.getElementById("list-group").insertAdjacentHTML("beforeend", html);
    }
    // ボットメッセージ追加
    function addMessageBot(message) {
        const html = `
        </li>
        <li class="list-group-item chat-message you">
          <strong>チャットボット：</strong> ${message}
        </li>
        `;

        // メッセージ追加
        document.getElementById("list-group").insertAdjacentHTML("beforeend", html);
    }
    // 質問を反映
    function updateQ(question) {
        addMessageHuman(question);
        addMessageBot('考え中です...');
    }
    // 回答を反映
    function updateA(answer) {
        addMessageBot(answer);
    }
    
    // -----------------------------------------
    // プロセス間通信
    // -----------------------------------------
    // チャット処理を呼び出す
    async function sendByApi( 
        question    // 質問内容
    ){
        // メインプロセスに送信（preload.jsで用意したchatApi.api1()を使用する）
        result = await window.chatApi.api1(question);
        console.log(result);
        return result;
    }
    // -----------------------------------------
    // getter
    // -----------------------------------------
    // 質問を取得
    function getQuestion() {
        const question = document.getElementById("question").value;
        return question;
    }
    // 回答を取得
    async function getAnswer( question ) {
        const answer = await sendByApi( question );
        return answer;
    };
})();