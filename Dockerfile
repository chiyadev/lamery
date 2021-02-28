FROM node:lts-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile
RUN cp -R ./node_modules /tmp/node_modules
RUN yarn install --frozen-lockfile

ARG NEXT_PUBLIC_UMAMI_URL
ENV NEXT_PUBLIC_UMAMI_URL $NEXT_PUBLIC_UMAMI_URL

COPY . ./
RUN yarn build

FROM node:lts-alpine
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /tmp/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["yarn", "start"]
