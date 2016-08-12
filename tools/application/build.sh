echo 'Building JavaScript...';\
prod="";
if [ "$1" = "prod" ]
then
	prod="-p"
fi
webpack $prod frontend/app.js public/js/index.js
echo 'Ready.'
