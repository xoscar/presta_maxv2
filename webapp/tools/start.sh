echo 'Installing dependencies';
npm i --only=prod

echo 'Starting APP';
pm2-docker ./process.yml
