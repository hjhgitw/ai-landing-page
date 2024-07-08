# Use the official Node.js image as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Define environment variables (optional)
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
ENV REDIRECT_URI=${REDIRECT_URI}
ENV YOUTUBE_CLIENT_ID=${YOUTUBE_CLIENT_ID}
ENV YOUTUBE_CLIENT_SECRET=${YOUTUBE_CLIENT_SECRET}

# Start the application
CMD ["npm", "start"]