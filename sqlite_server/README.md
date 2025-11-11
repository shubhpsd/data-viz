# SQLite Server - Database Storage

This directory contains uploaded database files.

## Structure

```
sqlite_server/
└── uploads/              # Uploaded SQLite databases
    ├── <uuid>.sqlite    # User-uploaded databases
    └── ...
```

## Default Database

The project includes a sample database:
- **UUID**: `921c838c-541d-4361-8c96-70cb23abd9f5`
- **Tables**: `sales`, `customers`
- **Purpose**: Demo data for testing

## File Management

- Files are saved here when users upload CSV or SQLite files
- CSV files are automatically converted to SQLite
- File naming: `<UUID>.sqlite`
- Max size: 1MB (enforced by frontend)

## Database Access

Databases are accessed by the Python Flask API (port 5001) via:
- `/get-schema/<uuid>` - Get table structure
- `/execute-query` - Run SQL queries
- `/upload-file` - Upload new files

## Cleanup

**Note**: Implement automatic cleanup for old files to prevent disk space issues.
