# !/bin/bash

function setup {
  echo "# Copying the sample configuration files"
  cp docker/api-gateway.env.sample docker/api-gateway.env
  cp docker/auth.env.sample docker/auth.env
  cp docker/syncing-server-js.env.sample docker/syncing-server-js.env

  echo "# Installing project dependecies (Host Machine)"
  yarn install --pure-lockfile
}

function cleanup {
  local output_logs=$1
  if [ $output_logs == 1 ]
  then
    echo "Outputing last 100 lines of logs"
    docker-compose logs --tail=100
  fi
  echo "# Killing all containers"
  docker-compose kill
  echo "# Removing all containers"
  docker-compose rm -vf
}

function startContainers {
  echo "# Pulling latest versions"
  docker-compose pull

  echo "# Building Docker images"
  docker-compose build

  echo "# Starting all containers for Test Suite"
  docker-compose up -d
}

function waitForServices {
  attempt=0
  while [ $attempt -le 239 ]; do
      attempt=$(( $attempt + 1 ))
      echo "# Waiting for all services to be up (attempt: $attempt) ..."
      result=$(docker-compose logs api-gateway)
      if grep -q 'Server started on port' <<< $result ; then
          sleep 2 # for warmup
          echo "# All services are up!"
          break
      fi
      sleep 2
  done
}

setup
cleanup 0
startContainers
waitForServices

echo "# Starting test suite ..."
cd packages/snjs
npm run test
test_result=$?

cleanup $test_result

if [ $test_result == 0 ]
then
  exit 0
else
  exit 1
fi
