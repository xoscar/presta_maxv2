echo 'Building front end';
cd frontend/
npm run build;

cd ..
echo 'Starting app and api';
npm rebuild node-sass
pm2-docker process.yml