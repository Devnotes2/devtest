# Enrollments Module Documentation

## Overview
The Enrollments module manages student enrollments within institutes, departments, grades, and academic years. It follows the existing architecture pattern and provides comprehensive CRUD operations with dependency handling.

## Module Structure

### Files Created
1. **Model**: `Model/enrollments/enrollmentsMd.js`
2. **Controller**: `Controller/enrollments/enrollmentsCt.js`
3. **Routes**: `routes/enrollments/enrollmentsRt.js`
4. **Utilities**: `Utilities/aggregations/enrollments/enrollmentsLookups.js`
5. **Integration**: Updated `routes/routes.js`

## Schema Definition

### Enrollments Model Fields
- `_id`: MongoDB ObjectId (auto-generated)
- `instituteId`: ObjectId (required) - Reference to instituteData
- `departmentId`: ObjectId (required) - Reference to DepartmentData
- `gradeId`: ObjectId (required) - Reference to Grades
- `gradeSectionId`: ObjectId (optional) - Reference to GradeSections
- `gradeSectionBatchId`: ObjectId (optional) - Reference to GradeSectionBatches
- `gradeBatchId`: ObjectId (optional) - Reference to GradeBatches
- `subjectsIds`: Array of ObjectIds (optional) - Reference to Subjects
- `memberId`: ObjectId (optional) - Reference to MembersData
- `memberType`: ObjectId (auto-populated) - Reference to generalData (member types, automatically set from memberId)
- `enrollmentDate`: Date (required, default: Date.now)
- `academicYearId`: ObjectId (required) - Reference to academicYear
- `status`: String (enum: 'active', 'inactive', 'completed', 'dropped', default: 'active')
- `description`: String (optional)
- `archive`: Boolean (default: false)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

## API Endpoints

### Base URL
```
/enrollments
```

### Available Operations

#### 1. Get Enrollments (GET)
```
GET /instituteAggreRt/enrollments
```

**Query Parameters:**
- `ids`: Array of enrollment IDs (optional)
- `aggregate`: 'true'/'false' (default: 'true')
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `dropdown`: 'true' for dropdown data (optional)
- `instituteId`: Filter by institute ID
- `departmentId`: Filter by department ID
- `gradeId`: Filter by grade ID
- `gradeSectionId`: Filter by grade section ID
- `gradeSectionBatchId`: Filter by grade section batch ID
- `gradeBatchId`: Filter by grade batch ID
- `memberId`: Filter by member ID
- `memberType`: Filter by member type (auto-populated from memberId)
- `academicYearId`: Filter by academic year ID
- `status`: Filter by enrollment status
- `sortField`: Field to sort by
- `sort`: Sort direction ('asc'/'desc')

**Response:**
```json
{
  "count": 10,
  "filteredDocs": 25,
  "totalDocs": 100,
  "data": [
    {
      "_id": "ObjectId",
      "instituteId": "ObjectId",
      "departmentId": "ObjectId",
      "gradeId": "ObjectId",
      "gradeSectionId": "ObjectId",
      "gradeSectionBatchId": "ObjectId",
      "gradeBatchId": "ObjectId",
      "subjectsIds": ["ObjectId1", "ObjectId2"],
      "memberId": "ObjectId",
      "memberType": "ObjectId",
      "enrollmentDate": "2024-01-15T00:00:00.000Z",
      "academicYearId": "ObjectId",
      "status": "active",
      "description": "Regular enrollment",
      "archive": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "instituteName": "ABC Institute",
      "departmentName": "Computer Science",
      "gradeName": "Grade 10",
      "gradeCode": "G10",
      "gradeDuration": "ObjectId",
      "batchName": "Batch A",
      "sectionName": "Section 1",
      "sectionBatchName": "Section Batch A",
      "academicYear": "01/04/2024-31/03/2025",
      "subjects": [
        {
          "_id": "ObjectId",
          "subject": "Mathematics",
          "subjectCode": "MATH101"
        }
      ],
      "memberName": "John Doe",
      "memberId": "STU001",
      "memberType": "Student"
    }
  ]
}
```

