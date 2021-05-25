# Twitter Likes to Telegram

如果你在使用, 记得点击右上角 Watch, 获取后续功能更新

## What 

获取点赞推文内容, 发送到指定 Telegram 聊天

基于 Github Action 和 Gists, 无需外置服务器

支持获取图片, 视频, GIF

## Why

类似与收藏, 希望所有的点赞内容可以**完整的**转发到一个频道(不只是链接)

Telegram 的导出功能也比 Twitter 舒服

## How

使用方式:

1. Fork
2. `.env.example` 所有变量, 填写进项目 `settings -> secrets`

### Prerequisite

- `Twitter API KEY` 和 `ACCESS TOKEN`
    - 申请并创建一个 APP https://developer.twitter.com/en/portal/dashboard
- 创建一个内容为 `{}` 的 `gist`: 
    - https://gist.github.com
    - 文件名默认为 `data.json`
    - 比如`https://gist.github.com/NeverBehave/606d7e14436187b4d45e8657fafd40ab`中
        - `606d7e14436187b4d45e8657fafd40ab` 就是 `GIST_ID`
- 申请一个 Telegram Bot 并加入你想要发送的群/频道
    - [@Botfather](https://t.me/botfather)
    - 获取频道ID, 转发一条频道消息到 [@JSONDumpBot](https://t.me/JSONDumpBot)
    - `CHANNELBOT`变量对应的是 `BOT_TOKEN`
- `GIST_TOKEN` 为 [GitHub token](https://github.com/settings/tokens) 需要把相应的选项勾上

## Adjustment

### Trigger

- Push 
- 每 15 分钟运行一次, 每次获取 100 条
    - 真的真的不会有人一口气搞那么多吧
    - 不够用就加快频率吧
- repository_dispatch: `type: fetchLikes`

## Demo

https://t.me/joinchat/T3XZK0WWXrIJ-_BG
