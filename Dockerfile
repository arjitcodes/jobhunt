# --- Stage 1: Build ---
# Upgraded to Node 22 to support the --env-file flag
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build (runs your "tsc" command)
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:22-alpine

WORKDIR /app

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the compiled JS from the builder
COPY --from=builder /app/dist ./dist

# Create the uploads directory so Multer has a place to write
RUN mkdir -p public/uploads

# Expose your backend port
EXPOSE 5000

# Run the app. 
# We run node directly instead of 'npm start' because Docker Compose 
# will handle injecting the environment variables for us natively!
CMD ["node", "dist/index.js"]