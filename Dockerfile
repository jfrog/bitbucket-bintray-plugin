FROM node:4.8.4

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Environment variables
ENV DATABASE_URL postgres://postgres:password@localhost:5432/jfrog
ENV NODE_ENV development

# Install app dependencies
COPY . /usr/src/app/

RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]
