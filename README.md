# School Administration System

## What You Need

- **Node.js v14 or higher** - Check with `node -v`
- **Docker** - For running MySQL locally

## Getting It Running

Install dependencies

```bash
npm install
```

Copy .env.sample to .env file & run database in docker instance

```bash
docker compose up -d
```

Wait a few seconds for MySQL to boot up, then start the server:

```bash
npm start
```

If you see "Unable to start application" or connection errors, give it 10 seconds and try `npm start` again.

You should see something like:

```
Server listening on port 3000
```

Quick sanity check - hit this endpoint:

```
http://localhost:3000/api/healthcheck
```

If you get a 200 OK, good to go

## Running Tests

Run:

```bash
npm test
```

## What's Inside

Here's how the code is organized:

```
src/
├── api/
│   ├── controllers/      # Where HTTP requests land
│   └── middleware/       # Error handling, file uploads, etc.
│
├── services/             # The actual business logic
│
├── database/
│   ├── models/           # Sequelize models (ORM stuff)
│   └── repositories/     # Clean data access layer
│
├── shared/
│   ├── constants/        # Constants go here
│   ├── errors/           # Custom error classes
│   └── types/            # TypeScript definitions
│
└── config/
    └── logger.ts         # Winston logging setup
```

## The APIs

There are 4 main endpoints:

1. **POST /api/upload** - Upload CSV file with teachers/students/classes data
2. **GET /api/class/:classCode/students** - Get students in a class (paginated, includes external students)
3. **PUT /api/class/:classCode** - Update class name
4. **GET /api/reports/workload** - Get teacher workload report

Check out the Postman collection in the root folder if you want to try them out.

### How do I upload file to /api/upload?

You can import the included postman script (school-administration-system.postman_collection.json) into your postman.
