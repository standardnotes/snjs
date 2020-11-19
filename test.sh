# !/bin/bash

echo "Killing all containers"
docker-compose kill
echo "Removing all containers"
docker-compose rm -f
echo "Starting all containers"
docker-compose up -d
attempt=0
while [ $attempt -le 59 ]; do
    attempt=$(( $attempt + 1 ))
    echo "Waiting for Syncing Server to be up (attempt: $attempt)..."
    result=$(docker-compose logs syncing-server-ruby)
    if grep -q 'Starting Server' <<< $result ; then
        sleep 2 # for warmup
        echo "Syncing Server is up!"
        break
    fi
    sleep 2
done
echo "Starting Test Suite"
npx mocha-headless-chrome -f http://localhost:9001/test/test.html -t 600000
test_result=$?
echo "Killing all containers"
docker-compose kill

if [ $test_result == 0 ]
then
  exit 0
else
  exit 1
fi
