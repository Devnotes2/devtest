# Enrollments Module - Complete Swagger Documentation

## Overview

This document provides comprehensive Swagger documentation for the Enrollments module with all parameter combinations, examples, and use cases. The documentation covers all CRUD operations with detailed examples for every possible scenario.

## API Endpoints

### 1. GET /enrollments - Retrieve Enrollments

**Purpose**: Retrieve enrollments with comprehensive filtering, aggregation, and pagination support.

#### Key Features
- **Basic filtering**: Filter by any enrollment field
- **Aggregation**: Join with related collections (institutes, departments, grades, etc.)
- **Pagination**: Control page size and navigation
- **Sorting**: Sort by any field in ascending or descending order
- **Dropdown mode**: Get simplified data for dropdowns
- **Value-based filtering**: Filter by joined field values
- **ID-based retrieval**: Get specific enrollments by IDs

#### Parameter Combinations

##### 1. Basic Pagination
```
GET /enrollments?page=1&limit=10
```

##### 2. With Basic Filtering
```
GET /enrollments?instituteId=507f1f77bcf86cd799439011&status=active&page=1&limit=10
```

##### 3. With Aggregation (Default)
```
GET /enrollments?aggregate=true&instituteId=507f1f77bcf86cd799439011
```

##### 4. With Sorting
```
GET /enrollments?sortBy=enrollmentDate&sortOrder=desc
```

##### 5. Dropdown Mode
```
GET /enrollments?dropdown=true&instituteId=507f1f77bcf86cd799439011
```

##### 6. ID-based Retrieval
```
GET /enrollments?ids=507f1f77bcf86cd799439011,507f1f77bcf86cd799439012
```

##### 7. Value-based Filtering (requires aggregation)
```
GET /enrollments?institute=ABC University&department=Computer Science
```

##### 8. Complex Combination
```
GET /enrollments?aggregate=true&instituteId=507f1f77bcf86cd799439011&status=active&sortBy=enrollmentDate&sortOrder=desc&page=1&limit=20
```

##### 9. Date Range Filtering
```
GET /enrollments?enrollmentDateFrom=2024-01-01&enrollmentDateTo=2024-12-31
```

##### 10. Multiple Field Filtering
```
GET /enrollments?instituteId=507f1f77bcf86cd799439011&departmentId=507f1f77bcf86cd799439012&gradeId=507f1f77bcf86cd799439013&status=active
```

#### All Available Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `1` |
| `limit` | integer | Items per page (default: 10) | `10` |
| `aggregate` | string | Enable aggregation (default: true) | `true` |
| `dropdown` | string | Simplified response for dropdowns | `true` |
| `ids` | array | Array of enrollment IDs | `["507f1f77bcf86cd799439011"]` |
| `instituteId` | string | Filter by institute ID | `"507f1f77bcf86cd799439011"` |
| `departmentId` | string | Filter by department ID | `"507f1f77bcf86cd799439012"` |
| `gradeId` | string | Filter by grade ID | `"507f1f77bcf86cd799439013"` |
| `gradeSectionId` | string | Filter by grade section ID | `"507f1f77bcf86cd799439014"` |
| `gradeSectionBatchId` | string | Filter by grade section batch ID | `"507f1f77bcf86cd799439015"` |
| `gradeBatchId` | string | Filter by grade batch ID | `"507f1f77bcf86cd799439016"` |
| `memberId` | string | Filter by member ID | `"507f1f77bcf86cd799439019"` |
| `memberType` | string | Filter by member type ID | `"507f1f77bcf86cd799439020"` |
| `academicYearId` | string | Filter by academic year ID | `"507f1f77bcf86cd799439021"` |
| `status` | string | Filter by status (active, inactive, completed, dropped) | `"active"` |
| `archive` | boolean | Filter by archive status | `false` |
| `enrollmentDateFrom` | date | Filter from date | `"2024-01-01"` |
| `enrollmentDateTo` | date | Filter to date | `"2024-12-31"` |
| `createdAtFrom` | date | Filter by creation date from | `"2024-01-01"` |
| `createdAtTo` | date | Filter by creation date to | `"2024-12-31"` |
| `institute` | string | Filter by institute name (requires aggregate) | `"ABC University"` |
| `department` | string | Filter by department name (requires aggregate) | `"Computer Science"` |
| `grade` | string | Filter by grade name (requires aggregate) | `"Grade 10"` |
| `gradeCode` | string | Filter by grade code (requires aggregate) | `"G10"` |
| `batch` | string | Filter by batch name (requires aggregate) | `"2024"` |
| `section` | string | Filter by section name (requires aggregate) | `"A"` |
| `sectionBatch` | string | Filter by section batch name (requires aggregate) | `"A-2024"` |
| `academicYear` | string | Filter by academic year (requires aggregate) | `"2024-2025"` |
| `member` | string | Filter by member name (requires aggregate) | `"John Doe"` |
| `memberType` | string | Filter by member type value (requires aggregate) | `"Student"` |
| `sortBy` | string | Field to sort by | `"enrollmentDate"` |
| `sortOrder` | string | Sort order (asc, desc) | `"desc"` |
| `validate` | string | Validate query parameters | `true` |
| `search` | string | Search across multiple fields | `"John Doe"` |

