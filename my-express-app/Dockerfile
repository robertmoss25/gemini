# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
# We do this first to leverage Docker's build cache
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (matching the port in server.js)
EXPOSE 3000

# Define the command to run the app
CMD [ "node", "server.js" ]
