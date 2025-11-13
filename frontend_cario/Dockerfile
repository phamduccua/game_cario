
# Step 1: node base image
FROM node:18-alpine

# Step 2: working directory
WORKDIR /app

# Step 3: copy package.json & lock file
COPY package*.json ./

# Step 4: install dependencies
RUN npm install --production=false

# Step 5: copy source code
COPY . .

# Step 6: build Next.js
RUN npm run build

# Step 7: expose port
EXPOSE 5005

# Step 8: run production server
CMD ["npm", "run", "start"]