### 2. POST /enrollments - Create Enrollment

**Purpose**: Create a new enrollment with comprehensive validation and auto-population features.

#### Key Features
- **Auto-population**: `memberType` is automatically populated from `memberId`
- **Unique constraints**: Prevents duplicate enrollments based on combination of fields
- **Validation**: Validates all required fields and references
- **Flexible structure**: Supports optional fields like sections, batches, and subjects

#### Example Use Cases

##### 1. Complete Student Enrollment
```json
{
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "gradeSectionId": "507f1f77bcf86cd799439014",
  "gradeSectionBatchId": "507f1f77bcf86cd799439015",
  "gradeBatchId": "507f1f77bcf86cd799439016",
  "subjectsIds": ["507f1f77bcf86cd799439017", "507f1f77bcf86cd799439018"],
  "memberId": "507f1f77bcf86cd799439019",
  "academicYearId": "507f1f77bcf86cd799439021",
  "status": "active",
  "description": "Regular enrollment for Spring 2024 semester"
}
```

##### 2. Basic Enrollment (Minimal Required Fields)
```json
{
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "memberId": "507f1f77bcf86cd799439019",
  "academicYearId": "507f1f77bcf86cd799439021"
}
```

##### 3. Enrollment with Grade Section Only
```json
{
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "gradeSectionId": "507f1f77bcf86cd799439014",
  "memberId": "507f1f77bcf86cd799439019",
  "academicYearId": "507f1f77bcf86cd799439021",
  "status": "active",
  "description": "Enrollment in Grade 10 Section A"
}
```

##### 4. Enrollment with Batch Information
```json
{
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "gradeBatchId": "507f1f77bcf86cd799439016",
  "memberId": "507f1f77bcf86cd799439019",
  "academicYearId": "507f1f77bcf86cd799439021",
  "status": "active",
  "description": "Enrollment in 2024 batch"
}
```

##### 5. Enrollment with Multiple Subjects
```json
{
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "subjectsIds": [
    "507f1f77bcf86cd799439017",
    "507f1f77bcf86cd799439018",
    "507f1f77bcf86cd799439019"
  ],
  "memberId": "507f1f77bcf86cd799439019",
  "academicYearId": "507f1f77bcf86cd799439021",
  "status": "active",
  "description": "Enrollment with Mathematics, Physics, and Chemistry"
}
```

##### 6. Inactive Enrollment
```json
{
  "instituteId": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "gradeId": "507f1f77bcf86cd799439013",
  "memberId": "507f1f77bcf86cd799439019",
  "academicYearId": "507f1f77bcf86cd799439021",
  "status": "inactive",
  "description": "Temporary inactive enrollment"
}
```

### 3. PUT /enrollments - Update Enrollment

**Purpose**: Update an existing enrollment with comprehensive validation and auto-population features.

#### Key Features
- **Selective updates**: Only update the fields you specify in `updatedData`
- **Auto-population**: `memberType` is automatically populated if `memberId` is updated
- **Unique constraint validation**: Prevents duplicate enrollments after updates
- **Flexible updates**: Update any combination of fields
- **Change tracking**: Returns appropriate messages based on what was actually changed

#### Example Use Cases

##### 1. Update Enrollment Status
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "status": "completed",
    "description": "Enrollment completed successfully"
  }
}
```

##### 2. Update Multiple Fields
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "status": "active",
    "description": "Updated enrollment details",
    "gradeSectionId": "507f1f77bcf86cd799439014",
    "subjectsIds": ["507f1f77bcf86cd799439017", "507f1f77bcf86cd799439018"]
  }
}
```

##### 3. Update Member Information
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "memberId": "507f1f77bcf86cd799439020",
    "description": "Member changed due to transfer"
  }
}
```

##### 4. Update Academic Information
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "gradeId": "507f1f77bcf86cd799439025",
    "gradeSectionId": "507f1f77bcf86cd799439026",
    "academicYearId": "507f1f77bcf86cd799439027",
    "description": "Grade promotion and section change"
  }
}
```

