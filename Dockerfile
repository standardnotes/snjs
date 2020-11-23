FROM node:14.15.1-alpine

ARG UID=1001
ARG GID=1001

RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++

RUN addgroup -S snjs -g $GID && adduser -D -S snjs -G snjs -u $UID

WORKDIR /var/www

RUN chown -R $UID:$GID .

USER snjs

COPY --chown=$UID:$GID package.json package-lock.json /var/www/

RUN npm ci

USER root
RUN apk del build-dependencies
USER snjs

COPY --chown=$UID:$GID . /var/www

RUN npm run bundle

EXPOSE 9001

CMD [ "npm", "run", "start:test-server" ]
