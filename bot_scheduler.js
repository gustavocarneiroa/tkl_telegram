const { Telegraf } = require('telegraf');
const schedule = require('node-schedule');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('telegram.db');
db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, message TEXT, type TEXT, options TEXT, correctOptionId INTEGER, explanation TEXT, sent BOOLEAN DEFAULT 0, send_at TEXT)');

function initBot(token, chatId) {
  const bot = new Telegraf(token);    
  // Agendando o envio da enquete para as 10:00 todos os dias
  schedule.scheduleJob('*/10 * * * * *', () => {
    // Busca as enquetes que ainda não foram enviadas e que possuem horário de envio anterior à hora atual
    const sql = "SELECT * FROM messages WHERE sent = 0 AND datetime(send_at) <= datetime('now', 'localtime')";
    db.all(sql, async (err, rows) => {
      if (err) return console.error(err.message);
      if(!rows[0]) return;
      
      console.log('Row found:', rows)
      const [{ id, type, message, options, correctOptionId, explanation }] = rows
      // Envia a enquete para cada linha retornada pela consulta
      const optionsArray = options?.split('|||') || [];

      const sendMessage = {
        text: sendText,
        quiz: sendQuiz
      }

      await sendMessage[type](bot, chatId, id, message, optionsArray, correctOptionId, explanation);
    });
  });
  
  bot.launch();
}

async function sendQuiz(bot, chatId, questionId, question, options, correctOptionId, explanation) {
  const quizOptions = {
    is_anonymous: true,
    type: 'quiz',
    correct_option_id: correctOptionId,
    explanation: explanation
  };
  const poll = await bot.telegram.sendQuiz(chatId, question, options, quizOptions);
  console.log('Enquete criada:', poll);
  // Atualiza a variável "sent" e "sent_at" no banco de dados
  db.run('UPDATE messages SET sent = 1 WHERE id = ?', [questionId]);
}


async function sendText(bot, chatId, messageId, message) {
  const text = await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
  console.log('Mensagem criada:', text);
  // Atualiza a variável "sent" e "sent_at" no banco de dados
  db.run('UPDATE messages SET sent = 1 WHERE id = ?', [messageId]);
}

module.exports = { initBot }