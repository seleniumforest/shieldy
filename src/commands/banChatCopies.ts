import { clarifyIfPrivateMessages } from '@helpers/clarifyIfPrivateMessages'
import { saveChatProperty } from '@helpers/saveChatProperty'
import { Telegraf, Context, Extra } from 'telegraf'
import { strings } from '@helpers/strings'
import { checkLock } from '@middlewares/checkLock'
import { updateLinkedChannelInfo } from '@helpers/updateChannelInfo'

export function setupBanChatCopies(bot: Telegraf<Context>) {
  bot.command(
    'banChatCopies',
    checkLock,
    clarifyIfPrivateMessages,
    async (ctx) => {
      let chat = ctx.dbchat
      chat.banChatCopies = !chat.banChatCopies

      await updateLinkedChannelInfo(ctx);
      await saveChatProperty(chat, 'banChatCopies')
      ctx.replyWithMarkdown(
        strings(
          ctx.dbchat,
          chat.banChatCopies
            ? 'banChatCopies_true'
            : 'banChatCopies_false'
        ),
        Extra.inReplyTo(ctx.message.message_id)
      )
    }
  )
}
