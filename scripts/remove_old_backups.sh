#!/bin/bash
for f in ~/archives/*
do
  FILE_DATE=$(echo $f | grep -Eo "[[:digit:]]{4}-[[:digit:]]{2}-[[:digit:]]{2}")

  EXPIRY=$(echo $f |grep -Eo "exp\-[[:digit:]]*" |grep -Eo "[[:digit:]]*")
  DAYS_SINCE=$(( ( $(date -ud '' +'%s') - $(date -ud $FILE_DATE +'%s') )/60/60/24 ))
  if [ "$DAYS_SINCE" -gt "$EXPIRY" ]
  then
    rm $f
  fi
done
