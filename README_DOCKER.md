# Docker Deployment Guide for Student Mentorship Social Network

## Prerequisites

- Docker Engine 20.10+ 
- Docker Compose V2
- At least 4GB RAM available for containers
- At least 10GB disk space

## Quick Start

### 1. Clone and Navigate to Project
```bash
cd Student-Mentorship-Social-Network-with-AI-and-Neuromorship-Learning
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example server/.env

# Edit with your settings (optional - defaults work for local development)
nano server/.env
```

### 3. Start All Services
```bash
# Build and start all containers
docker compose up -d

# View logs
docker compose logs -f
```

### 4. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main web application |
| Backend API | http://localhost:3001 | FastAPI backend |
| API Docs | http://localhost:3001/docs | Swagger documentation |
| Ollama AI | http://localhost:11434 | Local AI service |
| MongoDB | localhost:27017 | Database (internal) |
| Mongo Express | http://localhost:8081 | Database GUI (optional) |

## Services Overview

### MongoDB (`mongodb`)
- **Port:** 27017
- **Data:** Persisted in `mongodb_data` volume
- **Health Check:** Automatic

### Ollama (`ollama`)
- **Port:** 11434
- **Model:** phi (1.6 GB) - suitable for systems with limited RAM
- **Data:** Persisted in `ollama_data` volume
- **First Run:** Model will be downloaded automatically on first startup

### Backend (`backend`)
- **Port:** 3001
- **Framework:** FastAPI
- **Health Check:** Automatic
- **Hot Reload:** Enabled (in development)

### Frontend (`client`)
- **Port:** 3000
- **Framework:** React + Nginx
- **Production Build:** Optimized static files

### Mongo Express (Optional - `mongo-express`)
- **Port:** 8081
- **Credentials:** admin / admin123
- **Profile:** Only starts with `--profile monitoring`

## Common Commands

### Start Services
```bash
# Start all services in detached mode
docker compose up -d

# Start with monitoring tools
docker compose --profile monitoring up -d
```

### Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (deletes all data!)
docker compose down -v
```

### View Logs
```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f ollama
```

### Restart Services
```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
```

### Pull Latest Images
```bash
docker compose pull
docker compose up -d
```

## Changing AI Model

To use a different Ollama model (requires more RAM):

1. Edit `docker-compose.yml` and change:
   ```yaml
   environment:
     - OLLAMA_MODEL=llama2  # or tinyllama, mistral, etc.
   ```

2. Pull the model manually (optional):
   ```bash
   docker exec -it mentorship-ollama ollama pull llama2
   ```

3. Restart the Ollama service:
   ```bash
   docker compose restart ollama
   ```

## GPU Support

For systems with NVIDIA GPUs, Ollama will automatically use GPU acceleration. Make sure you have:
- NVIDIA Driver 525+
- NVIDIA Container Toolkit installed

## Troubleshooting

### Ollama Fails to Start
```bash
# Check logs
docker compose logs ollama

# Verify port availability
netstat -tlnp | grep 11434
```

### MongoDB Connection Issues
```bash
# Verify MongoDB is healthy
docker compose ps

# Check MongoDB logs
docker compose logs mongodb

# Test connection
docker exec -it mentorship-mongodb mongosh --eval "db.runCommand('ping')"
```

### Backend Won't Start
```bash
# Check backend logs
docker compose logs backend

# Verify environment variables
docker exec -it mentorship-backend env | grep MONGO
```

### Frontend 502 Error
```bash
# Check if backend is running
docker compose ps

# Verify backend health
curl http://localhost:3001/
```

### Clear All Data and Start Fresh
```bash
docker compose down -v
docker compose up -d
```

## Development Mode

For active development with hot reload:

1. Use the development Docker Compose file:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

2. Or run services individually:
   ```bash
   # MongoDB and Ollama in Docker
   docker compose up -d mongodb ollama

   # Backend locally (with venv)
   cd server && source venv/bin/activate && uvicorn main:app --reload

   # Frontend locally
   cd client && npm start
   ```

## Production Deployment

For production deployment:

1. Update `docker-compose.yml`:
   - Remove `--reload` from backend CMD
   - Set appropriate `MAX_WORKERS` for uvicorn
   - Use environment-specific `.env` file

2. Set strong passwords:
   ```bash
   # Generate secure JWT secret
   openssl rand -base64 32

   # Update .env file with strong secrets
   ```

3. Configure reverse proxy (nginx/Apache) with SSL

4. Set up backup strategy for MongoDB volume

## Port Conflicts

If default ports are in use, modify them in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:3000"  # Change 8080 to your preferred port
  backend:
    ports:
      - "8081:3001"  # Change 8081 to your preferred port
```

## Volume Locations

| Volume | Host Location | Description |
|--------|---------------|-------------|
| mongodb_data | `/var/lib/docker/volumes/mentorship_mongodb_data/_data` | Database files |
| ollama_data | `/var/lib/docker/volumes/mentorship_ollama_data/_data` | AI models cache |

## Security Considerations

⚠️ **For production deployment:**

1. Change default passwords in `.env`
2. Set `JWT_SECRET_KEY` to a strong random value
3. Restrict CORS origins instead of `["*"]`
4. Enable HTTPS/TLS
5. Use secrets management for sensitive values
6. Regularly update base images for security patches

