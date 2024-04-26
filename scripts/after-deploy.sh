REPOSITORY=/home/ubuntu/project/discor_bot

cd $REPOSITORY

sudo npm install
sudo pm2 start ecosystem.config.js