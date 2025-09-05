# Grade Sections API - Complete Swagger Documentation

## Overview
This document provides comprehensive Swagger documentation for the Grade Sections API with all permutation combinations and examples. The API supports CRUD operations with advanced filtering, pagination, and dependency management.

## API Endpoints

### Base URL
- Development: `https://devtest2.onrender.com/instituteAggreRt`
- Local: `http://localhost:8000/instituteAggreRt`

## 1. GET /gradeSectionsInInstitute - Retrieve Grade Sections

### Description
Retrieve grade sections with comprehensive filtering, pagination, and aggregation options.

### Key Features
- Filter by institute, department, or grade
- Get specific sections by IDs
- Dropdown mode for simple ID/name pairs
- Aggregated data with related entity details
- Pagination support

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number for pagination (min: 1) |
| limit | integer | No | 10 | Items per page (min: 1, max: 100) |
| ids | array[string] | No | - | Specific grade section IDs to retrieve |
| instituteId | string | No | - | Filter by institute ID (ObjectId format) |
| departmentId | string | No | - | Filter by department ID (ObjectId format) |
| gradeId | string | No | - | Filter by grade ID (ObjectId format) |
| sectionName | string | No | - | Filter by section name (partial match) |
| aggregate | string | No | "true" | Return aggregated data with related details |
| dropdown | string | No | "false" | Dropdown mode - returns only ID and name |

### Parameter Combinations & Examples

#### 1. Basic List (All Sections)
```http
GET /gradeSectionsInInstitute
GET /gradeSectionsInInstitute?page=1&limit=10
```

#### 2. Filtered by Institute
```http
GET /gradeSectionsInInstitute?instituteId=507f1f77bcf86cd799439011
GET /gradeSectionsInInstitute?instituteId=507f1f77bcf86cd799439011&page=2&limit=5
```

#### 3. Filtered by Department
```http
GET /gradeSectionsInInstitute?departmentId=507f1f77bcf86cd799439012
GET /gradeSectionsInInstitute?departmentId=507f1f77bcf86cd799439012&gradeId=507f1f77bcf86cd799439013
```

#### 4. Filtered by Grade
```http
GET /gradeSectionsInInstitute?gradeId=507f1f77bcf86cd799439013
GET /gradeSectionsInInstitute?gradeId=507f1f77bcf86cd799439013&sectionName=Section%20A
```

#### 5. Specific Sections by IDs
```http
GET /gradeSectionsInInstitute?ids=507f1f77bcf86cd799439011,507f1f77bcf86cd799439012
GET /gradeSectionsInInstitute?ids=507f1f77bcf86cd799439011&aggregate=false
```

#### 6. Dropdown Mode
```http
GET /gradeSectionsInInstitute?dropdown=true
GET /gradeSectionsInInstitute?dropdown=true&gradeId=507f1f77bcf86cd799439013
```

#### 7. Non-Aggregated Data
```http
GET /gradeSectionsInInstitute?aggregate=false
GET /gradeSectionsInInstitute?aggregate=false&page=1&limit=20
```

#### 8. Complex Filtering
```http
GET /gradeSectionsInInstitute?instituteId=507f1f77bcf86cd799439011&departmentId=507f1f77bcf86cd799439012&gradeId=507f1f77bcf86cd799439013&page=1&limit=5
```

### Response Examples

#### Full Aggregated Data Response
```json
{
  "count": 2,
  "filteredDocs": 2,
  "totalDocs": 15,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sectionName": "Section A",
      "instituteId": "507f1f77bcf86cd799439012",
      "departmentId": "507f1f77bcf86cd799439013",
      "gradeId": "507f1f77bcf86cd799439014",
      "description": "Grade 10 Section A - Morning Shift",
      "archive": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "instituteName": "ABC School",
      "departmentName": "Science Department",
      "gradeName": "Grade 10",
      "gradeCode": "G10"
    }
  ]
}
```