#### 2. Create Enrollment (POST)
```
POST /instituteAggreRt/enrollments
```

**Request Body:**
```json
{
  "instituteId": "ObjectId",
  "departmentId": "ObjectId",
  "gradeId": "ObjectId",
  "gradeSectionId": "ObjectId", // optional
  "gradeSectionBatchId": "ObjectId", // optional
  "gradeBatchId": "ObjectId", // optional
  "subjectsIds": ["ObjectId1", "ObjectId2"], // optional
  "memberId": "ObjectId", // optional
  // memberType is auto-populated from memberId
  "academicYearId": "ObjectId",
  "status": "active", // optional, default: "active"
  "description": "Regular enrollment" // optional
}
```

**Response:**
```json
{
  "message": "Enrollment added successfully!",
  "data": {
    "_id": "ObjectId",
    "instituteId": "ObjectId",
    "departmentId": "ObjectId",
    "gradeId": "ObjectId",
    "gradeSectionId": "ObjectId",
          "gradeSectionBatchId": "ObjectId",
      "gradeBatchId": "ObjectId",
      "subjectsIds": ["ObjectId1", "ObjectId2"],
      "memberId": "ObjectId",
      "memberType": "ObjectId",
      "enrollmentDate": "2024-01-15T00:00:00.000Z",
      "academicYearId": "ObjectId",
      "status": "active",
      "description": "Regular enrollment",
      "archive": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 3. Update Enrollment (PUT)
```
PUT /instituteAggreRt/enrollments
```

**Request Body:**
```json
{
  "_id": "ObjectId",
  "updatedData": {
    "status": "completed",
    "description": "Updated description"
  }
}
```

**Response:**
```json
{
  "message": "Enrollment updated successfully"
}
```

#### 4. Delete Enrollment(s) (DELETE)
```
DELETE /instituteAggreRt/enrollments
```

**Request Body:**
```json
{
  "ids": ["ObjectId1", "ObjectId2"],
  "deleteDependents": false, // optional
  "transferTo": "ObjectId", // optional
  "archive": true // optional
}
```

**Response Options:**

**Simple Delete (no dependencies):**
```json
{
  "message": "Enrollment(s) deleted successfully",
  "deleted": ["ObjectId1", "ObjectId2"],
  "dependencies": []
}
```

**Dependencies Found:**
```json
{
  "message": "Dependency summary",
  "deleted": ["ObjectId1"],
  "dependencies": [
    {
      "_id": "ObjectId2",
      "value": "active - 2024-01-15T00:00:00.000Z",
      "dependsOn": {
        "someData": 5
      }
    }
  ]
}
```

**Archive/Unarchive:**
```json
{
  "message": "Enrollment(s) archived successfully",
  "archiveResult": {
    "archivedCount": 2,
    "archivedIds": ["ObjectId1", "ObjectId2"]
  }
}
```

## Validation Rules

### Unique Constraints
- **General Enrollments**: Combination of `instituteId`, `departmentId`, `gradeId`, `gradeSectionId`, `gradeSectionBatchId`, `gradeBatchId`, and `academicYearId` must be unique (excluding archived records and member-specific enrollments)
- **Member Enrollments**: Combination of `memberId`, `instituteId`, `departmentId`, `gradeId`, `gradeSectionId`, `gradeSectionBatchId`, `gradeBatchId`, and `academicYearId` must be unique (excluding archived records)

### Required Fields
- `instituteId`
- `departmentId`
- `gradeId`
- `academicYearId`
- `enrollmentDate` (auto-generated if not provided)

### Optional Fields
- `gradeSectionId`
- `gradeSectionBatchId`
- `gradeBatchId`
- `subjectsIds`
- `memberId` (memberType is auto-populated from this field)
- `status` (defaults to 'active')
- `description`

## Error Handling

### Common Error Responses

**Duplicate Enrollment:**
```json
{
  "error": "Duplicate enrollment",
  "details": "A member enrollment already exists for this combination",
  "suggestion": "Please check if this enrollment already exists or modify the combination"
}
```

**Validation Error:**
```json
{
  "error": "Failed to add enrollment",
  "details": "Validation error message"
}
```

**Server Error:**
```json
{
  "message": "Server error",
  "error": "Error message details"
}
```

## Features

### 1. Comprehensive Filtering
- Filter by any combination of institute, department, grade, section, batch, academic year, and status
- Support for value-based filtering on joined fields

### 2. Advanced Aggregation
- Automatic lookup of related data (institute, department, grade, subjects, etc.)
- Formatted academic year display
- Subject details with names and codes

### 3. Pagination & Sorting
- Configurable page size and page number
- Sort by any field in ascending or descending order
- Total count and filtered count in responses

### 4. Dependency Management
- Archive/unarchive functionality
- Dependency checking before deletion
- Transfer dependencies to other records
- Cascade deletion with dependencies

### 5. Dropdown Support
- Lightweight data for dropdown/select components
- Optimized queries for better performance

### 6. Auto-Population
- memberType is automatically populated from memberId when creating/updating enrollments
- No need for clients to provide memberType - it's determined from the member's data
- Ensures data consistency and reduces client-side complexity

## Usage Examples

### Create a Basic Enrollment
```javascript
const enrollmentData = {
  instituteId: "64a1b2c3d4e5f6789012345",
  departmentId: "64a1b2c3d4e5f6789012346",
  gradeId: "64a1b2c3d4e5f6789012347",
  academicYearId: "64a1b2c3d4e5f6789012348"
};

