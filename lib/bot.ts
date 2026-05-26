import { Bot, InlineKeyboard } from "grammy";
import { AGENTS, findAgentsByArea, formatAgent } from "./agents";

let _bot: Bot | null = null;

export function getBot(): Bot {
  if (_bot) return _bot;

  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN environment variable is required");

  _bot = new Bot(token);

  // /start
  _bot.command("start", async (ctx) => {
    await ctx.reply(
      `👋 Welcome to *DealsInKampala Bot*\\!\n\n` +
        `Uganda's most trusted marketplace — buy and sell safely in Kampala\\.\n\n` +
        `*What can I do?*\n` +
        `/search \\[keyword\\] — Find listings by keyword\n` +
        `/agents \\[area\\] — Find a payment agent near you\n` +
        `/submit — List an item for sale\n` +
        `/rate — Rate a seller after a deal\n` +
        `/report — Report a problem or fake listing\n` +
        `/help — Show this menu again\n\n` +
        `💬 Join our community: t\\.me/DealsInKampalaChannel`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // /help
  _bot.command("help", async (ctx) => {
    await ctx.reply(
      `*DealsInKampala Bot — Commands*\n\n` +
        `/search \\[keyword\\] — Search listings \\(e\\.g\\. /search iPhone\\)\n` +
        `/agents \\[area\\] — Find nearest payment agent \\(e\\.g\\. /agents Ntinda\\)\n` +
        `/submit — Submit a new listing\n` +
        `/rate — Rate a completed deal\n` +
        `/report — Report a scam or problem\n` +
        `/mydeals — View your active deals\n\n` +
        `📢 Deal alerts: t\\.me/DealsInKampalaChannel\n` +
        `🌐 Website: dealsInKampala\\.com \\(coming soon\\)`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // /agents [area]
  _bot.command("agents", async (ctx) => {
    const query = ctx.match?.trim();

    if (!query) {
      const allAreas = [...new Set(AGENTS.map((a) => a.area))].join(", ");
      await ctx.reply(
        `📍 *Find a payment agent near you*\n\n` +
          `Usage: /agents \\[your area\\]\n` +
          `Example: /agents Ntinda\n\n` +
          `Available areas: ${allAreas.replace(/[.!()-]/g, "\\$&")}\n\n` +
          `_Agents hold your MoMo payment safely until delivery is confirmed\\._`,
        { parse_mode: "MarkdownV2" }
      );
      return;
    }

    const found = findAgentsByArea(query);

    if (found.length === 0) {
      await ctx.reply(
        `❌ No agents found in "${query}"\\.\\n\\n` +
          `Try a nearby area or use /agents without a keyword to see all areas\\.`,
        { parse_mode: "MarkdownV2" }
      );
      return;
    }

    await ctx.reply(`🔍 Found ${found.length} agent(s) near "${query}":`);

    for (const agent of found.slice(0, 3)) {
      await ctx.reply(formatAgent(agent));
    }

    await ctx.reply(
      `_To use an agent: send MoMo to their number, then ask them to confirm via Telegram\\._`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // /search [keyword]
  _bot.command("search", async (ctx) => {
    const keyword = ctx.match?.trim();

    if (!keyword) {
      await ctx.reply(
        `🔍 *Search Listings*\n\n` +
          `Usage: /search \\[keyword\\]\n` +
          `Examples:\n` +
          `• /search iPhone 13\n` +
          `• /search Toyota Premio\n` +
          `• /search 2 bedroom apartment\n\n` +
          `_Search connects to our Facebook group and Telegram listings\\._`,
        { parse_mode: "MarkdownV2" }
      );
      return;
    }

    const keyboard = new InlineKeyboard().url(
      `Search "${keyword}" on Facebook`,
      `https://www.facebook.com/groups/255230365959060/search/?q=${encodeURIComponent(keyword)}`
    );

    await ctx.reply(
      `🔍 Searching for "*${keyword.replace(/[.!()-]/g, "\\$&")}*"\\.\\.\\.\n\n` +
        `📱 Browse matching listings in our Facebook group:\n` +
        `Or check our Telegram channel: t\\.me/DealsInKampalaChannel\n\n` +
        `_Full in\\-bot search launching soon\\!_`,
      { parse_mode: "MarkdownV2", reply_markup: keyboard }
    );
  });

  // /submit
  _bot.command("submit", async (ctx) => {
    await ctx.reply(
      `📝 *List an Item for Sale*\n\n` +
        `To submit a listing, send a message in this format:\n\n` +
        `*ITEM:* \\[item name\\]\n` +
        `*PRICE:* UGX \\[amount\\]\n` +
        `*CONDITION:* \\[New / Used\\]\n` +
        `*LOCATION:* \\[your area in Kampala\\]\n` +
        `*DESCRIPTION:* \\[brief description\\]\n` +
        `*CONTACT:* \\[phone / WhatsApp number\\]\n\n` +
        `Then send your photos in the next message\\.\n\n` +
        `_Your listing will be reviewed and posted to the group within 2 hours\\._\n\n` +
        `Or post directly in our Facebook group:\n` +
        `facebook\\.com/groups/255230365959060`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // /rate
  _bot.command("rate", async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text("⭐ 1", "rate_1")
      .text("⭐⭐ 2", "rate_2")
      .text("⭐⭐⭐ 3", "rate_3")
      .row()
      .text("⭐⭐⭐⭐ 4", "rate_4")
      .text("⭐⭐⭐⭐⭐ 5", "rate_5");

    await ctx.reply(
      `⭐ *Rate Your Deal*\n\n` +
        `How was your experience with this seller?\n` +
        `Select a rating below:`,
      { parse_mode: "MarkdownV2", reply_markup: keyboard }
    );
  });

  _bot.callbackQuery(/^rate_(\d)$/, async (ctx) => {
    const stars = parseInt(ctx.match[1]);
    const display = "⭐".repeat(stars);
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `${display} Thanks for rating\\!\n\n` +
        `Your rating has been recorded\\. ` +
        `Sellers with high ratings get featured in our weekly Spotlight post\\.\n\n` +
        `_Want to add a comment? Reply to this message with your review\\._`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // /report
  _bot.command("report", async (ctx) => {
    await ctx.reply(
      `🚨 *Report a Problem*\n\n` +
        `Please describe your issue in a message using this format:\n\n` +
        `*REPORT TYPE:* \\[Fake Listing / Scam / No Delivery / Other\\]\n` +
        `*SELLER NAME or PHONE:* \\[if known\\]\n` +
        `*DEAL AMOUNT:* UGX \\[amount\\]\n` +
        `*WHAT HAPPENED:* \\[describe the problem\\]\n` +
        `*EVIDENCE:* \\[attach screenshots if available\\]\n\n` +
        `_All reports are reviewed within 24 hours\\. Fake listings are removed and sellers banned\\._\n\n` +
        `For urgent matters, DM the Facebook page directly\\.`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // /mydeals
  _bot.command("mydeals", async (ctx) => {
    await ctx.reply(
      `📦 *My Deals*\n\n` +
        `Deal tracking is coming soon\\!\n\n` +
        `For now, track your deals by:\n` +
        `• Checking your Facebook group comments\n` +
        `• Contacting your agent directly\n` +
        `• DMing the page for deal status\n\n` +
        `_Full deal tracking with status updates launches in Week 3\\._`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // Catch-all for unrecognized messages
  _bot.on("message", async (ctx) => {
    await ctx.reply(
      `👋 I didn't understand that\\. Use /help to see all available commands\\.`,
      { parse_mode: "MarkdownV2" }
    );
  });

  return _bot;
}
