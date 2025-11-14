FROM node:20-alpine

WORKDIR /app

# Necesario para bcrypt / dependencias nativas
RUN apk add --no-cache bash python3 make g++ openssl

# Copiar definiciones de dependencias
COPY package*.json ./

# Instalar dependencias en modo producción
RUN npm install --production

# Copiar el resto del código
COPY . .

EXPOSE 4000

CMD ["node", "src/server.js"]
