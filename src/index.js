require('dotenv').config()
const consola = require('consola')

const channelID = process.env.TELEGRAM_CHATID
const Telegram = require('telegraf/telegram')
const bot = new Telegram(process.env.TELEGRAM_CHANNELBOT)

const { getAllLikesSince, getLatestLikeId } = require('./utils/twitter')
const { writeData, readData } = require('./utils/io') 
const { RateLimit } = require('async-sema');
const lim = RateLimit(5, { timeUnit: '60000', uniformDistribution: true})
const retry = require('async-retry')
const retryTimes = 5

// Telegram allow 30 message/s, channel however, said 20 message / minute
// This slow down the process, as each tweet can have upto 4 message so each time it is safe to process
// ~5 tweet/minutes
const main = async (likes) => {
    const messages = []
    // We cannot do map: we need rate limits
    for (const tweet of likes) {
        consola.info('tweet for: ', tweet)
        const template = `<a href="${tweet.link}">Tweet</a> by <a href="${tweet.user.link}">@${tweet.user.username}</a> ${tweet.nsfw ? '#possiblyNSFW' : ''}

${tweet.text}
`
        if (tweet.media.length !== 0) {
            // we need to double check if type are matched: video only or image only
            let mediaGroup = tweet.media
            const v = tweet.media.filter(e => e.type === 'video')
            if (v.length > 0) {
                mediaGroup = v
            }
            mediaGroup[0] = {
                caption: template,
                parse_mode: 'html',
                ...mediaGroup[0]
            }
            consola.info('build message: ', mediaGroup)

            await lim()
            await retry(async () => bot.sendMediaGroup(channelID, mediaGroup), {
                retries: retryTimes
            }).catch(e => consola.error(`${tweet.id} send failed after 5 retries`))
            continue
        }

        await lim()
        await retry(async () => bot.sendMessage(channelID, template, {
            parse_mode: 'html'
        }), {
            retries: retryTimes
        }).catch(e => consola.error(`${tweet.id} send failed after 5 retries`))
    }

    return messages
}

const update = async (prev_ids, likes) => {
    const shouldUpdate = []

    for (const like of likes) {
        if (!prev_ids.includes(like.id)) {
            shouldUpdate.push(like)
        }
    }

    if (shouldUpdate.length !== 0) {
        const d =  { since_id: likes.map(e => e.id) }
        await writeData(d)
        consola.success('Gist updated!')
    }

    consola.success(`Finished update: prev(${prev_ids.length}), current(${likes.length}), diff(${shouldUpdate.length})`)

    return shouldUpdate
}

readData().then(res => {
    consola.info('data read: ', res)
    if (res && res.since_id) {
        const prev_ids = res.since_id
        getAllLikesSince().then(likes => {
            // we issue the update first, to avoid duplicate actions from dispatch and overlap
            update(prev_ids, likes).then(updates => {  
                main(updates).then(() => {
                    consola.success('finished processed')
                }).catch(e => {
                    consola.error(e)
                })
            })
        }).catch(e => {
            consola.error(e)
        })
    } else {
        consola.info('first time access detected')
        getAllLikesSince().then(likes => {
            update([], likes)
        }).catch(e => {
            consola.error(e)
        })
    }
}).catch(e => {
    consola.error(e)
})

