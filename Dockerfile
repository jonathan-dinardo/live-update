FROM node:14
MAINTAINER Jonathan Di Nardo
COPY . /
RUN chmod +x entrypoint.sh
RUN npm install --no-optional && npm cache clean --force && npm run-script build
ENTRYPOINT ["sh", "entrypoint.sh"]
