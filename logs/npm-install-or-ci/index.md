---
title: npm install と npm ci の違いについて
description: npm でパッケージをインストールする際のバージョン指定について、調べました。
tags: 
  - npm
date: 2020-04-20 00:00:00 UTC
slug: npm-install-or-ci
reference: 
  - https://qiita.com/yfujii1127/items/7ca887a45e0855917279
  - https://ginpen.com/2019/12/04/npm-install-vs-ci/
---

## package.json って何？

package.json はそのプロジェクトが使用する、npm パッケージの依存関係などを管理することができる json ファイルのことです。  

パッケージのバージョン指定には書き方がいくつかあります。  

```json
{
  "hoge": "^10.0.0",
  "huga": "10.0.0"
}
```

たとえば `^10.0.0` は `10.0.0` 以上のバージョンのパッケージを指しますが、`major.minor.patch` のうち、major は更新されません。  
`10.0.0` は `10.0.0` そのものです。  

package.json でパッケージバージョンを固定していても、そのパッケージ自体の package.json でパッケージバージョンが固定されているとは限らないようなので、要注意ですね。  

## package-lock.json って何？

npm@5.0.0 以降で、npm install 時に自動生成される json ファイルです。  
packeage-lock.json は package.json に記載されたパッケージの、具体的で厳密なリストです。  
バージョン番号や、そのパッケージの依存リストなどが、正確に記録されています。

## npm install と npm ci のちがい

`npm install` は package.json を元に、依存関係を解決し、パッケージのインストールを行います。その際に、package-lock.json を上書きします。  
もともとは上書きしない仕様でしたが、パッケージを追加でインストールする際に差が生じて困るので、上書きする仕様になったようです。([https://github.com/npm/npm/issues/16866](https://github.com/npm/npm/issues/16866))  

`npm ci` は package-lock.json を元に、パッケージのインストールを行います。  
依存関係の解決はしませんが、package.json と package-lock.json の間で矛盾が生じていた場合、エラーになります。  
インストール前に /node_modules を削除するのでクリーンインストールとしても使えそうです。

## 結局どっちを使うのがいいんだろう

プロジェクトの clone 直後には `npm ci` を使うのがいいかもしれないと思いました。  
package-lock.json に記載されたバージョンのパッケージをインストールしてくれるので、開発メンバーと環境を同じにすることができるからです。  
これからは `npm ci` を使うようにしていきたいと思います。  