#### Dropdown Mode Response
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sectionName": "Section A"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "sectionName": "Section B"
    }
  ]
}
```

## 2. POST /gradeSectionsInInstitute - Create Grade Section

### Description
Create a new grade section within an institute. Section names must be unique within the same grade.

### Request Body Schema
```json
{
  "sectionName": "string (required)",
  "instituteId": "string (required, ObjectId)",
  "departmentId": "string (required, ObjectId)",
  "gradeId": "string (required, ObjectId)",
  "description": "string (optional)"
}
```

### Request Examples

#### Basic Section Creation
```json
{
  "sectionName": "Section A",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "description": "Grade 10 Section A - Morning Shift"
}
```

#### Section with Detailed Description
```json
{
  "sectionName": "Section B",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "description": "Grade 10 Section B - Afternoon Shift for Science Stream Students"
}
```

#### Minimal Required Fields
```json
{
  "sectionName": "Section C",
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013"
}
```

### Response Examples

#### Success Response
```json
{
  "message": "Grade Section added successfully!",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "sectionName": "Section A",
    "instituteId": "507f1f77bcf86cd799439011",
    "departmentId": "507f1f77bcf86cd799439012",
    "gradeId": "507f1f77bcf86cd799439013",
    "description": "Grade 10 Section A - Morning Shift",
    "archive": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Duplicate Section Error
```json
{
  "error": "Duplicate value",
  "details": "Section name 'Section A' already exists in this grade",
  "field": "sectionName",
  "value": "Section A",
  "suggestion": "Section name must be unique within this grade"
}
```

## 3. PUT /gradeSectionsInInstitute - Update Grade Section

### Description
Update existing grade section information. Only provided fields will be updated.

### Request Body Schema
```json
{
  "_id": "string (required, ObjectId)",
  "updatedData": {
    "sectionName": "string (optional)",
    "description": "string (optional)",
    "archive": "boolean (optional)"
  }
}
```

### Request Examples

#### Update Section Name
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "sectionName": "Section A Updated"
  }
}
```

#### Update Description Only
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "description": "Updated description for Grade 10 Section A"
  }
}
```

#### Archive Section
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "archive": true
  }
}
```

#### Multiple Updates
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "sectionName": "Section A Renamed",
    "description": "Updated description",
    "archive": false
  }
}
```

### Response Examples

#### Success Response
```json
{
  "message": "Grade Section updated successfully"
}
```

#### No Changes Made
```json
{
  "message": "No updates were made"
}
```

## 4. DELETE /gradeSectionsInInstitute - Delete Grade Sections

### Description
Delete grade sections with comprehensive dependency management options.

### Deletion Modes
1. **Simple Delete**: Delete sections without dependents
2. **Archive**: Archive sections instead of deleting
3. **Transfer Dependents**: Transfer dependents to another section
4. **Delete with Dependents**: Delete sections and all dependents

### Request Body Schema
```json
{
  "ids": ["string"] (required, array of ObjectIds),
  "deleteDependents": "boolean (optional)",
  "transferTo": "string (optional, ObjectId)",
  "archive": "boolean (optional)"
}
```

### Request Examples

#### Simple Delete
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

#### Archive Sections
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "archive": true
}
```

#### Unarchive Sections
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "archive": false
}
```

#### Transfer Dependents
```json
{
  "ids": ["507f1f77bcf86cd799439011"],
  "transferTo": "507f1f77bcf86cd799439013"
}
```

