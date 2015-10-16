#!/bin/bash

DB="twit-candi"
COLL="tweets"
DATA_PATH="download"
LOG_PATH="log"

echo ">> $datetime [ TC-DB-UPDATE ] : *****************************************"
echo ">> $datetime [ TC-DB-UPDATE ] : Starting Update"
echo ">> $datetime [ TC-DB-UPDATE ] : *****************************************"

cd /Users/triciajam/Documents/Projects/twit-candi-ui

# date in UTC - this is folder in AWS
dateonly=$(date -u '+%Y%m%d');
datetime=$(date '+%Y-%m-%d-%H-%M-%S');

mkdir -p ./${DATA_PATH}/${dateonly}

echo "** $datetime [ TC-DB-UPDATE ] : Copying new data files from S3"
{ 
  /usr/local/bin/aws s3 sync s3://twit-candi-2016/data/$dateonly/ $DATA_PATH/$dateonly/ --exclude '*.json' --exclude '*.py' > ./${LOG_PATH}/${datetime}-aws-sync 2>&1
  
} && {
  numdownload=`cat ./${LOG_PATH}/${datetime}-aws-sync | wc -l | xargs`
  echo "** $datetime [ TC-DB-UPDATE ] : SUCCESS : $numdownload files downloaded from AWS."
} || {
  echo "** $datetime [ TC-DB-UPDATE ] : ERROR : Some files not downloaded from AWS."
} 

# get list of files just downloaded from aws
#chour=`date +"%H"`
#cdate=`date +"%Y-%m-%d"`
#newfiles=`find ${DATA_PATH}/*/* -type f -newerct "${cdate} ${chour}:00:00"`
#newfiles=( `find ${DATA_PATH}/*/* -type f -newerct "${cdate} ${chour}:00:00"` )

# this is date 25 mins ago - get everything after that
cdate=`TZ='UTC+0:25' date`
#cdate=`TZ='UTC+03:00' date`
newfiles=( `find ${DATA_PATH}/*/* -type f -newerct "${cdate}"` )
echo "** $datetime [ TC-DB-UPDATE ] : There are ${#newfiles[@]} new files on file system."

echo "** $datetime [ TC-DB-UPDATE ] : Inserting new data files into mongoDB"
beforedocs=`/usr/local/bin/mongo $DB --eval 'db.tweets.find().count();' | grep "^[0-9]*$"` 
echo "** $datetime [ TC-DB-UPDATE ] : BEFORE : There are $beforedocs docs currently in DB."
for f in ${newfiles[@]}; do 
{ 
  /usr/local/bin/mongoimport -d $DB -c $COLL --type json --file $f > ${LOG_PATH}/${datetime}-mongo-import-log 2>&1; 
} && { 
  echo $f >> ${LOG_PATH}/${datetime}-mongo-import-ok; 
} || { 
  echo $f >>  ${LOG_PATH}/${datetime}-mongo-import-err; 
} 
done 

ok=` cat ${LOG_PATH}/${datetime}-mongo-import-ok | wc -l | xargs`
if [ -e ${LOG_PATH}/${datetime}-mongo-import-err ]; then
  err=` cat ${LOG_PATH}/${datetime}-mongo-import-err | wc -l | xargs`;
else
  err=-1;
fi  

if [[ $err -le 0 ]]; then
  echo "** $datetime [ TC-DB-UPDATE ] : SUCCESS: Inserted $ok new files, 0 errors.";
else
  echo "** $datetime [ TC-DB-UPDATE ] : ERROR: Inserted $ok new files, $err errors.";
fi
afterdocs=`/usr/local/bin/mongo $DB --eval 'db.tweets.find().count();' | grep "^[0-9]*$"` 
docsadded=$(( afterdocs - beforedocs ))
echo "** $datetime [ TC-DB-UPDATE ] : AFTER : There were $docsadded docs added to DB."
echo "** $datetime [ TC-DB-UPDATE ] : AFTER : There are $afterdocs docs currently in DB."

echo "** $datetime [ TC-DB-UPDATE ] : Updating docs with created_at2."
beforedates=`/usr/local/bin/mongo $DB --eval 'db.tweets.find({ "created_at2" : { $exists:true }}).count();' | grep "^[0-9]*$" `
echo "** $datetime [ TC-DB-UPDATE ] : BEFORE : $beforedates docs have created_at2 date."
{
  /usr/local/bin/mongo < mongo_hourly.js > ${LOG_PATH}/${datetime}-mongo-date-fix
} && {
  echo "** $datetime [ TC-DB-UPDATE ] : SUCCESS : Mongo Date Fix Completed."
} || {
  echo "** $datetime [ TC-DB-UPDATE ] : ERROR : Mondo Date Fix Did Not Complete."
} 
afterdates=`/usr/local/bin/mongo $DB --eval 'db.tweets.find({ "created_at2" : { $exists:true }}).count();' | grep "^[0-9]*$" `
echo "** $datetime [ TC-DB-UPDATE ] : AFTER : $afterdates docs have created_at2 date."

numdocs=`/usr/local/bin/mongo $DB --eval 'db.tweets.find().count();' | grep "^[0-9]*$"` 
echo "** $datetime [ TC-DB-UPDATE ] : There are $numdocs docs currently in DB."
