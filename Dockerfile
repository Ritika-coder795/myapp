FROM node:18

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Create new user
RUN useradd -m appuser

# Change ownership of app folder
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["npm", "start"]
