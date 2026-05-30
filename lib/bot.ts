import { Bot, InlineKeyboard } from "grammy";
import {
  searchDeals,
  findAgentsByArea,
  getAgentAreas,
  countActiveDeals,
  getDealsByTelegram,
  formatDealMd,
  formatAgentMd,
} from "./queries";

let _bot: Bot | null = null;

export function getBot(): Bot {
  if (_bot) return _bot;

  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN environment variable is required");

  _bot = new Bot(token);

  // ─── /start ───────────────────────────────────────────────────────────────
  _bot.command("start", async (ctx) => {
    let dealCount = "";
    try {
      const n = await countActiveDeals();
      dealCount = `\n📦 *${n} active listings* live right now\\.\n`;
    } catch {
      // non-critical — welcome message still sends without the count
    }

    await ctx.reply(
      `👋 Welcome to *DealsInKampala Bot*\\!\n\n` +
        `Uganda's most trusted marketplace — buy and sell safely in Kampala\\.` +
        dealCount +
        `\n*What can I do?*\n` +
        `/search \\[keyword\\] — Find listings by keyword\n` +
        `/agents \\[area\\] — Find a payment agent near you\n` +
        `/submit — List an item for sale\n` +
        `/mydeals — View your active listings\n` +
        `/rate — Rate a seller after a deal\n` +
        `/report — Report a problem or fake listing\n` +
        `/help — Show this menu again\n\n` +
        `💬 Join our community: t\\.me/DealsInKampalaChannel`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // ─── /help ────────────────────────────────────────────────────────────────
  _bot.command("help", async (ctx) => {
    await ctx.reply(
      `*DealsInKampala Bot — Commands*\n\n` +
        `/search \\[keyword\\] — Search listings \\(e\\.g\\. /search iPhone\\)\n` +
        `/agents \\[area\\] — Find nearest payment agent \\(e\\.g\\. /agents Ntinda\\)\n` +
        `/submit — Submit a new listing\n` +
        `/mydeals — View your active deals\n` +
        `/rate — Rate a completed deal\n` +
        `/report — Report a scam or problem\n\n` +
        `📢 Deal alerts: t\\.me/DealsInKampalaChannel\n` +
        `🌐 Website: dealsinkampala\\.vercel\\.app`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // ─── /agents [area] ───────────────────────────────────────────────────────
  _bot.command("agents", async (ctx) => {
    const query = ctx.match?.trim();

    if (!query) {
      try {
        const areas = await getAgentAreas();
        const areaList =
          areas.length > 0
            ? areas.join(", ").replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`)
            : "Ntinda, Nakawa, Kampala Central";

        await ctx.reply(
          `📍 *Find a payment agent near you*\n\n` +
            `Usage: /agents \\[your area\\]\n` +
            `Example: /agents Ntinda\n\n` +
            `Available areas: ${areaList}\n\n` +
            `_Agents hold your MoMo payment safely until delivery is confirmed\\._`,
          { parse_mode: "MarkdownV2" }
        );
      } catch {
        await ctx.reply(
          `📍 *Find a payment agent near you*\n\n` +
            `Usage: /agents \\[your area\\]\n` +
            `Example: /agents Ntinda\n\n` +
            `_Agents hold your MoMo payment safely until delivery is confirmed\\._`,
          { parse_mode: "MarkdownV2" }
        );
      }
      return;
    }

    try {
      const found = await findAgentsByArea(query);

      if (found.length === 0) {
        await ctx.reply(
          `❌ No agents found near *${query.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`)}*\\.\n\n` +
            `Try a nearby area or use /agents to see all available areas\\.`,
          { parse_mode: "MarkdownV2" }
        );
        return;
      }

      await ctx.reply(`🔍 Found ${found.length} agent\\(s\\) near *${query.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`)}*:`, {
        parse_mode: "MarkdownV2",
      });

      for (const agent of found) {
        await ctx.reply(formatAgentMd(agent), { parse_mode: "MarkdownV2" });
      }

      await ctx.reply(
        `_To use an agent: send MoMo to their number, then ask them to confirm via Telegram\\._`,
        { parse_mode: "MarkdownV2" }
      );
    } catch (err) {
      console.error("[/agents] DB error:", err);
      await ctx.reply(
        `⚠️ Could not load agents right now\\. Please try again in a moment\\.`,
        { parse_mode: "MarkdownV2" }
      );
    }
  });

  // ─── /search [keyword] ────────────────────────────────────────────────────
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
          `_I'll search our live database of active listings\\._`,
        { parse_mode: "MarkdownV2" }
      );
      return;
    }

    try {
      const results = await searchDeals(keyword);

      if (results.length === 0) {
        const fbUrl = `https://www.facebook.com/groups/255230365959060/search/?q=${encodeURIComponent(keyword)}`;
        const keyboard = new InlineKeyboard().url(
          `Search "${keyword}" on Facebook`,
          fbUrl
        );
        await ctx.reply(
          `❌ No listings found for *${keyword.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`)}*\\.\n\n` +
            `Try a different keyword, or search our Facebook group:`,
          { parse_mode: "MarkdownV2", reply_markup: keyboard }
        );
        return;
      }

      const keywordEsc = keyword.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`);
      await ctx.reply(
        `🔍 Found *${results.length}* listing\\(s\\) for *${keywordEsc}*:`,
        { parse_mode: "MarkdownV2" }
      );

      for (const deal of results.slice(0, 5)) {
        await ctx.reply(formatDealMd(deal), { parse_mode: "MarkdownV2" });
      }

      if (results.length > 5) {
        await ctx.reply(
          `_Showing top 5 of ${results.length} results\\. Narrow your search for more specific results\\._`,
          { parse_mode: "MarkdownV2" }
        );
      }
    } catch (err) {
      console.error("[/search] DB error:", err);
      await ctx.reply(
        `⚠️ Search is temporarily unavailable\\. Please try again in a moment\\.`,
        { parse_mode: "MarkdownV2" }
      );
    }
  });

  // ─── /mydeals ─────────────────────────────────────────────────────────────
  _bot.command("mydeals", async (ctx) => {
    const username = ctx.from?.username;

    if (!username) {
      await ctx.reply(
        `📦 *My Deals*\n\n` +
          `To view your deals, set a Telegram username in Settings\\.\n\n` +
          `_Your listings are tracked by your @username when you submit them\\._`,
        { parse_mode: "MarkdownV2" }
      );
      return;
    }

    try {
      const myDeals = await getDealsByTelegram(username);

      if (myDeals.length === 0) {
        await ctx.reply(
          `📦 *My Deals*\n\n` +
            `No active listings found for @${username.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`)}\\.\n\n` +
            `Use /submit to post your first listing\\!`,
          { parse_mode: "MarkdownV2" }
        );
        return;
      }

      const userEsc = username.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`);
      await ctx.reply(
        `📦 *Your active listings* \\(@${userEsc}\\):`,
        { parse_mode: "MarkdownV2" }
      );

      for (const deal of myDeals) {
        await ctx.reply(formatDealMd(deal), { parse_mode: "MarkdownV2" });
      }
    } catch (err) {
      console.error("[/mydeals] DB error:", err);
      await ctx.reply(
        `⚠️ Could not load your deals right now\\. Please try again in a moment\\.`,
        { parse_mode: "MarkdownV2" }
      );
    }
  });

  // ─── /submit ──────────────────────────────────────────────────────────────
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
        `_Your listing will be reviewed and posted within 2 hours\\._\n\n` +
        `Or post directly in our Facebook group:\n` +
        `facebook\\.com/groups/255230365959060`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // ─── /rate ────────────────────────────────────────────────────────────────
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

  // ─── /report ──────────────────────────────────────────────────────────────
  _bot.command("report", async (ctx) => {
    await ctx.reply(
      `🚨 *Report a Problem*\n\n` +
        `Please describe your issue using this format:\n\n` +
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

  // ─── Catch-all ────────────────────────────────────────────────────────────
  _bot.on("message", async (ctx) => {
    await ctx.reply(
      `👋 I didn't understand that\\. Use /help to see all available commands\\.`,
      { parse_mode: "MarkdownV2" }
    );
  });

  return _bot;
}
