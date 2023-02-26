const express = require('express');
const { initBot } = require('./bot_scheduler');
const initRoutes = require('./routes')
const bodyParser = require('body-parser')
require('dotenv').config();

const token = process.env.TOKEN;
const chatId = Number(process.env.CHAT_ID);

initBot(token, chatId);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

initRoutes(app);

// Iniciando o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});