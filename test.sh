# !/bin/bash

echo "# Installing project dependecies (Host Machine)"
yarn install --pure-lockfile

function cleanup {
  echo "# Killing all containers"
  docker-compose kill
  echo "# Removing all containers"
  docker-compose rm -f
}

[ -n "${SYNCING_SERVER_VERSION}" ] || SYNCING_SERVER_VERSION=$1 && shift 1

if [ -z "$SYNCING_SERVER_VERSION" ];
then
  echo "Syncing Server version is missing."
  exit 1
fi

if [ "$SYNCING_SERVER_VERSION" != "js" ] && [ "$SYNCING_SERVER_VERSION" != "ruby" ];
then
  echo "Please put ruby or js (lowercase) as an argument."
  exit 1
fi

cleanup

export NGINX_REROUTE_HOST="http://syncing-server-$SYNCING_SERVER_VERSION"

echo "# Pulling latest versions"
docker-compose pull

echo "# Building Docker images"
docker-compose build

echo "# Starting all containers for $SYNCING_SERVER_VERSION Test Suite"
docker-compose up -d

attempt=0
while [ $attempt -le 59 ]; do
    attempt=$(( $attempt + 1 ))
    echo "# Waiting for Syncing Server Ruby to be up (attempt: $attempt)..."
    result=$(docker-compose logs syncing-server-ruby)
    if grep -q 'Starting Server' <<< $result ; then
        sleep 2 # for warmup
        echo "# Syncing Server Ruby is up!"
        break
    fi
    sleep 2
done

if [ $SYNCING_SERVER_VERSION == "js" ]
then
  attempt=0
  while [ $attempt -le 59 ]; do
      attempt=$(( $attempt + 1 ))
      echo "# Waiting for Syncing Server JS to be up (attempt: $attempt)..."
      result=$(docker-compose logs syncing-server-js)
      if grep -q 'Server started' <<< $result ; then
          sleep 2 # for warmup
          echo "# Syncing Server JS is up!"
          break
      fi
      sleep 2
  done
fi

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

echo "# Starting $SYNCING_SERVER_VERSION Test Suite"
npx mocha-headless-chrome --timeout 1200000 -f http://localhost:9001/test/test.html
test_result=$?

cleanup

if [ $test_result == 0 ]
then
  exit 0
else
  exit 1
fi
