echo 'Building web app for production...';\
webpack --env.NODE_ENV=production --env.apiUrl=https://limitless-refuge-52785.herokuapp.com
echo 'Ready.'