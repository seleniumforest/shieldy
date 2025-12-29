import { Context, Telegram } from "telegraf";
import { saveChatProperty } from "./saveChatProperty";

const api = new Telegram(process.env.TOKEN);
const CACHE_TTL = 1000 * 60 * 60 * 12;

export async function getLinkedChannelInfo(ctx: Context) {
    let info = ctx.dbchat.linkedChannelInfo;
    if (info && info.cachedAt + CACHE_TTL > Date.now()) {
        console.log("cache hit")
        return info;
    }

    console.log("cache miss")
    await updateLinkedChannelInfo(ctx);
    return ctx.dbchat.linkedChannelInfo;
}

export async function updateLinkedChannelInfo(ctx: Context) {
    let currentChat = await ctx.getChat();
    if (!currentChat?.linked_chat_id)
        return;

    let linkedChannel = await api.getChat(currentChat.linked_chat_id);
    if (linkedChannel.type !== "channel")
        return;

    ctx.dbchat.linkedChannelInfo = {
        id: linkedChannel.id,
        title: linkedChannel.title,
        type: linkedChannel.type,
        cachedAt: Date.now()
    };

    await saveChatProperty(ctx.dbchat, 'linkedChannelInfo');
}