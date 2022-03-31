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

COPY --chown=$UID:$GID package.json yarn.lock /var/www/

COPY --chown=$UID:$GID packages/analytics/package.json /var/www/packages/analytics/package.json
COPY --chown=$UID:$GID packages/auth/package.json /var/www/packages/auth/package.json
COPY --chown=$UID:$GID packages/common/package.json /var/www/packages/common/package.json
COPY --chown=$UID:$GID packages/components/package.json /var/www/packages/components/package.json
COPY --chown=$UID:$GID packages/config/package.json /var/www/packages/config/package.json
COPY --chown=$UID:$GID packages/domain-events-infra/package.json /var/www/packages/domain-events-infra/package.json
COPY --chown=$UID:$GID packages/domain-events/package.json /var/www/packages/domain-events/package.json
COPY --chown=$UID:$GID packages/encryption/package.json /var/www/packages/encryption/package.json
COPY --chown=$UID:$GID packages/features/package.json /var/www/packages/features/package.json
COPY --chown=$UID:$GID packages/filepicker/package.json /var/www/packages/filepicker/package.json
COPY --chown=$UID:$GID packages/models/package.json /var/www/packages/models/package.json
COPY --chown=$UID:$GID packages/payloads/package.json /var/www/packages/payloads/package.json
COPY --chown=$UID:$GID packages/responses/package.json /var/www/packages/responses/package.json
COPY --chown=$UID:$GID packages/services/package.json /var/www/packages/services/package.json
COPY --chown=$UID:$GID packages/settings/package.json /var/www/packages/settings/package.json
COPY --chown=$UID:$GID packages/sncrypto-common/package.json /var/www/packages/sncrypto-common/package.json
COPY --chown=$UID:$GID packages/sncrypto-node/package.json /var/www/packages/sncrypto-node/package.json
COPY --chown=$UID:$GID packages/sncrypto-web/package.json /var/www/packages/sncrypto-web/package.json
COPY --chown=$UID:$GID packages/snjs/package.json /var/www/packages/snjs/package.json
COPY --chown=$UID:$GID packages/time/package.json /var/www/packages/time/package.json
COPY --chown=$UID:$GID packages/utils/package.json /var/www/packages/utils/package.json

RUN yarn install --pure-lockfile

COPY --chown=$UID:$GID . /var/www

RUN yarn build

EXPOSE 9001

ENTRYPOINT [ "docker/entrypoint.sh" ]

CMD [ "start-web" ]
