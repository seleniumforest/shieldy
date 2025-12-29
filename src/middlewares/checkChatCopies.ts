import { Context } from 'telegraf'
import { deleteMessageSafe } from '@helpers/deleteMessageSafe'
import { getLinkedChannelInfo } from '@helpers/updateChannelInfo';

export async function checkChatCopies(ctx: Context, next: () => any) {
    if (!ctx.dbchat.banChatCopies) {
        return next()
    }

    if (ctx.update.message.from.is_bot) {
        return next()
    }

    if (!ctx.updateSubTypes.includes("text")) {
        return next()
    }

    if (ctx.update.message?.is_automatic_forward) {
        return next()
    }

    if (ctx?.isAdministrator) {
        return next()
    }

    //compare chat title with user's name
    let from = ctx.update.message.from;
    let userTitle = `${from.first_name}${from.last_name ? ' ' + from.last_name : ''}`;
    let chatTitle = ctx.update.message.chat.title;
    if (smartCompare(userTitle, chatTitle)) {
        deleteMessageSafe(ctx)
    }

    let linkedChannel = await getLinkedChannelInfo(ctx);
    if (smartCompare(linkedChannel.title, userTitle)) {
        deleteMessageSafe(ctx)
    }

    next()
}

function smartCompare(str1: string, str2: string) {
    let result = normalize(str1) === normalize(str2);
    console.log(`smartCompare ${str1} with ${str2} returned ${result}`);
    return result;
}

function normalize(str: string) {
    return str
        .toLowerCase()
        .replace(/(.)\1+/gu, '$1')
        .trim()
        .split('')
        .map(x => similarityMap[x] || x)
        .join('')
}

const similarityMap: Record<string, string> = {
    // Group 4 (А, Ч)
    'а': '4', 'a': '4', 'ч': '4', '@': '4', '🅰️': '4', '4️⃣': '4',

    // Group 8 (В, Б, B) 
    'в': '8', 'б': '8', 'b': '8', '8️⃣': '8', '6️⃣': '8', '6': '8',

    // Group 3 (Е, З, Э)
    'е': '3', 'e': '3', 'з': '3', 'э': '3', '3️⃣': '3', '€': '3',

    // Group 1 (И, L, I, 1, !, |, N)
    'и': '1', 'n': '1', 'i': '1', 'l': '1', '1️⃣': '1', 'ℹ️': '1', '|': '1', '!': '1', 'j': '1',

    // Group 0 (О, D)
    'о': '0', 'o': '0', 'd': '0', '🅾️': '0', '0️⃣': '0',

    // Group 5 (С, S)
    'с': '5', 'c': '5', 's': '5', '5️⃣': '5', '$': '5',

    // Group 7 (Т, Г, 7)
    'т': '7', 't': '7', 'г': '7', '7️⃣': '7', '+': '7',

    // Group Y (У, V, Y)
    'у': 'y', 'y': 'y', 'v': 'y',

    // Group X (Х, Ж, X, %)
    'х': 'x', 'x': 'x', 'ж': 'x', '%': 'x', '❌': 'x',

    // Group W (Ш, Щ, W, M)
    'ш': 'w', 'щ': 'w', 'w': 'w', 'm': 'w',

    // Group R (Я, R)
    'я': 'r', 'r': 'r'
};