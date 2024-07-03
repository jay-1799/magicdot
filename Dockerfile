# Stage 1: Build Node.js application
FROM node:14-alpine

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json to the working directory.
COPY package.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application files to the working directory.
COPY . .

# Build the Node.js application.
# RUN npm run build



# Expose the ports for Node.js and MongoDB (if applicable).
EXPOSE 3000

# Command to start your Node.js application and MongoDB.
CMD ["node", "app.js"]