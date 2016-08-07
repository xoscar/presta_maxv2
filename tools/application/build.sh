echo 'Building JavaScript...';\
prod="";
if [ "$1" = "prod" ]
then
	prod="-p"
fi

node node_modules/webpack/bin/webpack.js $prod ./public/app/admin.js ./public/js/admin.module.js;\
node node_modules/webpack/bin/webpack.js $prod ./public/app/extra-forms.js ./public/js/extra-forms.module.js;\
node node_modules/webpack/bin/webpack.js $prod ./public/app/report.js ./public/js/report.module.js;\
node node_modules/webpack/bin/webpack.js $prod ./public/app/smart-search.js ./public/js/smart-search.module.js;\
node node_modules/webpack/bin/webpack.js $prod ./public/app/watch-list.js ./public/js/watch-list.module.js;\
echo 'Ready.'
