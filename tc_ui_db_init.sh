#!/bin/bash

DB="twit-candi"
COLL="tweets"
DATA_PATH="download"
LOG_PATH="log"

echo ">> $datetime [ TC-DB-INIT ] : *****************************************"
echo ">> $datetime [ TC-DB-INIT ] : DB Initialization"
echo ">> $datetime [ TC-DB-INIT ] : *****************************************"

cd /home/ubuntu/pres2016

# date in UTC - this is folder in AWS
#dateonly=$(date -u '+%Y%m%d');
datetime=$(date '+%Y-%m-%d.%H-%M-%S');
timestart=`date`;
#aws s3 sync s3://twit-candi-2016/data download/ --exclude "*" --include "*20151117*" --region us-east-1

mkdir -p ${DATA_PATH}
mkdir -p ${LOG_PATH}

daysago=3
for d in $( seq 0 $daysago); do
  dateonly=$(date --date="$d day ago" -u '+%Y%m%d');
  mkdir -p ./${DATA_PATH}/${dateonly}
  
  echo "** $datetime [ TC-DB-INIT ] : Copying new data files from S3 for $dateonly "
  { 
    #/usr/local/bin/
    aws s3 sync s3://twit-candi-2016/data/$dateonly/ $DATA_PATH/$dateonly/ --exclude '*.json' --exclude '*.py' --region us-east-1 > ./${LOG_PATH}/${datetime}-aws-sync 2>&1
  } && {
    downloadok=`cat ./${LOG_PATH}/${datetime}-aws-sync | grep "download: " | wc -l | xargs`
    echo "** $datetime [ TC-DB-INIT ] : SUCCESS : $downloadok files downloaded from AWS, no errors."
  } || {
    downloadok=`cat ./${LOG_PATH}/${datetime}-aws-sync | grep "download: " | wc -l | xargs`
    downloadbad=`cat ./${LOG_PATH}/${datetime}-aws-sync | grep "download failed: " | wc -l | xargs`
    echo "** $datetime [ TC-DB-INIT ] : ERROR : $downloadok files downloaded from AWS, $downloadbad errors."
  } 
done


#cdate=`TZ='UTC+0:20' date`
#cdate=`TZ='UTC+03:00' date` # this would be 3 hours ago
#timestart=`TZ='UTC+03:00' date` # this would be 3 hours ago
#timestart=`TZ='UTC+012:00' date` # this would be 12 hours ago
newfiles=( `find ${DATA_PATH}/*/* -type f -newerct "${timestart}"` )
#echo ${#newfiles[@]

if [[ "${#newfiles[@]}" -ne 0 ]]; then

  echo "** $datetime [ TC-DB-INIT ] : There are ${#newfiles[@]} new files on file system."
  echo "** $datetime [ TC-DB-INIT ] : Inserting new data files into mongoDB."
  
  #beforedocs=`/usr/local/bin/mongo $DB --eval 'db.tweets.find().count();' | grep "^[0-9]*$"` 
  beforedocs=`mongo $DB --eval 'db.tweets.find().count();' | grep "^[0-9]*$"` 
  echo "** $datetime [ TC-DB-INIT ] : BEFORE : There are $beforedocs docs currently in DB."
  for f in ${newfiles[@]}; do 
  { 
    #/usr/local/bin/mongoimport -d $DB -c $COLL --type json --file $f >> ${LOG_PATH}/${datetime}-mongo-import-log 2>&1; 
    mongoimport -d $DB -c $COLL --type json --file $f >> ${LOG_PATH}/${datetime}-mongo-import-log 2>&1; 
  } && { 
    echo $f >> ${LOG_PATH}/${datetime}-mongo-import-ok; 
  } || { 
    echo $f >>  ${LOG_PATH}/${datetime}-mongo-import-err; 
  } 
  done 
  
  if [ -e ${LOG_PATH}/${datetime}-mongo-import-ok ]; then
    ok=` cat ${LOG_PATH}/${datetime}-mongo-import-ok | wc -l | xargs`
  else
    ok=0;
  fi  
  if [ -e ${LOG_PATH}/${datetime}-mongo-import-err ]; then
    err=` cat ${LOG_PATH}/${datetime}-mongo-import-err | wc -l | xargs`;
  else
    err=0;
  fi  
  
  if [[ $err -le 0 ]]; then
    echo "** $datetime [ TC-DB-INIT ] : SUCCESS: Inserted $ok new files, 0 errors.";
  else
    echo "** $datetime [ TC-DB-INIT ] : ERROR: Inserted $ok new files, $err errors.";
  fi
  #afterdocs=`/usr/local/bin/mongo $DB --eval 'db.tweets.find().count();' | grep "^[0-9]*$"` 
  afterdocs=`mongo $DB --eval 'db.tweets.find().count();' | grep "^[0-9]*$"` 
  docsadded=$(( afterdocs - beforedocs ))
  echo "** $datetime [ TC-DB-INIT ] : AFTER : There were $docsadded docs added to DB."
  echo "** $datetime [ TC-DB-INIT ] : AFTER : There are $afterdocs docs currently in DB."
  
  if [[ $ok -gt 0 ]]; then
    
    echo "** $datetime [ TC-DB-INIT ] : Updating docs with created_at2."
    beforedates=`mongo $DB --eval 'db.tweets.find({ "created_at2" : { $exists:true }}).count();' | grep "^[0-9]*$" `
    echo "** $datetime [ TC-DB-INIT ] : BEFORE : $beforedates docs have created_at2 date."
    {
      #/usr/local/bin/mongo < mongo_hourly.js 
      mongo < mongo_hourly.js 
    } && {
      echo "** $datetime [ TC-DB-INIT ] : SUCCESS : Mongo Date Fix Completed."
    } || {
      echo "** $datetime [ TC-DB-INIT ] : ERROR : Mondo Date Fix Did Not Complete."
    } 
    afterdates=`mongo $DB --eval 'db.tweets.find({ "created_at2" : { $exists:true }}).count();' | grep "^[0-9]*$" `
    echo "** $datetime [ TC-DB-INIT ] : AFTER : $afterdates docs have created_at2 date.";
    numdocs=`mongo $DB --eval 'db.tweets.find().count();' | grep "^[0-9]*$"` 
    echo "** $datetime [ TC-DB-INIT ] : There are $numdocs docs currently in DB.";
  fi

else

  echo "** $datetime [ TC-DB-INIT ] : There are zero (${#newfiles[@]}) new files on file system.  No files added to mongoDB."
  
fi

#timeend=`date`;
#echo "$timeend" > lastdownloadtime