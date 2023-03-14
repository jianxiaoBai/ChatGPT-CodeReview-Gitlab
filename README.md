## 安装

```bash
$ pnpm i --frozen-lockfile
```

## 运行

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 替换 ChatGPT token

将此项目中 `YOU_ARE_CHATGPT_TOKEN` 替换为自己的 ChatGPT token

## 配置项目中的 gitlab

1. 在 gitlab 项目中生成 **`Access Token`** 需要勾选 **读写权限**
2. 在 gitlab 项目中配置 webhook, 勾选 **`Merge request event`**
    - 这个 webhook 地址需要三个参数：
      - `token`: 就是第一步生成的 Access Token
      - `language`: 为 ZH 和 EN，如何设置为 EN，chatGPT 则会以英文进行评论
      - `projectId`: 在 Gitlab project -> general 中可以看到

webhook url 类似: https://www.asxf.com/gitlab-review/webhook?projectId=234&token=sadfgfd23v62g&language=ZH

当把服务部署好之后, 就可以在对应的 Gitlab 项目进行 `Merge Request` 时, ChatGPT 就可以对代码进行评论.