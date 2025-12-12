---
description: Build and push the openV Docker image
---

# Build OpenV Docker Image

## Prerequisites
- Docker installed and running
- Logged into Aliyun Container Registry (if pushing)

## Build Steps

1. Navigate to the openV directory:
```bash
cd /home/jingyi/openV
```

// turbo
2. Build the Docker image with the updated Verilator 5.036:
```bash
docker build -t openv-dev:latest -f Dockerfile .
```

3. Tag for Aliyun registry:
```bash
docker tag openv-dev:latest crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest
```

4. Push to registry (requires authentication):
```bash
docker push crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest
```

## Quick Build (using existing base)
If you only need to update Verilator without full rebuild:

// turbo
1. Build incremental update:
```bash
docker build -t openv-dev:v5.036 -f /tmp/Dockerfile.update /tmp
```

## Verification
After building, verify the image with:
```bash
docker run --rm openv-dev:latest bash -c "verilator --version && python --version"
```
