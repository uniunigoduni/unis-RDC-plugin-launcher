# uni's RDC plugin launcher

Remote Desktop Commander を Windows で起動し、既知の接続切れを自動復旧するためのローカルランチャーです。

このリポジトリでは、実行用の BAT / Node.js watchdog と、再現に必要な Desktop Commander のバージョン情報をまとめて管理します。

## 現在の対象

- `@wonderwhy-er/desktop-commander`: `0.2.48`
- Node.js: `K:\nodejs\node.exe`
- npm: `10.9.8`
- Windows 上での利用を前提

`0.2.48` は調査時点の beta 系実装です。既知問題の詳細は `AGENTS.md` を参照してください。

## セットアップ

依存パッケージは Git 管理しません。初回または `node_modules` を削除した場合は、このフォルダで次を実行します。

```cmd
K:\nodejs\npm.cmd ci
```

## 起動

`Remote-Desktop-Commander.bat` をダブルクリックします。

watchdog はローカルに固定インストールされた Desktop Commander を起動し、以下の場合に約3秒後に再起動します。

- 実ツール呼び出しが `Not connected` で失敗した場合
- Remote Desktop Commander プロセスが予期せず終了した場合

ランチャーのウィンドウを閉じると停止します。

## バージョン確認

```cmd
K:\nodejs\npm.cmd run rdc:version
```

watchdog の構文確認は次で行えます。

```cmd
K:\nodejs\npm.cmd run check
```

## Git 管理

次はコミットしません。

- `node_modules`
- npm / npx のキャッシュ
- ログや一時ファイル
- `.env` などの秘密情報
- Desktop Commander の device credentials

一方、`package.json` と `package-lock.json` は、調査済みのbeta環境を再現するためコミットします。

## 更新時の考え方

Desktop Commander を更新する場合は、先に `AGENTS.md` の既知問題が新バージョンでも再現するか確認します。upstream側で直っている場合は、watchdogの回避策を惰性で残さず簡略化します。
