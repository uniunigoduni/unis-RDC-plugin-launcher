# AGENTS.md

## このリポジトリの目的

このリポジトリは、Windows 上の Remote Desktop Commander を安定して起動するためのランチャーと、その運用に必要な AI 向け知識を同じ Git 履歴で管理します。

実装の正本はこのフォルダ内です。AppData や npm キャッシュ内に、別の「現行版」ランチャーを複製しないでください。

## 重要: beta版時点の知識

ここに記載する Desktop Commander 内部実装の知識は、次の環境を 2026-09-03 に調査した結果です。

- `@wonderwhy-er/desktop-commander`: `0.2.48`
- Windows
- Remote Desktop Commander の remote-device 機能

Desktop Commander は開発中です。新しいバージョンでは内部構造・ログ・不具合が変わっている可能性があります。

パッケージを更新した場合は、この文書の回避策をそのまま正しいものとして扱わず、現行ソースと実挙動を再確認してください。

## 既知の接続問題

0.2.48 では、Remote 側への `ping` が成功している一方で、通常の Desktop Commander ツールが `Not connected` で失敗する状態を確認しています。

調査した 0.2.48 の `device.js` では `ping` は outer remote-device プロセス側で直接応答しており、内部 Desktop Commander MCP client を通りません。

そのため、次は成立しません。

```text
ping success = Desktop Commander tools healthy
```

健全性確認には、ファイル読み取りやプロセス実行など、内部 Desktop Commander MCP client を実際に使うツール呼び出しを利用してください。

## 0.2.48 の内部挙動

調査した `desktop-commander-integration.js` では、通常ツールは `mcpClient.callTool()` へ渡されます。

ツール呼び出し失敗時は概ね次の形式でログ出力されます。

```text
Error executing tool <toolName>: <error>
```

0.2.48 の該当処理はエラーをログして再throwしますが、その場で MCP client の ready 状態をリセットしたり、自動再接続・再試行したりはしませんでした。

この内部挙動はバージョン固有です。新バージョンで同じだと決めつけないでください。

## 現在の自動復旧方式

`Remote-Desktop-Commander.bat` が `remote-watch.js` を起動します。

watchdog はこのリポジトリの `node_modules` に固定インストールされた Desktop Commander の `dist/index.js` を、現在の Node.js で直接起動します。

`.cmd` をさらに `cmd.exe /c` で包む方式は、Windows の引用符処理で過去に起動失敗したため現在は使いません。

watchdog は次の場合に child process tree を終了し、約3秒後に再起動します。

- 実ツールの失敗ログが内部MCP切断パターンに一致した場合
- Remote Desktop Commander の child process が終了した場合

## 誤検知を避けること

watchdog の切断検出を、エラー文字列だけの単純な全文検索に戻さないでください。

過去に広すぎる判定を使った結果、README に既知エラー名を書き込むツール呼び出しのログまで拾って、watchdog が自己再起動する誤検知が発生しました。

現在は `Error executing tool <toolName>:` という 0.2.48 の実エラーログ文脈と組み合わせて検出しています。

ログ形式を変更する場合は、実際の upstream ログを確認してから検出式も更新してください。

## 依存関係と再現性

`node_modules` は Git 管理しません。再現性は次の2ファイルで確保します。

- `package.json`
- `package-lock.json`

Desktop Commander は現在 `0.2.48` に完全固定しています。

依存関係を復元するときは、このフォルダで次を実行します。

```cmd
K:\nodejs\npm.cmd ci
```

ローカル環境では Node.js が `K:\nodejs\node.exe` にあります。BAT はこのパスを優先し、見つからない場合だけ PATH 上の `node` を探します。

## セキュリティ

認証情報は絶対にこのリポジトリへ保存しないでください。

特に次を README、AGENTS、issue、commit、ログへコピーしないでください。

- access token
- refresh token
- session token
- device credentials
- credential を含む `device.json`

`.gitignore` でも代表的な秘密情報・device state を除外しますが、ignore されていることだけを安全性の根拠にしないでください。

## AIが変更するときの手順

ランチャーやwatchdogを変更するときは、原則として次の順序で確認します。

1. 現在の `package.json` と実インストール版のバージョンを確認する。
2. `git status` を確認し、無関係な変更を巻き込まない。
3. 現行の BAT / watchdog を読む。
4. upstream の内部挙動に依存する修正なら、現行パッケージソースを確認する。
5. npm/npx キャッシュ内のパッケージ本体を直接パッチしない。
6. `node --check remote-watch.js` を通す。
7. Windows の起動コマンドを変更した場合は、引用符を含め実際のコマンドで検証する。
8. Git 差分を確認してからコミットする。

## 更新時の方針

新しい Desktop Commander で upstream 側の再接続処理が改善された場合は、このwatchdogを必要以上に残さないでください。

特に、次の点を再検証します。

- `ping` が内部MCP接続の健全性まで検証するようになったか
- tool call failure 時に client state をリセットするようになったか
- 自動 reconnect / retry が追加されたか
- エラーログ形式が変わったか

このリポジトリは「永続的な upstream 仕様書」ではなく、その時点で動作確認したランチャーとbeta知識の履歴です。
