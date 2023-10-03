FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install pm2 -g

# Bundle app source
COPY . . 

#build gui inside /gui folder, then copy it to publig measurify folder
RUN cd gui && npm install && npm run build && cp -r ./build/* ../public/ && cd ..

EXPOSE 8084 

# Run API with docker settings
CMD [ "npm", "run", "docker" ]