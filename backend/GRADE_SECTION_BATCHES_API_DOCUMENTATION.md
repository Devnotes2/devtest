# Grade Section Batches API Documentation

## Overview

This document provides comprehensive documentation for the Grade Section Batches API endpoints with all possible parameter combinations and examples.

## Base URL
- Development: `https://devtest2.onrender.com`
- Local: `http://localhost:8000`

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. GET /instituteAggreRt/gradeSectionBatchesInInstitute

Retrieve grade section batches with comprehensive filtering and pagination options.

#### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | integer | No | Page number (starts from 1) | `1` |
| `limit` | integer | No | Items per page (max 100) | `10` |
| `instituteId` | string | No | Filter by institute ID | `"507f1f77bcf86cd799439011"` |
| `departmentId` | string | No | Filter by department ID | `"507f1f77bcf86cd799439012"` |
| `gradeId` | string | No | Filter by grade ID | `"507f1f77bcf86cd799439013"` |
| `sectionId` | string | No | Filter by section ID | `"507f1f77bcf86cd799439014"` |
| `ids` | array | No | Specific batch IDs to retrieve | `["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]` |
| `aggregate` | string | No | Include lookup data (true/false) | `true` |
| `dropdown` | string | No | Return dropdown format (true/false) | `false` |

#### Parameter Combinations

##### 1. Basic List (No Parameters)
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute
```
Returns all records with pagination.

##### 2. Paginated List
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?page=2&limit=20
```
Returns page 2 with 20 items per page.

##### 3. Filtered by Institute
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?instituteId=507f1f77bcf86cd799439011
```
Returns all batches for a specific institute.

##### 4. Filtered by Grade
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?gradeId=507f1f77bcf86cd799439013
```
Returns all batches for a specific grade.

##### 5. Filtered by Section
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?sectionId=507f1f77bcf86cd799439014
```
Returns all batches for a specific section.

##### 6. Multiple Filters
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?instituteId=507f1f77bcf86cd799439011&gradeId=507f1f77bcf86cd799439013&departmentId=507f1f77bcf86cd799439012
```
Returns batches matching all specified filters.

##### 7. Specific IDs
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?ids=507f1f77bcf86cd799439011&ids=507f1f77bcf86cd799439012
```
Returns specific batches by their IDs.

##### 8. Without Aggregation
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?aggregate=false
```
Returns basic data without lookup information (faster response).

##### 9. Dropdown Format
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?dropdown=true
```
Returns simplified format with only `_id` and `sectionBatchName`.

##### 10. Complex Combination
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?instituteId=507f1f77bcf86cd799439011&gradeId=507f1f77bcf86cd799439013&page=1&limit=5&aggregate=true
```
Returns first 5 batches for specific institute and grade with full aggregation.

#### Response Examples

##### Standard Response with Aggregation
```json
{
  "count": 10,
  "filteredDocs": 25,
  "totalDocs": 100,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sectionBatchName": "Section A 2023-24",
      "instituteId": "507f1f77bcf86cd799439011",
      "departmentId": "507f1f77bcf86cd799439012",
      "gradeId": "507f1f77bcf86cd799439013",
      "sectionId": "507f1f77bcf86cd799439014",
      "description": "Grade 10 Section A Batch for Academic Year 2023-24",
      "archive": false,
      "createdAt": "2023-06-01T10:30:00.000Z",
      "updatedAt": "2023-06-01T10:30:00.000Z",
      "instituteName": "ABC School",
      "departmentName": "Science Department",
      "gradeName": "Grade 10",
      "gradeCode": "G10",
      "sectionName": "Section A"
    }
  ]
}
```

