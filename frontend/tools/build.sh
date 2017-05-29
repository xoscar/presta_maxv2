echo 'Building JavaScript...';\
prod="";
if [ "$1" = "prod" ]
then
	prod="-p"
fi
webpack $prod
echo 'Ready.'