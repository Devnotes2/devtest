# Grade Batches API - Complete Documentation

## Overview

The Grade Batches API provides comprehensive CRUD operations for managing grade batches within institutes. This API supports advanced filtering, pagination, dependency management, and various batch types including academic year batches, section batches, time-based batches, and program-specific batches.

## Base URL
```
/instituteAggreRt/gradeBatchesInInstitute
```

## Authentication
All endpoints require Bearer token authentication.

---

## GET - Retrieve Grade Batches

### Endpoint
```
GET /instituteAggreRt/gradeBatchesInInstitute
```

### Comprehensive Parameter Combinations

#### 1. Basic Operations
| Scenario | Parameters | Description |
|----------|------------|-------------|
| Get all | No parameters | Returns all grade batches with pagination |
| Paginated | `page=2&limit=5` | Get specific page with custom limit |
| Simple data | `aggregate=false` | Get basic data without related information |

#### 2. Filtering Combinations
| Scenario | Parameters | Description |
|----------|------------|-------------|
| By Institute | `instituteId=507f1f77bcf86cd799439011` | Filter by specific institute |
| By Department | `departmentId=507f1f77bcf86cd799439012` | Filter by specific department |
| By Grade | `gradeId=507f1f77bcf86cd799439013` | Filter by specific grade |
| Institute + Grade | `instituteId=507f1f77bcf86cd799439011&gradeId=507f1f77bcf86cd799439013` | Combined filters |
| Institute + Department | `instituteId=507f1f77bcf86cd799439011&departmentId=507f1f77bcf86cd799439012` | Combined filters |
| Department + Grade | `departmentId=507f1f77bcf86cd799439012&gradeId=507f1f77bcf86cd799439013` | Combined filters |
| All Filters | `instituteId=507f1f77bcf86cd799439011&departmentId=507f1f77bcf86cd799439012&gradeId=507f1f77bcf86cd799439013` | All filters combined |

#### 3. Special Modes
| Scenario | Parameters | Description |
|----------|------------|-------------|
| Dropdown Mode | `dropdown=true` | Returns only _id and batch fields |
| Specific IDs | `ids=507f1f77bcf86cd799439011,507f1f77bcf86cd799439012` | Get specific grade batches |
| Dropdown + Filter | `dropdown=true&gradeId=507f1f77bcf86cd799439013` | Dropdown with filtering |

#### 4. Advanced Combinations
| Scenario | Parameters | Description |
|----------|------------|-------------|
| Filtered + Paginated | `gradeId=507f1f77bcf86cd799439013&page=2&limit=5` | Filtered results with pagination |
| Dropdown + Paginated | `dropdown=true&page=1&limit=20` | Dropdown with pagination |
| Simple + Filtered | `aggregate=false&instituteId=507f1f77bcf86cd799439011` | Simple data with filtering |
| IDs + Aggregate | `ids=507f1f77bcf86cd799439011,507f1f77bcf86cd799439012&aggregate=true` | Specific IDs with full data |

### Example Requests

#### Basic List
```bash
GET /instituteAggreRt/gradeBatchesInInstitute
```

#### Filtered by Grade
```bash
GET /instituteAggreRt/gradeBatchesInInstitute?gradeId=507f1f77bcf86cd799439013
```

#### Dropdown for Grade 10
```bash
GET /instituteAggreRt/gradeBatchesInInstitute?dropdown=true&gradeId=507f1f77bcf86cd799439013
```

#### Paginated Results
```bash
GET /instituteAggreRt/gradeBatchesInInstitute?page=2&limit=5
```

#### Combined Filters
```bash
GET /instituteAggreRt/gradeBatchesInInstitute?instituteId=507f1f77bcf86cd799439011&gradeId=507f1f77bcf86cd799439013&page=1&limit=10
```

### Response Examples