##### Dropdown Response
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sectionBatchName": "Section A 2023-24"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "sectionBatchName": "Section B 2023-24"
    }
  ]
}
```

### 2. POST /instituteAggreRt/gradeSectionBatchesInInstitute

Create a new grade section batch.

#### Request Body

```json
{
  "sectionBatchName": "Section A 2023-24",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "sectionId": "507f1f77bcf86cd799439014",
  "description": "Grade 10 Section A Batch for Academic Year 2023-24"
}
```

#### Examples

##### Basic Creation
```json
{
  "sectionBatchName": "Section A 2023-24",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "sectionId": "507f1f77bcf86cd799439014"
}
```

##### With Description
```json
{
  "sectionBatchName": "Section B 2023-24",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "sectionId": "507f1f77bcf86cd799439015",
  "description": "Grade 10 Section B Batch for Academic Year 2023-24"
}
```

#### Response
```json
{
  "message": "Grade Section Batch added successfully!",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "sectionBatchName": "Section A 2023-24",
    "instituteId": "507f1f77bcf86cd799439011",
    "departmentId": "507f1f77bcf86cd799439012",
    "gradeId": "507f1f77bcf86cd799439013",
    "sectionId": "507f1f77bcf86cd799439014",
    "description": "Grade 10 Section A Batch for Academic Year 2023-24",
    "archive": false,
    "createdAt": "2023-06-01T10:30:00.000Z",
    "updatedAt": "2023-06-01T10:30:00.000Z"
  }
}
```

### 3. PUT /instituteAggreRt/gradeSectionBatchesInInstitute

Update an existing grade section batch.

#### Request Body

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "sectionBatchName": "Section A 2023-24 Updated",
    "description": "Updated description for the batch"
  }
}
```

#### Examples

##### Update Name Only
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "sectionBatchName": "Section A 2023-24 Updated"
  }
}
```

##### Update Description Only
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "description": "Updated description for the batch"
  }
}
```

##### Update Multiple Fields
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "sectionBatchName": "Section A 2023-24 Revised",
    "description": "Revised description for the batch"
  }
}
```

##### Archive Batch
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "archive": true
  }
}
```

##### Unarchive Batch
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "archive": false
  }
}
```

#### Response
```json
{
  "message": "Grade Section Batch updated successfully"
}
```

### 4. DELETE /instituteAggreRt/gradeSectionBatchesInInstitute

Delete grade section batch(es) with comprehensive dependency handling.

#### Request Body

```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

#### Examples

##### Simple Delete
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

##### Archive Instead of Delete
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "archive": true
}
```

##### Unarchive
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "archive": false
}
```

##### Transfer Dependencies (Single ID Only)
```json
{
  "ids": ["507f1f77bcf86cd799439011"],
  "transferTo": "507f1f77bcf86cd799439013"
}
```

##### Delete with Dependencies
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "deleteDependents": true
}
```

##### Check Dependencies (Default)
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

#### Response Examples

##### Simple Delete Success
```json
{
  "message": "Grade Section Batch(s) deleted successfully",
  "deletedCount": 2
}
```

##### Archive Success
```json
{
  "message": "Grade Section Batch(s) archived successfully",
  "archiveResult": {
    "archivedCount": 2
  }
}
```

##### Transfer Success
```json
{
  "message": "Dependents transferred and Grade Section Batch(s) deleted",
  "transfer": {
    "transferredCount": 5
  },
  "deletedCount": 1
}
```

##### Delete with Dependencies Success
```json
{
  "message": "Deleted with dependents",
  "results": [
    {
      "gradeSectionBatchId": "507f1f77bcf86cd799439011",
      "deletedCount": 1,
      "dependentsDeleted": {
        "MembersData": 5
      }
    }
  ]
}
```

##### Dependency Summary (201 Response)
```json
{
  "message": "Dependency summary",
  "deleted": ["507f1f77bcf86cd799439011"],
  "dependencies": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "value": "Section B 2023-24",
      "dependsOn": {
        "MembersData": 5
      }
    }
  ]
}
```

## Error Responses

### 400 Bad Request

#### Validation Error
```json
{
  "message": "Grade Section Batch ID(s) required"
}
```

#### Duplicate Error
```json
{
  "error": "Duplicate value",
  "details": "Section batch name 'Section A 2023-24' already exists in this section",
  "field": "sectionBatchName",
  "value": "Section A 2023-24",
  "suggestion": "Section batch names must be unique within each section"
}
```

#### Conflicting Operations
```json
{
  "message": "Only one of archive or transfer can be requested at a time."
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "message": "No matching grade section batch found or values are unchanged"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error",
  "error": "Database connection failed"
}
```

## Business Rules

### Uniqueness Constraints
- `sectionBatchName` must be unique within the same `sectionId` and `instituteId`
- Archived records are excluded from uniqueness checks

### Dependency Handling
- Grade section batches may have dependent records (e.g., MembersData)
- The system automatically checks for dependencies before deletion
- You can choose to:
  - Archive instead of delete
  - Transfer dependencies to another batch
  - Delete with all dependencies
  - Get a dependency summary

### Validation Rules
- All ID fields must be valid MongoDB ObjectIds (24-character hex strings)
- Required fields must be provided for creation
- Archive parameter must be boolean when specified
- Transfer requires exactly one ID in the ids array

## Common Use Cases

### 1. Getting All Batches for a Grade
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?gradeId=507f1f77bcf86cd799439013
```

