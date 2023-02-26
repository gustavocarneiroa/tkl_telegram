call npm install
call npm install -g pm2
call copy .env.example .env
call New-Item telegram.db
call pm2 start index.js