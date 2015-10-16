from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps
from bson.son import SON

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'twit-candi'
COLLECTION_NAME = 'tweets'
FIELDS = {'text': True, 'tc_cand': True, 'tc_cat': True, 'tc_text': True, 'tc_date': True, 'created_at': True }

pipeline = [ {"$unwind": "$tags"},
             {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
             {"$sort": SON([("count", -1), ("_id", -1)])}
]
pipeline = [  { "$match": { 
                  "tc_cat" : "mentions"
              }},
              { "$group" : {
                  "_id" : {
                    "year"  : { "$year": "$created_at2"},
                    "month" : { "$month": "$created_at2" },        
                    "day"   : { "$dayOfMonth": "$created_at2" },
                    "hour"  :  { "$hour": "$created_at2"},
                    "tc_cand"  :  "$tc_cand"
                    },
                  "count": { "$sum" : 1 }
              }}
           ]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/twit-candi/tw")
def donorschoose_projects():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    projects = collection.find(projection=FIELDS)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    return json_projects

@app.route("/twit-candi/ag")
def tweetByHoursCand():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    tweets = collection.aggregate(pipeline)
    json_tweets = []
    for tweet in tweets:
        json_tweets.append(tweet)
    json_tweets = json.dumps(json_tweets, default=json_util.default)
    connection.close()
    return json_tweets

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)