fetch('/enrollments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(enrollmentData)
});
```

### Create a Member Enrollment
```javascript
const memberEnrollmentData = {
  instituteId: "64a1b2c3d4e5f6789012345",
  departmentId: "64a1b2c3d4e5f6789012346",
  gradeId: "64a1b2c3d4e5f6789012347",
  gradeSectionId: "64a1b2c3d4e5f6789012349",
  gradeBatchId: "64a1b2c3d4e5f6789012350",
  memberId: "64a1b2c3d4e5f6789012351", // memberType is auto-populated from this
  subjectsIds: ["64a1b2c3d4e5f6789012353", "64a1b2c3d4e5f6789012354"],
  academicYearId: "64a1b2c3d4e5f6789012348",
  status: "active",
  description: "Student enrollment for Grade 10"
};

fetch('/enrollments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(memberEnrollmentData)
});
```

### Get Enrollments with Filtering
```javascript
const params = new URLSearchParams({
  instituteId: "64a1b2c3d4e5f6789012345",
  status: "active",
  page: "1",
  limit: "10"
});

fetch(`/enrollments?${params}`);
```

### Get Member Enrollments
```javascript
const params = new URLSearchParams({
  memberId: "64a1b2c3d4e5f6789012351",
  status: "active",
  page: "1",
  limit: "10"
});

fetch(`/enrollments?${params}`);
```

### Archive Multiple Enrollments
```javascript
fetch('/enrollments', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ids: ["64a1b2c3d4e5f6789012345", "64a1b2c3d4e5f6789012346"],
    archive: true
  })
});
```

## Integration Notes

- The module follows the existing multi-tenant architecture
- Uses the same middleware and authentication patterns
- Integrates with the existing dependency cascade utilities
- Compatible with the current pagination and filtering systems
- Follows the established error handling patterns

## Future Enhancements

1. **Bulk Operations**: Support for bulk enrollment creation
2. **Enrollment History**: Track enrollment changes over time
3. **Capacity Management**: Check and enforce enrollment limits
4. **Automated Workflows**: Auto-enrollment based on rules
5. **Reporting**: Advanced enrollment analytics and reports
