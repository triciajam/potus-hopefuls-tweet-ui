sudo apt-get update
sudo apt-get install apache2
sudo apt-get install libapache2-mod-wsgi
sudo apt-get install python-pip
sudo apt-get install build-essential python-dev

sudo apt-get install git
sudo apt-get install awscli

sudo pip install flask

mkdir ~/pres2016
sudo ln -sT ~/pres2016 /var/www/html/pres2016
cd ~/pres2016

sudo apachectl restart

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

lsblk
sudo mkdir ~/db
sudo mount /dev/xvdf ~/db
cd db
mkdir data log
sudo chown mongod:mongod ~/db
lsblk
df -Th
du -sh ~/db/*

echo "* soft nofile 64000" >> /etc/security/limits.conf
echo "* hard nofile 64000" >> /etc/security/limits.conf
echo "* soft nproc 32000" >> /etc/security/limits.conf
echo "* hard nproc 32000" >> /etc/security/limits.conf
echo "* soft nproc 32000" >> /etc/security/limits.d/90-nproc.conf
echo "* hard nproc 32000" >> /etc/security/limits.d/90-nproc.conf
sudo blockdev --setra 32 /dev/xvdf

aws s3 cp s3://twit-candi-ui/dist/tc_ui_mongod.conf . --region us-east-1
mv tc_ui_mongod.conf /etc/mongod.conf

sudo service mongod start

aws s3 cp s3://twit-candi-ui/dist/tc_ui_cron . --region us-east-1
crontab tc_ui_cron
crontab -l
