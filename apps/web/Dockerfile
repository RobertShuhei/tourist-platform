FROM node:20-alpine
WORKDIR /app

# devDependencies を含めてインストール
COPY package*.json ./
RUN npm ci

# ソースをコピー
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]