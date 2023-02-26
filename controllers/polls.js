const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('telegram.db');

const Polls = {
    async index(req, res) {
        await db.all('SELECT * FROM messages', (err, rows) => { 
            const messages = rows.map(row => {
                return {
                    ...row,
                    options: row?.options?.split('|||').map((option, index) => { return { option, correct_option: row.correctOptionId === index } }),
                    send_at: { date: row.send_at.split(' ')[0].split('-').reverse().join('/'), time: row.send_at.split(' ')[1] }
                }
            });

            res.render('index', { 
                title: 'Minha página',
                messages
            });
        })
    },
    async insertQuiz(req, res) {
        const { quizQuestion, options, quizCorrectOption, quizExplanation, send_at_date, send_at_time  } = req.body;
        await db.run(
            `INSERT INTO messages (message, type, options, correctOptionId, explanation, send_at) VALUES (?, ?, ?, ?, ?, ?)`, 
            [quizQuestion, 'quiz', options.join('|||'), quizCorrectOption - 1, quizExplanation, `${send_at_date} ${send_at_time}:00`]
        );

        res.redirect('/');
    },

    async insertMessage(req, res) {
        const { message, send_at_date, send_at_time  } = req.body;
        const formatedMessage = message.replace(/<p[^>]*>|<\/p>/g, '').replace(/<span[^>]*>|<\/span>/g, '').replace(/(<br\s*\/?>)+/g, '\r\n');
          
        await db.run(
            `INSERT INTO messages (message, type, send_at) VALUES (?, ?, ?)`, 
            [decodeHtmlEntities(formatedMessage), 'text', `${send_at_date} ${send_at_time}:00`]
        );

        res.redirect('/');
    },
    update(req, res){

    },
    delete(req, res) {
        const { id } = req.params;
        db.run('DELETE FROM messages WHERE id = ?', [id]);
        console.log('Excluído Message de ID ', id);
        res.redirect('/');
    }
}

function decodeHtmlEntities(str) {
    const entities = {
      '&aacute;': 'á',
      '&agrave;': 'à',
      '&acirc;': 'â',
      '&atilde;': 'ã',
      '&eacute;': 'é',
      '&egrave;': 'è',
      '&ecirc;': 'ê',
      '&iacute;': 'í',
      '&igrave;': 'ì',
      '&icirc;': 'î',
      '&otilde;': 'õ',
      '&ocirc;': 'ô',
      '&oacute;': 'ó',
      '&uacute;': 'ú',
      '&ucirc;': 'û',
      '&ccedil;': 'ç',
      '&nbsp;': ' ',
      '&rsquo;': '\'',
      '&ldquo;': '"',
      '&rdquo;': '"'
    };
  
    return str.replace(/&[a-z]+;/g, entity => {
      return entities[entity] || entity;
    });
}  

module.exports = Polls