#### Delete with Dependents
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "deleteDependents": true
}
```

#### Check Dependencies
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

### Response Examples

#### Successful Deletion
```json
{
  "message": "Grade Section(s) deleted successfully",
  "deletedCount": 2
}
```

#### Successful Archive
```json
{
  "message": "Grade Section(s) archived successfully",
  "archiveResult": {
    "archivedCount": 2
  }
}
```

#### Transfer Success
```json
{
  "message": "Dependents transferred and Grade Section(s) deleted",
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
  "deleted": ["507f1f77bcf86cd799439012"],
  "dependencies": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "value": "Section A",
      "dependsOn": {
        "MembersData": 5,
        "gradeSectionBatches": 2
      }
    }
  ]
}
```

## Error Responses

### Common Error Codes

#### 400 - Bad Request
```json
{
  "message": "Grade Section ID(s) required"
}
```

#### 401 - Unauthorized
```json
{
  "message": "Unauthorized access"
}
```

#### 404 - Not Found
```json
{
  "message": "No matching grade section found or values are unchanged"
}
```

#### 500 - Internal Server Error
```json
{
  "message": "Server error",
  "error": "Database connection failed"
}
```

## Data Models

### GradeSection
```json
{
  "_id": "string",
  "sectionName": "string",
  "instituteId": "string",
  "departmentId": "string",
  "gradeId": "string",
  "description": "string",
  "archive": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### GradeSectionWithDetails (Aggregated)
```json
{
  "_id": "string",
  "sectionName": "string",
  "instituteId": "string",
  "departmentId": "string",
  "gradeId": "string",
  "description": "string",
  "archive": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "instituteName": "string",
  "departmentName": "string",
  "gradeName": "string",
  "gradeCode": "string"
}
```

## Validation Rules

### Unique Constraints
- The combination of `instituteId + gradeId + sectionName` must be unique
- Archived sections (archive: true) are excluded from uniqueness checks

### Required Fields
- **Create**: sectionName, instituteId, departmentId, gradeId
- **Update**: _id, updatedData (with at least one field)
- **Delete**: ids (array of ObjectIds)

### Field Validation
- All ID fields must be valid MongoDB ObjectIds (24 character hex string)
- sectionName must be a non-empty string
- archive must be a boolean value

## Dependency Management

### Dependents
Grade sections may have the following dependents:
- **MembersData**: Students/members assigned to the section
- **GradeSectionBatches**: Batches within the section

### Dependency Handling Options
1. **Transfer**: Move dependents to another section
2. **Delete**: Remove dependents along with the section
3. **Archive**: Archive the section (dependents remain)

## Best Practices

### Performance
- Use pagination for large datasets
- Use dropdown mode for simple lists
- Use specific IDs when you know which sections you need

### Error Handling
- Always check for 201 responses in DELETE operations (dependencies found)
- Handle duplicate section name errors gracefully
- Validate ObjectId format before sending requests

### Security
- Always include Bearer token in Authorization header
- Validate user permissions before operations
- Use HTTPS in production

## Complete API Testing Examples

### Test All GET Combinations
```bash
# Basic list
curl -H "Authorization: Bearer YOUR_TOKEN" "https://devtest2.onrender.com/instituteAggreRt/gradeSectionsInInstitute"

# Filtered by grade
curl -H "Authorization: Bearer YOUR_TOKEN" "https://devtest2.onrender.com/instituteAggreRt/gradeSectionsInInstitute?gradeId=507f1f77bcf86cd799439013"

# Dropdown mode
curl -H "Authorization: Bearer YOUR_TOKEN" "https://devtest2.onrender.com/instituteAggreRt/gradeSectionsInInstitute?dropdown=true"

# Specific IDs
curl -H "Authorization: Bearer YOUR_TOKEN" "https://devtest2.onrender.com/instituteAggreRt/gradeSectionsInInstitute?ids=507f1f77bcf86cd799439011,507f1f77bcf86cd799439012"
```

### Test POST Operations
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionName": "Section A",
    "instituteId": "507f1f77bcf86cd799439011",
    "departmentId": "507f1f77bcf86cd799439012",
    "gradeId": "507f1f77bcf86cd799439013",
    "description": "Grade 10 Section A - Morning Shift"
  }' \
  "https://devtest2.onrender.com/instituteAggreRt/gradeSectionsInInstitute"
```

### Test PUT Operations
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "_id": "507f1f77bcf86cd799439011",
    "updatedData": {
      "sectionName": "Section A Updated"
    }
  }' \
  "https://devtest2.onrender.com/instituteAggreRt/gradeSectionsInInstitute"
```

### Test DELETE Operations
```bash
# Simple delete
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["507f1f77bcf86cd799439011"]}' \
  "https://devtest2.onrender.com/instituteAggreRt/gradeSectionsInInstitute"

# Archive
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["507f1f77bcf86cd799439011"], "archive": true}' \
  "https://devtest2.onrender.com/instituteAggreRt/gradeSectionsInInstitute"
```

This comprehensive documentation covers all possible parameter combinations, request/response examples, and edge cases for the Grade Sections API.
