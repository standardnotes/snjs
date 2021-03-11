# !/bin/bash

echo "# Installing project dependecies (Host Machine)"
yarn install --pure-lockfile

function cleanup {
  echo "# Killing all containers"
  docker-compose kill
  echo "# Removing all containers"
  docker-compose rm -vf
}

cleanup

echo "# Pulling latest versions"
docker-compose pull

echo "# Building Docker images"
docker-compose build

echo "# Starting all containers for Test Suite"
docker-compose up -d

attempt=0
while [ $attempt -le 239 ]; do
    attempt=$(( $attempt + 1 ))
    echo "# Waiting for all services to be up (attempt: $attempt)..."
    result=$(docker-compose logs api-gateway)
    if grep -q 'Server started on port' <<< $result ; then
        sleep 2 # for warmup
        echo "#All services are up!"
        break
    fi
    sleep 2
done

attempt=0
while [ $attempt -le 119 ]; do
    attempt=$(( $attempt + 1 ))
    echo "# Waiting for Test Server to be up (attempt: $attempt)..."
    result=$(docker-compose logs snjs)
    if grep -q 'Test Server Started' <<< $result ; then
        echo "# Test Server Started is up!"
        break
    fi
    sleep 2
done

echo "# Starting Test Suite"
npx mocha-headless-chrome --timeout 1200000 -f http://localhost:9001/test/test.html
test_result=$?

cleanup

if [ $test_result == 0 ]
then
  exit 0
else
  exit 1
fi
