# uni's RDC plugin launcher

Remote Desktop Commander を Windows で起動し、既知の接続切れを自動復旧するためのローカルランチャーです。

このリポジトリでは、実行用の BAT / Node.js watchdog と、再現に必要な Desktop Commander のバージョン情報をまとめて管理します。

## 現在の対象

- `@wonderwhy-er/desktop-commander`: `0.2.48`
- Node.js: `K:\nodejs\node.exe`
- npm: `10.9.8`
- Windows 上での利用を前提

`0.2.48` は調査時点の beta 系実装です。既知問題の詳細は `AGENTS.md` を参照してください。

## インストール

初回セットアップ、または `node_modules` を作り直す場合は、
`Install-Remote-Desktop-Commander.bat` をダブルクリックします。

このBATは次を自動実行します。

1. Node.js / npm / package files の存在確認
2. `npm ci` による lockfile 固定の依存関係復元
3. watchdog の構文確認
4. Desktop Commander のインストール確認とバージョン表示

手動で復元する場合は、このフォルダで次を実行します。
```cmd
K:\nodejs\npm.cmd ci
```

## 起動

`Remote-Desktop-Commander.bat` をダブルクリックします。

watchdog はローカルに固定インストールされた Desktop Commander を起動し、内部MCP接続の切断を示す実ツール失敗ログ、または子プロセスの予期しない終了を検出した場合に約3秒後に再起動します。

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

`node_modules`、npm/npxキャッシュ、ログ、一時ファイル、秘密情報、Desktop Commanderのdevice credentialsはコミットしません。

一方、`package.json` と `package-lock.json` は、調査済みのbeta環境を再現するためコミットします。

## 更新時の考え方

Desktop Commander を更新する場合は、先に `AGENTS.md` の既知問題が新バージョンでも再現するか確認します。upstream側で直っている場合は、watchdogの回避策を惰性で残さず簡略化します。