##### 5. Update Subjects Only
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "subjectsIds": [
      "507f1f77bcf86cd799439017",
      "507f1f77bcf86cd799439018",
      "507f1f77bcf86cd799439019",
      "507f1f77bcf86cd799439020"
    ],
    "description": "Added additional subjects to enrollment"
  }
}
```

##### 6. Update Batch Information
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "gradeBatchId": "507f1f77bcf86cd799439030",
    "gradeSectionBatchId": "507f1f77bcf86cd799439031",
    "description": "Batch transfer completed"
  }
}
```

##### 7. Update Description Only
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "updatedData": {
    "description": "Updated enrollment notes and additional information"
  }
}
```

### 4. DELETE /enrollments - Delete Enrollments

**Purpose**: Delete one or more enrollments with advanced dependency management and archiving options.

#### Key Features
- **Bulk deletion**: Delete multiple enrollments in a single request
- **Dependency handling**: Manage dependent records with multiple strategies
- **Archive option**: Archive instead of delete for data preservation
- **Transfer option**: Transfer dependents to another enrollment
- **Cascade deletion**: Delete dependents along with enrollments
- **Conflict resolution**: Handle conflicts between archive and transfer options

#### Deletion Strategies

##### 1. Simple Deletion (No Dependents)
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

##### 2. Archive Enrollments
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "archive": true
}
```

##### 3. Unarchive Enrollments
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "archive": false
}
```

##### 4. Transfer Dependents to Another Enrollment
```json
{
  "ids": ["507f1f77bcf86cd799439011"],
  "transferTo": "507f1f77bcf86cd799439013"
}
```

##### 5. Delete with Dependents (Cascade)
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "deleteDependents": true
}
```

##### 6. Get Dependency Information
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

##### 7. Single Enrollment Deletion
```json
{
  "ids": ["507f1f77bcf86cd799439011"]
}
```

##### 8. Bulk Deletion with Mixed Scenarios
```json
{
  "ids": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014"
  ],
  "deleteDependents": true
}
```

## Response Examples

### GET Response Examples

#### 1. Basic Aggregated Response
```json
{
  "count": 10,
  "filteredDocs": 25,
  "totalDocs": 100,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "instituteId": "507f1f77bcf86cd799439011",
      "departmentId": "507f1f77bcf86cd799439012",
      "gradeId": "507f1f77bcf86cd799439013",
      "memberId": "507f1f77bcf86cd799439019",
      "status": "active",
      "enrollmentDate": "2024-01-15T10:30:00.000Z",
      "instituteName": "ABC University",
      "departmentName": "Computer Science",
      "gradeName": "Grade 10",
      "memberName": "John Doe",
      "academicYear": "2024-2025"
    }
  ]
}
```

