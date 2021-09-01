import { generateImage } from './utils.js';

/**
 * Snap a text code to a carbon image.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function snap(context) {
  if (!context.message.reply_to_message) return;

  const replyMessage = context.message.reply_to_message;
  const isOwner = context.message.from.id === replyMessage.from.id;
  const isPrivateChat = context.chat.type === 'private';

  if (!replyMessage.text) {
    await context.reply('`/snap` can only be used on plain texts', { parse_mode: 'MarkdownV2' });
    return;
  }

  const code = replyMessage.text;

  await context.telegram.sendPhoto(
    context.message.chat.id,
    {
      source: await generateImage(code, context.message.from.username),
    },
    {
      caption: replyMessage.from.username
        ? `@${replyMessage.from.username}`
        : `${replyMessage.from.first_name} ${replyMessage.from.last_name}`,
      reply_to_message_id: !isOwner && replyMessage.message_id,
    },
  );

  if (!isPrivateChat) {
    // Snap message
    await context.deleteMessage(context.message.message_id);

    if (isOwner) {
      // Target message to snap
      await context.deleteMessage(replyMessage.message_id);
    }
  }
}

/**
 * Send code screenshot.
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command('snap', snap);

  return [
    {
      command: 'snap',
      description: 'Screenshot the code in the reply message.',
    },
  ];
}