### 2. Getting Dropdown Options
```http
GET /instituteAggreRt/gradeSectionBatchesInInstitute?dropdown=true&gradeId=507f1f77bcf86cd799439013
```

### 3. Creating Multiple Batches for Same Section
```json
POST /instituteAggreRt/gradeSectionBatchesInInstitute
{
  "sectionBatchName": "Section A 2023-24",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "sectionId": "507f1f77bcf86cd799439014"
}
```

```json
POST /instituteAggreRt/gradeSectionBatchesInInstitute
{
  "sectionBatchName": "Section A 2024-25",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "sectionId": "507f1f77bcf86cd799439014"
}
```

### 4. Archiving Old Batches
```json
DELETE /instituteAggreRt/gradeSectionBatchesInInstitute
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "archive": true
}
```

### 5. Transferring Students to New Batch
```json
DELETE /instituteAggreRt/gradeSectionBatchesInInstitute
{
  "ids": ["507f1f77bcf86cd799439011"],
  "transferTo": "507f1f77bcf86cd799439013"
}
```

## Testing Examples

### cURL Examples

#### Get All Batches
```bash
curl -X GET "https://devtest2.onrender.com/instituteAggreRt/gradeSectionBatchesInInstitute" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Batches for Specific Grade
```bash
curl -X GET "https://devtest2.onrender.com/instituteAggreRt/gradeSectionBatchesInInstitute?gradeId=507f1f77bcf86cd799439013" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create New Batch
```bash
curl -X POST "https://devtest2.onrender.com/instituteAggreRt/gradeSectionBatchesInInstitute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionBatchName": "Section A 2023-24",
    "instituteId": "507f1f77bcf86cd799439011",
    "departmentId": "507f1f77bcf86cd799439012",
    "gradeId": "507f1f77bcf86cd799439013",
    "sectionId": "507f1f77bcf86cd799439014",
    "description": "Grade 10 Section A Batch for Academic Year 2023-24"
  }'
```

#### Update Batch
```bash
curl -X PUT "https://devtest2.onrender.com/instituteAggreRt/gradeSectionBatchesInInstitute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "_id": "507f1f77bcf86cd799439011",
    "updatedData": {
      "sectionBatchName": "Section A 2023-24 Updated"
    }
  }'
```

#### Delete Batch
```bash
curl -X DELETE "https://devtest2.onrender.com/instituteAggreRt/gradeSectionBatchesInInstitute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["507f1f77bcf86cd799439011"]
  }'
```

#### Archive Batch
```bash
curl -X DELETE "https://devtest2.onrender.com/instituteAggreRt/gradeSectionBatchesInInstitute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["507f1f77bcf86cd799439011"],
    "archive": true
  }'
```

## Notes

1. **ObjectId Format**: All ID parameters must be valid MongoDB ObjectIds (24-character hexadecimal strings)
2. **Pagination**: Default page size is 10, maximum is 100
3. **Aggregation**: By default, responses include lookup data. Set `aggregate=false` for faster responses
4. **Dependencies**: The system automatically handles dependency checks and provides options for managing them
5. **Uniqueness**: Section batch names must be unique within the same section and institute
6. **Archive**: Archived records are excluded from uniqueness checks and can be unarchived later

This documentation covers all possible parameter combinations and use cases for the Grade Section Batches API endpoints.
