echo 'Installing backend dependencies';
npm install

echo 'Installing front end dependencies'
cd frontend/
npm install

echo 'Building front end';
npm run build;

cd ..
echo 'Starting app and api';
npm rebuild node-sass
pm2-docker process.yml