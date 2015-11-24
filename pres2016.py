from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps
from bson.son import SON

app = Flask(__name__)

# MongoDB Config

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'twit-candi'
COLLECTION_NAME = 'tweets'

# Queries for the MongoDB Pipeline
# Using MongoDB Pipeline to aggregate tweets

# just returns everything - for testing
FIELDS = {'text': True, 'tc_cand': True, 'tc_cat': True, 'tc_text': True, 'tc_date': True, 'created_at': True }

# count of twitter mentions by candidate by hour
hourly = [  { "$match": { 
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

# count of twitter mentions by candidate by hour, including all hashtags used
hourlyWithHashTags = [  { "$match": { 
                              "tc_cat" : "mentions"
                        }},
                        {"$project": {
                          "entities.hashtags.text" : 1,
                          "user.screen_name" : 1,
                          "tc_cand" : 1,
                          "created_at2" : 1
                        }},
                        {"$project": {
                          "tags" : "$entities.hashtags.text",
                          "users" : "$user.screen_name",
                          "tc_cand" : 1,
                          "created_at2" : 1
                        }},
                        { "$group" : {
                            "_id" : {
                              "year"  : { "$year": "$created_at2"},
                              "month" : { "$month": "$created_at2" },        
                              "day"   : { "$dayOfMonth": "$created_at2" },
                              "hour"  :  { "$hour": "$created_at2"},
                              "tc_cand"  :  "$tc_cand"
                              },
                            "count" : { "$sum" : 1 },
                            "tags" : { "$push" : "$tags" },
                            "users" : { "$push" : "$users" }
                        }}
                    ]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/twit-candi/test")
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

@app.route("/twit-candi/tags")
def tags():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    tweets = collection.aggregate(hourlyWithHashTags)
    json_tweets = []
    for tweet in tweets:
        json_tweets.append(tweet)
    json_tweets = json.dumps(json_tweets, default=json_util.default)
    connection.close()
    return json_tweets

if __name__ == "__main__":
    app.run()	

# app.run(host='0.0.0.0',port=5000,debug=True)
