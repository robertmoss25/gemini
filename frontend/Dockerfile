# Stage 1: Build the React application
FROM node:20-alpine as build-stage

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install axios react-table --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the application using a lightweight Nginx server
FROM nginx:stable-alpine as production-stage

# Copy the built files from the build-stage to the Nginx html directory
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose port 80 (Nginx default)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
