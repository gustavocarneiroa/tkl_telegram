const Polls = require('../controllers/polls');

module.exports = (app) => {
    app.get('/', Polls.index);
    app.post('/quiz', Polls.insertQuiz);
    app.post('/message', Polls.insertMessage);
    app.get('/delete/:id', Polls.delete);
}