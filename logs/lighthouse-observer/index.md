---
title: Web サイトのパフォーマンスを定点観測する仕組みを作った話
description: Google Cloud Functions とスプレッドシートで Lighthouse を定点観測する ligthouse-observer を作りました。
tags: 
  - Google Cloud Functions
  - Spreadsheet
  - Lighthouse
  - データポータル
  - ligthouse-observer
  - パフォーマンス
date: 2020-12-01 00:00:00 UTC
slug: lighthouse-observer
---

この記事は [YAMAP エンジニア Advent Calender 2020](https://qiita.com/advent-calendar/2020/yamap-engginers) 1日目の記事です。

## パフォーマンス計測に至った理由

YAMAP では地図を表示する画面が多いです。  
地図にはランドマークのピンアイコンだったり、登山道だったり、たくさんの要素を表示する必要があり、ページが重いことが体感的にわかることがありました。  
しかし、実際に重いのかどうかよくわからないし、改善するためにも指標が必要です。  
そこでなにか指標を決めて、計測をしようと思いました。

## パフォーマンスの指標

パフォーマンスの指標について調べていると、Web サイトのユーザー体験の観測には2つの視点があることがわかりました。

### 合成モニタリング

合成モニタリングは、同じ環境で定期的に繰り返し計測します。  
ある特定の環境をシュミレートし、その環境で計測を続けるので、計測結果のゆらぎが少ないです。  
この後書くリアルユーザーモニタリングと違って、ユーザー環境の違いを考慮しません。  

### リアルユーザーモニタリング

リアルユーザーモニタリングは、実際のユーザー体験を計測します。    
計測環境はユーザーによるため、計測結果のゆらぎは大きいです。  

### 指標は合成モニタリング

継続的に改善していくことを考えていたので、環境によるゆらぎの少ない合成モニタリングを行うことにしました。  
ページエクスペリエンスを測定してくれる Lighthouse を使って定点観測し、その結果を指標にすることにしました。  

> 本当はどっちもやるのがいいのだと思います。  
> リアルユーザーモニタリングは実際の数値が見れるので、合成モニタリングと結果を比較することで、合成モニタリングの環境設定を見直すことができたり、ユーザーへのインパクトを知ることができそうです。  

 ## lighthouse-observer の構成

### 概要

![ligthouse-observer-architecture](https://dl.dropboxusercontent.com/s/0bdsgy38ah6wzih/ligthouse-observer-architecture.png)

lighthouse-observer は関数です。
この関数を Cloud Functions として定期実行し、その結果を Spreadsheet に記録します。
データポータルから Spreadsheet に接続し、計測結果をグラフ化し、経過を見やすくしています。

[![yamap-inc/lighthouse-observer - GitHub](https://gh-card.dev/repos/yamap-inc/lighthouse-observer.svg)](https://github.com/yamap-inc/lighthouse-observer)

### 詳細

#### Cloud Scheduler と Cloud Pub/Sub と Cloud Functions

Cloud Scheduler と Cloud Pub/Sub を利用することで Cloud Functions を定期実行することができます。  

![Cloud SchedulerとCloud Pub/SubとCloud Functionsの説明](https://dl.dropboxusercontent.com/s/8hpgnv8sim8vjuu/ligthouse-observer-gcp.png)

Cloud Scheduler のペイロードとして、次のような json を設定します。  
スケジューラー起動時、このペイロードは Cloud Pub/Sub を通して、Cloud Functions へ通知されます。  

```json
{
  "spreadsheetId": "${your_spreadsheet_id}",
  "timezone": "Asia/Tokyo",
  "targets": [
    {
      "url": "https://yamap.com",
      "sheetName": "top"
    },
    {
      "url": "https://yamap.com/maps",
      "sheetName": "maps"
    }
  ]
}
```

スケジューラーのペイロードを変更したり、追加することで、柔軟な対応ができるようにしました。  
Cloud Functions には実行時間の上限（540s）やメモリの上限（2GB）があるので、塩梅を考えて計測対象を分割してスケジュール登録したりしています。  

#### 計測結果をデータポータルで可視化

[データポータル](https://marketingplatform.google.com/intl/ja/about/data-studio/)は Google が提供するサービスのひとつで、データを表やグラフなどで可視化することができるすぐれものです。  
データのリソースとして、Google アナリティクスや MySQL データベース、スプレッドシートなどを選ぶことができます。日付による絞り込みも GUI からパーツを配置するだけで簡単にできるので、すごく助かりました。  

実際の表示はこんな風になっています。  
11/26 に大きくパフォーマンスのスコアが落ちていますね（max=1）😣  

![データポータルでの表示](https://dl.dropboxusercontent.com/s/bh8kipxscd37uwy/lighthouse-observer-web_%28daily%29.png)

## パフォーマンスを可視化してみて

問題がありそうに見えるものは定量化するとよいと、改めて思いました。  
実際、計測前の体感どおり、地図が表示されているページが遅いことがわかったり、クライアント側の実装で改善の余地があることがわかったりしました。  
YAMAP のフロントエンドチームは週に一回、チームミーティングを行っていて、その中でパフォーマンスのサマリーを共有して、ああだこうだ言う時間を設けてもらっています。  
まだこの指標を活用しきれているとは言えませんが、仲間を増やしてやっていこうと思っています。  

## （雑談）パフォーマンスに関する名言

### 「推測するな計測せよ」

有名な言葉ですよね。  
ボトルネックはどこにあるかわからないので、わからないままやみくもに改善するのはよくないです。  
改めて調べてみると、ソフトウェア工学者である[ロバート・C・パイク](https://ja.wikipedia.org/wiki/ロブ・パイク)さんの[Cプログラミングに関する覚書](https://ja.wikipedia.org/wiki/UNIX哲学)の中で述べられている言葉だとわかりました。  

### 「xxx秒遅くなるとxxx」シリーズ

> サイト表示が0.1秒遅くなると、売り上げが1%減少し、1秒高速化すると10%の売上が向上する。
> ー [Web experiments generate insights and promote innovation.](http://robotics.stanford.edu/~ronnyk/2007IEEEComputerOnlineExperiments.pdf)

> 表示速度が1秒から3秒になると直帰率は32%上昇
> ー [Find out how you stack up to new industry benchmarks for mobile page speed](https://www.thinkwithgoogle.com/marketing-resources/data-measurement/mobile-page-speed-new-industry-benchmarks/)

サイトスピードがビジネスに与える影響も大きいことがわかります。  
偉い人を説得するときに使えそう😌  

## 参考

- [超速！ Webページ速度改善ガイド](https://gihyo.jp/book/2017/978-4-7741-9400-4)

- [Synthetic monitoring (合成モニタリング)](https://developer.mozilla.org/ja/docs/Glossary/Synthetic_monitoring)

- [Performance Monitoring: RUM vs synthetic monitoring](https://developer.mozilla.org/en-US/docs/Web/Performance/Rum-vs-Synthetic)

  