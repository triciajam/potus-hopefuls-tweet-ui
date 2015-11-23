#sudo apt-get update
#sudo apt-get install awscli
#cat /var/log/apache2/error.log

sudo apt-get install apache2
sudo apt-get install libapache2-mod-wsgi
sudo apt-get install python-pip
sudo apt-get install build-essential python-dev

sudo apt-get install git
sudo apt-get install postfix
sudo apt-get install mailutils

sudo pip install flask
sudo pip install pymongo

mkdir ~/pres2016
sudo ln -sT ~/pres2016 /var/www/html/pres2016

cd ~
aws s3 cp s3://twit-candi-ui/dist/000-default.conf .  --region us-east-1
sudo mv /etc/apache2/sites-enabled/000-default.conf /etc/apache2/sites-enabled/000-default.conf.orig 
sudo unlink /etc/apache2/sites-available/000-default.conf
sudo cp 000-default.conf /etc/apache2/sites-enabled/000-default.conf
sudo ln -s /etc/apache2/sites-enabled/000-default.conf /etc/apache2/sites-available/000-default.conf

sudo apachectl restart

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start

lsblk
sudo mkdir ~/db
sudo mkfs -t ext4 /dev/xvdf
sudo mount /dev/xvdf ~/db
cd ~/db
sudo mkdir data log
sudo chown -R mongodb:mongodb ~/db
lsblk
df -Th
du -sh ~/db/*

echo "* soft nofile 64000" | sudo tee --append /etc/security/limits.conf
echo "* hard nofile 64000" | sudo tee --append /etc/security/limits.conf
echo "* soft nproc 32000" | sudo tee --append /etc/security/limits.conf
echo "* hard nproc 32000" | sudo tee --append /etc/security/limits.conf
echo "* soft nproc 32000" | sudo tee --append /etc/security/limits.d/90-nproc.conf
echo "* hard nproc 32000" | sudo tee --append /etc/security/limits.d/90-nproc.conf
sudo blockdev --setra 32 /dev/xvdf

cd ~
aws s3 cp s3://twit-candi-ui/dist/tc_ui_mongod.conf . --region us-east-1
sudo mv /etc/mongod.conf /etc/mongod.conf.orig
sudo cp tc_ui_mongod.conf /etc/mongod.conf

sudo service mongod stop
sudo service mongod start

git clone https://github.com/triciajam/twit-candi-ui.git pres2016/

aws s3 cp s3://twit-candi-ui/dist/tc_ui_db_init.sh . --region us-east-1


aws s3 cp s3://twit-candi-ui/dist/tc_ui_cron . --region us-east-1
crontab tc_ui_cron
crontab -l

