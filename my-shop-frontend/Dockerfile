FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

# Clean install of frontend dependencies
RUN npm install

COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite with --host to allow external access from the browser
CMD ["npm", "run", "dev", "--", "--host"]