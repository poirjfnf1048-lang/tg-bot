const BOT_TOKEN = "8856508899:AAF7ddqsSTPw3cjkMgHn3jE0vfgKfiVMEg0";

let adminId = null;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  try {
    const message = req.body?.message;
    if (!message) return res.status(200).send("OK");

    const chatId = message.chat.id.toString();

    if (message.text === "/admin") {
      adminId = chatId;
      await callTelegram("sendMessage", {
        chat_id: chatId,
        text: "✅ 已成功绑定此账号为管理员！\n你的大号 ID 是：" + chatId + "\n以后别人发给机器人的消息都会直接转发到这里。",
      });
      return res.status(200).send("OK");
    }

    if (!adminId) {
      await callTelegram("sendMessage", {
        chat_id: chatId,
        text: "⚠️ 机器人尚未绑定管理员，请用你的大号发送 /admin 完成绑定。",
      });
      return res.status(200).send("OK");
    }

    if (chatId === adminId && message.reply_to_message) {
      const forwardFrom = message.reply_to_message.forward_from;
      if (forwardFrom) {
        await callTelegram("copyMessage", {
          chat_id: forwardFrom.id,
          from_chat_id: adminId,
          message_id: message.message_id,
        });
      }
      return res.status(200).send("OK");
    }

    if (chatId !== adminId) {
      await callTelegram("forwardMessage", {
        chat_id: adminId,
        from_chat_id: chatId,
        message_id: message.message_id,
      });
    }
  } catch (e) {
    console.error(e);
  }

  return res.status(200).send("OK");
}

async function callTelegram(method, body) {
  return fetch(`https://telegram.org{BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