#### Full List Response
```json
{
  "count": 10,
  "filteredDocs": 25,
  "totalDocs": 100,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "batch": "2023-24",
      "instituteId": "507f1f77bcf86cd799439012",
      "departmentId": "507f1f77bcf86cd799439013",
      "gradeId": "507f1f77bcf86cd799439014",
      "description": "Grade 10 Batch for Academic Year 2023-24",
      "archive": false,
      "createdAt": "2023-01-15T10:30:00.000Z",
      "updatedAt": "2023-01-15T10:30:00.000Z",
      "instituteName": "ABC School",
      "departmentName": "Science Department",
      "gradeName": "Grade 10",
      "gradeCode": "G10"
    }
  ]
}
```

#### Dropdown Response
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "batch": "2023-24"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "batch": "2024-25"
    }
  ]
}
```

---

## POST - Create Grade Batch

### Endpoint
```
POST /instituteAggreRt/gradeBatchesInInstitute
```

### Batch Type Examples

#### 1. Academic Year Batches
```json
{
  "batch": "2023-24",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "description": "Grade 10 Batch for Academic Year 2023-24"
}
```

#### 2. Section Batches
```json
{
  "batch": "A",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "description": "Grade 10 Section A"
}
```

#### 3. Time-based Batches
```json
{
  "batch": "Morning",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "description": "Grade 10 Morning Shift"
}
```

#### 4. Program-specific Batches
```json
{
  "batch": "Advanced",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "description": "Grade 10 Advanced Program"
}
```

#### 5. Minimal Required Fields
```json
{
  "batch": "2024-25",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013"
}
```

### Success Response
```json
{
  "message": "Grade Batch added successfully!",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "batch": "2023-24",
    "instituteId": "507f1f77bcf86cd799439011",
    "departmentId": "507f1f77bcf86cd799439012",
    "gradeId": "507f1f77bcf86cd799439013",
    "description": "Grade 10 Batch for Academic Year 2023-24",
    "archive": false,
    "createdAt": "2023-01-15T10:30:00.000Z",
    "updatedAt": "2023-01-15T10:30:00.000Z"
  }
}
```

---

## PUT - Update Grade Batch

### Endpoint
```
PUT /instituteAggreRt/gradeBatchesInInstitute
```

### Update Scenarios

#### 1. Update Batch Name Only
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "batch": "2024-25"
  }
}
```

#### 2. Update Description Only
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "description": "Updated Grade 10 Batch for Academic Year 2024-25"
  }
}
```

#### 3. Update Both Fields
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "batch": "2024-25",
    "description": "Updated Grade 10 Batch for Academic Year 2024-25"
  }
}
```

#### 4. Rename Section
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "batch": "B",
    "description": "Grade 10 Section B"
  }
}
```

#### 5. Update Time-based Batch
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "batch": "Evening",
    "description": "Grade 10 Evening Shift"
  }
}
```

### Success Response
```json
{
  "message": "Grade Batch updated successfully"
}
```

---

## DELETE - Delete Grade Batch(s)

### Endpoint
```
DELETE /instituteAggreRt/gradeBatchesInInstitute
```

### Deletion Modes

#### 1. Simple Deletion (No Dependencies)
```json
{
  "ids": ["507f1f77bcf86cd799439011"]
}
```

