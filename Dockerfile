FROM node:5.9.0-wheezy

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY public /usr/src/app/public
COPY routes /usr/src/app/routes
COPY views /usr/src/app/views
COPY atlassian-connect.json /usr/src/app/
COPY config.json /usr/src/app/
COPY credentials.json /usr/src/app/
COPY LICENSE.txt /usr/src/app/
#COPY private-key.pem /usr/src/app/
#COPY public-key.pem /usr/src/app/
COPY Procfile /usr/src/app/
#COPY package.json /usr/src/app/
COPY app.js /usr/src/app/
#COPY node_modules /usr/src/app/


RUN npm install

# Bundle app source
#COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]
