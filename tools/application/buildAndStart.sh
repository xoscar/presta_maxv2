echo 'Building app...';
ls;
npm i;

cd frontend;

echo 'Installing front end dependencies...';
npm i;

echo 'Building front end';
npm run build;

cd ..;

echo 'Starting APP and API';
npm run start;

echo 'Finished';
