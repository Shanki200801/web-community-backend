# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the Docker image
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 5000 for the application
EXPOSE 5000

# Define environment variables
ENV MONGO_USER=user
ENV MONGO_PASSWORD=user

# Define the command to run the application
CMD [ "node", "app.js" ]