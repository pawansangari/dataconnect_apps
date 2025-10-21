# HETS EDI Enrollment - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the HETS EDI Enrollment application to different environments.

---

## Deployment Options

1. **Local Development** - Run on your local machine for testing
2. **Databricks Apps** - Deploy to Databricks workspace
3. **Cloud Hosting** - Deploy to cloud platforms (AWS, Azure, GCP)
4. **Container Deployment** - Deploy using Docker

---

## 1. Local Development Deployment

### Prerequisites
- Python 3.8+
- PostgreSQL database access
- Databricks credentials

### Steps

1. **Clone/Navigate to the application directory**
   ```bash
   cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/streamlit-database-app
   ```

2. **Create virtual environment** (recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables**
   ```bash
   export PGDATABASE="your_database"
   export PGUSER="your_user"
   export PGHOST="your_host"
   export PGPORT="5432"
   export PGSSLMODE="require"
   export PGAPPNAME="hets_edi_app"
   ```

5. **Run the application**
   ```bash
   streamlit run app.py
   ```

6. **Access the application**
   - Open browser to `http://localhost:8501`

---

## 2. Databricks Apps Deployment

### Prerequisites
- Databricks workspace access
- Databricks CLI installed and configured
- App deployment permissions

### Files Required
- `app.py` - Main application
- `app.yaml` - Databricks app configuration
- `requirements.txt` - Python dependencies

### Steps

1. **Verify app.yaml configuration**
   ```yaml
   command: ["streamlit", "run", "app.py"]
   ```

2. **Authenticate with Databricks**
   ```bash
   databricks auth login --host https://your-workspace.cloud.databricks.com
   ```

3. **Deploy the application**
   ```bash
   databricks apps deploy
   ```

4. **Verify deployment**
   ```bash
   databricks apps list
   ```

5. **Access the application**
   - URL will be provided after deployment
   - Format: `https://your-workspace.cloud.databricks.com/apps/app-name`

### Configuration Notes

The application uses OAuth authentication via Databricks SDK:
- No need to set credentials in app.yaml
- Tokens automatically refresh every 15 minutes
- User context is maintained throughout session

### Environment Variables in Databricks

Set environment variables in the Databricks workspace:
1. Navigate to Workspace Settings
2. Add environment variables for database connection
3. Variables are automatically available to the app

---

## 3. Cloud Platform Deployment

### AWS (using EC2 or ECS)

#### Option A: EC2 Instance

1. **Launch EC2 instance**
   - Ubuntu 22.04 LTS recommended
   - Security group: Allow inbound on port 8501
   - Minimum: t3.medium (2 vCPU, 4 GB RAM)

2. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv
   ```

3. **Deploy application**
   ```bash
   git clone your-repo
   cd streamlit-database-app
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Set environment variables**
   ```bash
   echo "export PGDATABASE='your_db'" >> ~/.bashrc
   echo "export PGUSER='your_user'" >> ~/.bashrc
   # ... add other variables
   source ~/.bashrc
   ```

5. **Run with systemd** (production)
   
   Create `/etc/systemd/system/hets-edi.service`:
   ```ini
   [Unit]
   Description=HETS EDI Enrollment App
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/streamlit-database-app
   Environment="PATH=/home/ubuntu/streamlit-database-app/venv/bin"
   ExecStart=/home/ubuntu/streamlit-database-app/venv/bin/streamlit run app.py --server.port 8501 --server.address 0.0.0.0
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   Enable and start:
   ```bash
   sudo systemctl enable hets-edi
   sudo systemctl start hets-edi
   ```

#### Option B: ECS with Fargate

1. Create Dockerfile (see Docker section below)
2. Build and push to ECR
3. Create ECS task definition
4. Create ECS service
5. Configure Application Load Balancer

### Azure (using App Service or ACI)

#### Azure App Service

1. **Create App Service**
   ```bash
   az webapp create \
     --resource-group your-rg \
     --plan your-plan \
     --name hets-edi-app \
     --runtime "PYTHON:3.11"
   ```

2. **Configure environment variables**
   ```bash
   az webapp config appsettings set \
     --resource-group your-rg \
     --name hets-edi-app \
     --settings PGDATABASE=your_db PGUSER=your_user ...
   ```

3. **Deploy application**
   ```bash
   az webapp up \
     --name hets-edi-app \
     --resource-group your-rg
   ```

### Google Cloud Platform (using Cloud Run)

1. **Create Dockerfile** (see Docker section)

2. **Build and push to GCR**
   ```bash
   gcloud builds submit --tag gcr.io/your-project/hets-edi-app
   ```

3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy hets-edi-app \
     --image gcr.io/your-project/hets-edi-app \
     --platform managed \
     --port 8501 \
     --set-env-vars PGDATABASE=your_db,PGUSER=your_user...
   ```

---

## 4. Docker Container Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .
COPY app.yaml .

# Expose Streamlit port
EXPOSE 8501

# Health check
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health || exit 1

# Run the application
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

### Build and Run

```bash
# Build image
docker build -t hets-edi-app:latest .

# Run container
docker run -d \
  -p 8501:8501 \
  -e PGDATABASE=your_db \
  -e PGUSER=your_user \
  -e PGHOST=your_host \
  -e PGPORT=5432 \
  -e PGSSLMODE=require \
  -e PGAPPNAME=hets_edi_app \
  --name hets-edi \
  hets-edi-app:latest

# View logs
docker logs -f hets-edi

# Stop container
docker stop hets-edi
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8501:8501"
    environment:
      - PGDATABASE=${PGDATABASE}
      - PGUSER=${PGUSER}
      - PGHOST=${PGHOST}
      - PGPORT=${PGPORT}
      - PGSSLMODE=${PGSSLMODE}
      - PGAPPNAME=${PGAPPNAME}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8501/_stcore/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run with:
```bash
docker-compose up -d
```

---

## Production Considerations

### Performance Optimization

1. **Connection Pooling**
   - Already implemented in app (min: 2, max: 10)
   - Adjust based on concurrent users
   - Monitor connection usage

2. **Caching**
   - Add `@st.cache_data` for static data
   - Implement Redis for session storage
   - Cache database queries when appropriate

3. **Resource Limits**
   - Memory: Minimum 2GB RAM
   - CPU: 2+ cores recommended
   - Storage: Minimal (mainly for logs)

### Security Hardening

1. **Environment Variables**
   - Never hardcode credentials
   - Use secrets management service
   - Rotate tokens regularly

2. **Network Security**
   - Use HTTPS/TLS for all connections
   - Enable SSL for database connections
   - Implement firewall rules
   - Use VPC/private networks

3. **Application Security**
   - Keep dependencies updated
   - Enable rate limiting
   - Implement audit logging
   - Regular security scans

4. **Database Security**
   - Use read-only users where possible
   - Implement row-level security
   - Enable encryption at rest
   - Regular backups

### Monitoring and Logging

1. **Application Monitoring**
   ```python
   # Add to app.py for metrics
   import logging
   
   logging.basicConfig(
       level=logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
   )
   ```

2. **Health Checks**
   - Endpoint: `http://localhost:8501/_stcore/health`
   - Monitor response time
   - Alert on failures

3. **Log Aggregation**
   - Use CloudWatch (AWS)
   - Use Azure Monitor (Azure)
   - Use Cloud Logging (GCP)
   - Use ELK stack for on-prem

### Backup Strategy

1. **Database Backups**
   - Automated daily backups
   - Retention: 30 days minimum
   - Test restore procedures monthly

2. **Application Backups**
   - Version control (Git)
   - Configuration backups
   - Documentation backups

### High Availability

1. **Load Balancing**
   - Deploy multiple instances
   - Use Application Load Balancer
   - Health check configuration

2. **Auto Scaling**
   - Scale based on CPU/memory
   - Minimum 2 instances in production
   - Maximum based on budget/needs

3. **Database Redundancy**
   - Use database replicas
   - Automatic failover
   - Regular failover testing

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] All dependencies listed in requirements.txt
- [ ] Environment variables documented
- [ ] Database schema tested
- [ ] Security scan completed
- [ ] Performance testing done
- [ ] Documentation updated

