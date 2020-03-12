---
title: GatsbyJS と Markdown でブログを作りました
description: 最近携わったプロジェクトでGridsomeを触ることがあり、とても手軽にブログが作れて楽しかったので、自分のブログも作ってみました。
tags:
  - GatsbyJS
  - Markdown
  - 静的サイトジェネレーター
date: 2020-03-12 00:00:00 UTC
slug: gatsby-markdown
---

最近携わったプロジェクトで [Gridsome](https://gridsome.org/) を触ることがあり、とても手軽にブログが作れて楽しかったので、自分のブログも作ってみました。（存在はしていたものの放置していました。更新したくなるよう、リニューアル大作戦です！）  

使ったことのないフレームワークを試してみたかったので [GatsbyJS](https://www.gatsbyjs.org/) を選ぶことに。  
GatsbyJS は高速さを謳っているフレームワークで React がベースになっています。特徴のひとつに静的サイトジェネレーターがあり、速いサイトを作ることができます！  

今回のブログで実装した機能と、実装のために利用したプラグインなどをまとめてみたいと思います。  

## Markdown ファイルをブログのコンテンツとして利用する

### まずは Markdown を Gatsby 内で扱えるようにする

このブログは、ローカルにある Markdown ファイルをブログのコンテンツとして扱っています。  
それを実現しているのが `gatsby-source-filesystem` です。  

[gatsby-source-filesystem | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-source-filesystem/#gatsby-source-filesystem)

`gatsby-source-filesystem` は色んなソースファイルを Gatsby のデータシステムに組み込む役割を担っていて、`gatsby-config.js` に以下のように記述すると、GraphQL からデータを扱えるようになります。

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `logs`,
        path: `${__dirname}/contents/logs/`, // ソースファイルへのパス
      },
    },
  ],
}
```

### Markdown を HTML にパースする

Markdown ファイルのデータを Gatsby 内で扱えるようになりましたが、ブラウザに表示するためには HTML にパースしたいです。  
そこで `gatsby-transformer-remark` を利用します。  

[gatsby-transformer-remark | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/)

```javascript
module.exports = {
  plugins: [
    `gatsby-transformer-remark`,
  ],
}
```

たったこれだけです🎉
そして `gatsby-transformer-remark` は目次データもつくってくれます。  

```GraphQL
  {
    allMarkdownRemark {
      edges {
        node {
          html
          tableOfContents # 目次データ
        }
      }
    }
  }
```

## 目次からブログ内のヘディング要素にページ内遷移する

目次データをつかってブログ内のヘディング要素にページ内遷移するためには、Markdown からパースした HTML のヘディング要素に、id を付与する必要があります。  
`gatsby-transformer-remark` 内のオプションプラグインとして `gatsby-remark-autolink-headers` を利用します。  

[gatsby-remark-autolink-headers | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-remark-autolink-headers/)

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-autolink-headers`,
        ],
      }
    },
  ],
}
```

## シンタックスハイライトを適用する

シンタックスハイライトには、[Prism](https://prismjs.com/) を利用しました。  
シンタックスハイライトに必要なパースをするためのプラグインとして `gatsby-remark-prismjs` と、`prismjs` 本体のインストールが必要です。  

`gatsby-remark-prismjs` も `gatsby-transformer-remark` 内のオプションプラグインとして利用します。  

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-prismjs`,
        ],
      }
    },
  ],
}
```

[gatsby-remark-prismjs | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-remark-prismjs/?=prismjs)

### Prism のスタイルをカスタマイズする

今回、シンタックスハイライトのスタイルは [Prism theme generator](http://k88hudson.github.io/syntax-highlighting-theme-generator/www/) をつかって自作してみることにしました。  
青っぽいのが好みなので大満足です！  

## まとめ

GatsbyJS はたくさんプラグイン開発がされているので、とてもスピーディーに開発を進めることができるのが、とても良い点だと思いました！現時点で1700以上のプラグインが存在するようです😳  
ドキュメントもとにかく充実しています。  

今後は、投稿の検索機能や、前後の投稿へのリンクを実装してみたいと思います。  
