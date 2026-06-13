# Labs API

## Overview
This repo provides all the apis for the project in the labs at [jeanmoket.com](https://jeanmoket.com).
If you want to run it locally:

### Steps to run it locally

Once you've clone the repository:

```bash
# 1. Generate the Prisma Client
npm run ss:generate

# 2. Create database schema
npm run ss:migrate:dev

# 3. Plant the seed
npm run ss:seed

# 4. run it locally
npm run start:dev
```

