FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy only package files first to use Docker cache
COPY package*.json ./

# Install dependencies with flags to prevent memory crashes
RUN npm install --no-audit --no-fund --loglevel=error

# Install global tools for your database migrations
RUN npm install -g sequelize-cli

# Copy the rest of your application code
COPY . .

# Expose the port your backend uses
EXPOSE 5003

# Start the application
CMD ["npm", "run", "dev"]
