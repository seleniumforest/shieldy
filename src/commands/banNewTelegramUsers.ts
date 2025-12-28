import { clarifyIfPrivateMessages } from '@helpers/clarifyIfPrivateMessages'
import { saveChatProperty } from '@helpers/saveChatProperty'
import { Telegraf, Context, Extra } from 'telegraf'
import { strings } from '@helpers/strings'
import { checkLock } from '@middlewares/checkLock'

export function setupBanNewTelegramUsers(bot: Telegraf<Context>) {
  bot.command(
    'banNewTelegramUsers',
    checkLock,
    clarifyIfPrivateMessages,
    async (ctx) => {
      let chat = ctx.dbchat

      let [_cmd, fromIdsString] = (ctx.update.message.text as string)
        .split(" ")
        .map(arg => arg.trim())
      chat.banNewTelegramUsersFromId = parseInt(fromIdsString) || 1_000_000_000;
      chat.banNewTelegramUsers = !chat.banNewTelegramUsers

      await saveChatProperty(chat, 'banNewTelegramUsers')
      await saveChatProperty(chat, 'banNewTelegramUsersFromId')
      ctx.replyWithMarkdown(
        strings(
          ctx.dbchat,
          chat.banNewTelegramUsers
            ? 'banNewTelegramUsers_true'
            : 'banNewTelegramUsers_false'
        ),
        Extra.inReplyTo(ctx.message.message_id)
      )
    }
  )
}
