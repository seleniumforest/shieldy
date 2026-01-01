import { Telegram } from "telegraf";

export const api = new Telegram(process.env.TOKEN);