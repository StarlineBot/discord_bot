REPOSITORY=/home/ubuntu/build

cd $REPOSITORY

sudo npm install
sudo pm2 restart ecosystem.config.js