#### 2. Bulk Deletion
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}
```

#### 3. Archive Grade Batch
```json
{
  "ids": ["507f1f77bcf86cd799439011"],
  "archive": true
}
```

#### 4. Unarchive Grade Batch
```json
{
  "ids": ["507f1f77bcf86cd799439011"],
  "archive": false
}
```

#### 5. Transfer Dependencies
```json
{
  "ids": ["507f1f77bcf86cd799439011"],
  "transferTo": "507f1f77bcf86cd799439012"
}
```

#### 6. Cascade Delete (Delete with Dependencies)
```json
{
  "ids": ["507f1f77bcf86cd799439011"],
  "deleteDependents": true
}
```

#### 7. Check Dependencies Only
```json
{
  "ids": ["507f1f77bcf86cd799439011"]
}
```

### Response Examples

#### Simple Delete Success
```json
{
  "message": "Grade Batch(s) deleted successfully",
  "deletedCount": 1
}
```

#### Archive Success
```json
{
  "message": "Grade Batch(s) archived successfully",
  "archiveResult": {
    "archivedCount": 1
  }
}
```

#### Transfer Success
```json
{
  "message": "Dependents transferred and Grade Batch(s) deleted",
  "transfer": {
    "transferredCount": 5
  },
  "deletedCount": 1
}
```

#### Dependencies Found (201 Response)
```json
{
  "message": "Dependency summary",
  "deleted": [],
  "dependencies": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "value": "2023-24",
      "dependsOn": {
        "MembersData": 5
      }
    }
  ]
}
```

---

## Error Responses

### Validation Errors (400)
```json
{
  "error": "Duplicate value",
  "details": "Batch '2023-24' already exists in this grade",
  "field": "batch",
  "value": "2023-24",
  "suggestion": "Batch names must be unique within each grade"
}
```

### Unauthorized (401)
```json
{
  "error": "Unauthorized",
  "details": "Invalid or missing authentication token"
}
```

### Not Found (404)
```json
{
  "error": "Not found",
  "details": "No matching grade batch found or values are unchanged"
}
```

### Server Error (500)
```json
{
  "error": "Server error",
  "details": "Database connection failed"
}
```

---

## Business Rules

### Validation Rules
1. **Unique Constraint**: Batch names must be unique within each grade and institute
2. **Required Fields**: batch, instituteId, departmentId, gradeId are mandatory
3. **Referential Integrity**: All referenced IDs must exist in their respective collections
4. **Archive Logic**: Only non-archived grade batches can be updated

### Dependency Management
1. **Dependency Check**: System automatically checks for dependent records before deletion
2. **Transfer Rules**: Only one source grade batch can be used for transfer operations
3. **Cascade Delete**: Permanently removes all dependent records
4. **Archive Option**: Soft delete by setting archive flag

### Pagination
1. **Default Values**: page=1, limit=10
2. **Maximum Limit**: 100 items per page
3. **Count Information**: Returns count, filteredDocs, and totalDocs

---

## Common Use Cases

### 1. Academic Year Management
- Create batches for each academic year (2023-24, 2024-25)
- Filter by institute and grade to get year-specific batches
- Archive old academic year batches

### 2. Section Management
- Create section batches (A, B, C) for each grade
- Use dropdown mode to populate section selectors
- Update section names as needed

### 3. Time-based Scheduling
- Create morning/evening shift batches
- Filter by time-based criteria
- Transfer students between shifts

### 4. Program Management
- Create program-specific batches (Regular, Advanced, Honors)
- Filter by program type
- Manage program transitions

### 5. Bulk Operations
- Delete multiple batches at once
- Archive multiple batches
- Transfer dependencies in bulk

---

## API Testing Examples

### cURL Examples

#### Get All Grade Batches
```bash
curl -X GET "https://devtest2.onrender.com/instituteAggreRt/gradeBatchesInInstitute" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Academic Year Batch
```bash
curl -X POST "https://devtest2.onrender.com/instituteAggreRt/gradeBatchesInInstitute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "batch": "2023-24",
    "instituteId": "507f1f77bcf86cd799439011",
    "departmentId": "507f1f77bcf86cd799439012",
    "gradeId": "507f1f77bcf86cd799439013",
    "description": "Grade 10 Batch for Academic Year 2023-24"
  }'
```

#### Update Batch Name
```bash
curl -X PUT "https://devtest2.onrender.com/instituteAggreRt/gradeBatchesInInstitute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "_id": "507f1f77bcf86cd799439011",
    "updatedData": {
      "batch": "2024-25"
    }
  }'
```

#### Archive Grade Batch
```bash
curl -X DELETE "https://devtest2.onrender.com/instituteAggreRt/gradeBatchesInInstitute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["507f1f77bcf86cd799439011"],
    "archive": true
  }'
```

---

## Summary

The Grade Batches API provides a comprehensive solution for managing grade batches with:

- **16+ parameter combinations** for GET requests
- **5 different batch types** for creation
- **5 update scenarios** for modifications
- **7 deletion modes** with dependency management
- **Complete error handling** with detailed messages
- **Flexible pagination** and filtering options
- **Bulk operations** support
- **Archive/unarchive** functionality
- **Dependency management** with transfer options

This API supports all common educational management scenarios and provides the flexibility needed for complex institute management systems.
