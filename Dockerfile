FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install pm2 -g

# Bundle app source
COPY . . 

EXPOSE 8084 

# Run API with docker settings
CMD [ "npm", "run", "docker" ]