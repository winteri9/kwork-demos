var TELEGRAM_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
var CHAT_ID = 'YOUR_CHAT_ID';

function doPost(e) {
  try {
    var raw = e && e.postData ? e.postData.contents : '';
    var data = JSON.parse(raw || '{}');
    var name = String(data.name || '').trim();
    var phone = String(data.phone || '').trim();
    var service = String(data.service || '').trim();

    if (!name || !phone) {
      return jsonResponse({ ok: false, error: 'Имя и телефон обязательны' });
    }

    var text = '<b>Новая заявка с сайта</b>\n' +
      '<b>Имя:</b> ' + escapeHtml(name) + '\n' +
      '<b>Телефон:</b> ' + escapeHtml(phone) + '\n' +
      '<b>Услуга:</b> ' + escapeHtml(service || 'не указана') + '\n' +
      '<b>Время:</b> ' + escapeHtml(String(data.createdAt || new Date().toISOString()));

    var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      muteHttpExceptions: true
    });

    var status = response.getResponseCode();
    if (status !== 200) {
      return jsonResponse({ ok: false, error: 'Telegram API вернул ' + status });
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