#### 2. Dropdown Response
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "instituteId": "507f1f77bcf86cd799439011",
      "departmentId": "507f1f77bcf86cd799439012",
      "gradeId": "507f1f77bcf86cd799439013",
      "memberId": "507f1f77bcf86cd799439019",
      "memberType": "507f1f77bcf86cd799439020",
      "enrollmentDate": "2024-01-15T10:30:00.000Z",
      "status": "active"
    }
  ]
}
```

#### 3. Non-aggregated Response
```json
{
  "count": 5,
  "filteredDocs": 5,
  "totalDocs": 100,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "instituteId": "507f1f77bcf86cd799439011",
      "departmentId": "507f1f77bcf86cd799439012",
      "gradeId": "507f1f77bcf86cd799439013",
      "memberId": "507f1f77bcf86cd799439019",
      "status": "active",
      "enrollmentDate": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### POST Response Examples

#### 1. Successful Creation
```json
{
  "message": "Enrollment added successfully!",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "instituteId": "507f1f77bcf86cd799439011",
    "departmentId": "507f1f77bcf86cd799439012",
    "gradeId": "507f1f77bcf86cd799439013",
    "gradeSectionId": "507f1f77bcf86cd799439014",
    "memberId": "507f1f77bcf86cd799439019",
    "memberType": "507f1f77bcf86cd799439020",
    "academicYearId": "507f1f77bcf86cd799439021",
    "status": "active",
    "enrollmentDate": "2024-01-15T10:30:00.000Z",
    "description": "Regular enrollment for Spring 2024 semester",
    "archive": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Duplicate Enrollment Error
```json
{
  "error": "Duplicate enrollment",
  "details": "A member enrollment already exists for this combination",
  "suggestion": "Please check if this enrollment already exists or modify the combination"
}
```

### PUT Response Examples

#### 1. Success with Changes
```json
{
  "message": "Enrollment updated successfully"
}
```

#### 2. Success but No Changes
```json
{
  "message": "No updates were made"
}
```

### DELETE Response Examples

#### 1. Simple Deletion Success
```json
{
  "message": "Enrollment(s) deleted successfully",
  "deletedCount": 2,
  "deleted": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "dependencies": []
}
```

#### 2. Archive Success
```json
{
  "message": "Enrollment(s) archived successfully",
  "archiveResult": {
    "archivedCount": 2,
    "archivedIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
  }
}
```

#### 3. Transfer Success
```json
{
  "message": "Dependents transferred and Enrollment(s) deleted",
  "transfer": {
    "transferredCount": 5,
    "transferredTo": "507f1f77bcf86cd799439013"
  },
  "deletedCount": 1
}
```

#### 4. Cascade Deletion Success
```json
{
  "message": "Deleted with dependents",
  "results": [
    {
      "enrollmentId": "507f1f77bcf86cd799439011",
      "deletedCount": 1,
      "dependentsDeleted": 3
    },
    {
      "enrollmentId": "507f1f77bcf86cd799439012",
      "deletedCount": 1,
      "dependentsDeleted": 2
    }
  ]
}
```

#### 5. Dependency Summary (201 Response)
```json
{
  "message": "Dependency summary",
  "deleted": [],
  "dependencies": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "value": "active - 2024-01-15T10:30:00.000Z",
      "dependsOn": {
        "SomeModel": 3,
        "AnotherModel": 2
      }
    }
  ]
}
```

## Error Responses

### Common Error Responses

#### 1. Validation Error (400)
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "instituteId",
      "message": "Institute ID is required"
    },
    {
      "field": "memberId",
      "message": "Member ID is required"
    }
  ]
}
```

#### 2. Unauthorized (401)
```json
{
  "message": "Unauthorized access",
  "status": "error"
}
```

#### 3. Not Found (404)
```json
{
  "message": "No matching enrollment found or values are unchanged",
  "status": "error"
}
```

#### 4. Server Error (500)
```json
{
  "message": "Server error",
  "error": "Database connection failed"
}
```

## Unique Constraints

The enrollment system enforces unique constraints to prevent duplicate enrollments:

### For Member Enrollments
- `memberId + instituteId + departmentId + gradeId + gradeSectionId + gradeSectionBatchId + gradeBatchId + academicYearId`

### For General Enrollments
- `instituteId + departmentId + gradeId + gradeSectionId + gradeSectionBatchId + gradeBatchId + academicYearId`

## Auto-population Features

- **memberType**: Automatically populated from `memberId` when creating or updating enrollments
- **enrollmentDate**: Automatically set to current date if not provided
- **archive**: Defaults to `false`
- **status**: Defaults to `"active"`

## Best Practices

1. **Use aggregation for enriched data**: Set `aggregate=true` to get joined data from related collections
2. **Use dropdown mode for UI components**: Set `dropdown=true` for simplified responses in dropdowns
3. **Handle dependencies properly**: Check for dependencies before deletion and choose appropriate strategy
4. **Use pagination for large datasets**: Always specify `page` and `limit` for better performance
5. **Validate unique constraints**: Be aware of unique constraints when creating or updating enrollments
6. **Use appropriate status values**: Use valid status values (active, inactive, completed, dropped)
7. **Handle errors gracefully**: Implement proper error handling for all response scenarios

## Integration Examples

### Frontend Integration

```javascript
// Get enrollments with aggregation
const getEnrollments = async (filters = {}) => {
  const params = new URLSearchParams({
    aggregate: 'true',
    page: '1',
    limit: '10',
    ...filters
  });
  
  const response = await fetch(`/api/enrollments?${params}`);
  return response.json();
};

// Create enrollment
const createEnrollment = async (enrollmentData) => {
  const response = await fetch('/api/enrollments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(enrollmentData)
  });
  return response.json();
};

// Update enrollment
const updateEnrollment = async (id, updatedData) => {
  const response = await fetch('/api/enrollments', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      _id: id,
      updatedData
    })
  });
  return response.json();
};

// Delete enrollment with dependency handling
const deleteEnrollment = async (ids, options = {}) => {
  const response = await fetch('/api/enrollments', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ids,
      ...options
    })
  });
  return response.json();
};
```

This comprehensive documentation covers all aspects of the Enrollments module API with detailed examples for every possible use case and parameter combination.
