FROM node:16-alpine

ARG USERNAME=snjs
ARG UID=1001
ARG GID=$UID

RUN apk --no-cache --virtual build-dependencies add \
    python3 \
    make \
    g++

RUN addgroup -S $USERNAME -g $GID && adduser -D -S $USERNAME -G $USERNAME -u $UID

WORKDIR /var/www

RUN chown -R $UID:$GID .

USER $USERNAME

COPY --chown=$UID:$GID . /var/www

RUN yarn install --immutable

RUN yarn build

EXPOSE 9001

ENTRYPOINT [ "docker/entrypoint.sh" ]

CMD [ "start-web" ]