### Deployment
- [ ] Backup current version (if updating)
- [ ] Deploy to staging first
- [ ] Verify database connectivity
- [ ] Test all form validations
- [ ] Test submission workflow
- [ ] Verify data persistence
- [ ] Check error handling
- [ ] Review logs for issues

### Post-Deployment
- [ ] Monitor application health
- [ ] Verify user access
- [ ] Check database connections
- [ ] Monitor error rates
- [ ] Verify OAuth authentication
- [ ] Test from different networks
- [ ] Update documentation
- [ ] Notify stakeholders

---

## Rollback Procedure

If deployment fails:

1. **Identify the issue**
   - Check application logs
   - Review database connectivity
   - Verify environment variables

2. **Rollback steps**
   ```bash
   # For Databricks
   databricks apps deploy --version previous
   
   # For Docker
   docker stop hets-edi
   docker run -d [previous-image]
   
   # For systemd
   sudo systemctl stop hets-edi
   # Replace with previous version
   sudo systemctl start hets-edi
   ```

3. **Verify rollback**
   - Test application access
   - Verify form submission
   - Check database integrity

---

## Maintenance Windows

Recommended maintenance schedule:

- **Daily**: Monitor logs and metrics
- **Weekly**: Review error logs, check disk space
- **Monthly**: Security updates, dependency updates
- **Quarterly**: Performance review, capacity planning
- **Annually**: Major version upgrades, security audit

---

## Support Contacts

### Application Issues
- Developer: [Your contact info]
- Team: [Team contact]

### Infrastructure Issues
- DevOps: [Contact info]
- Database: [DBA contact]

### Security Issues
- Security Team: [Contact info]
- Incident Response: [Contact info]

---

## Version History

| Version | Date | Deployed By | Environment | Notes |
|---------|------|-------------|-------------|-------|
| 1.0.0 | 2025-10-21 | [Name] | Production | Initial release |

---

## Additional Resources

- **Application README**: See README.md
- **Database Schema**: See DATA_DICTIONARY.md
- **Quick Start**: See QUICKSTART.md
- **Streamlit Docs**: https://docs.streamlit.io
- **Databricks Docs**: https://docs.databricks.com

---

*End of Deployment Guide*

