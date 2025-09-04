# Grade System Combinational Unique Constraints Fix

## Overview

This document outlines the comprehensive fix applied to all grade-related models and controllers to ensure proper combinational unique constraints work as expected across the entire system.

## Models Updated

### 1. **Grades Model** (`gradesMd.js`)
- **Unique Constraints**: `instituteId + gradeName` and `instituteId + gradeCode`
- **Custom Error Codes**: `DUPLICATE_GRADE_NAME`, `DUPLICATE_GRADE_CODE`
- **Validation**: Pre-save and pre-update middleware for uniqueness checks
- **Archive Handling**: Archived grades don't count for uniqueness

### 2. **Grade Sections Model** (`gradesectionsMd.js`)
- **Unique Constraints**: `instituteId + gradeId + sectionName`
- **Custom Error Codes**: `DUPLICATE_SECTION_NAME`
- **Validation**: Pre-save and pre-update middleware for uniqueness checks
- **Archive Handling**: Archived sections don't count for uniqueness

### 3. **Grade Batches Model** (`gradeBatchesMd.js`)
- **Unique Constraints**: `instituteId + gradeId + batch`
- **Custom Error Codes**: `DUPLICATE_BATCH_NAME`
- **Validation**: Pre-save and pre-update middleware for uniqueness checks
- **Archive Handling**: Archived batches don't count for uniqueness

### 4. **Grade Section Batches Model** (`gradeSectionBatchesMd.js`)
- **Unique Constraints**: `instituteId + sectionId + sectionBatchName`
- **Custom Error Codes**: `DUPLICATE_SECTION_BATCH_NAME`
- **Validation**: Pre-save and pre-update middleware for uniqueness checks
- **Archive Handling**: Archived section batches don't count for uniqueness

### 5. **Departments Model** (`departmentMd.js`)
- **Unique Constraints**: `instituteId + departmentName` and `instituteId + departmentCode`
- **Custom Error Codes**: `DUPLICATE_DEPARTMENT_NAME`, `DUPLICATE_DEPARTMENT_CODE`
- **Validation**: Pre-save and pre-update middleware for uniqueness checks
- **Archive Handling**: Archived departments don't count for uniqueness

### 6. **Institutes Model** (`institutesMd.js`)
- **Unique Constraints**: Global `instituteName` and `instituteCode` (unchanged)
- **Enhancements**: Added `trim: true` to all string fields for consistency

## Controllers Updated

### 1. **Grades Controller** (`gradesCt.js`)
- **Create Function**: Handles `DUPLICATE_GRADE_NAME` and `DUPLICATE_GRADE_CODE`
- **Update Function**: Handles custom error codes with fallback to MongoDB errors
- **Error Messages**: Clear, actionable feedback for users

### 2. **Grade Sections Controller** (`gradeSectionsCt.js`)
- **Create Function**: Handles `DUPLICATE_SECTION_NAME`
- **Update Function**: Handles custom error codes with fallback to MongoDB errors
- **Error Messages**: Clear, actionable feedback for users

### 3. **Grade Batches Controller** (`gradeBatchesCt.js`)
- **Create Function**: Handles `DUPLICATE_BATCH_NAME`
- **Update Function**: Handles custom error codes with fallback to MongoDB errors
- **Error Messages**: Clear, actionable feedback for users

### 4. **Grade Section Batches Controller** (`gradeSectionBatchesCt.js`)
- **Create Function**: Handles `DUPLICATE_SECTION_BATCH_NAME`
- **Update Function**: Handles custom error codes with fallback to MongoDB errors
- **Error Messages**: Clear, actionable feedback for users

### 5. **Departments Controller** (`departmentCt.js`)
- **Create Function**: Handles `DUPLICATE_DEPARTMENT_NAME` and `DUPLICATE_DEPARTMENT_CODE`
- **Update Function**: Handles custom error codes with fallback to MongoDB errors
- **Error Messages**: Clear, actionable feedback for users

### 6. **Institutes Controller** (`institutesCt.js`)
- **Create Function**: Handles MongoDB error code 11000 for global uniqueness
- **Update Function**: Handles MongoDB error code 11000 for global uniqueness
- **Error Messages**: Clear, actionable feedback for users

## Key Improvements Applied

### 1. **Enhanced Schema Definitions**
- Added proper `ref` attributes for all ObjectId fields
- Added `trim: true` to all string fields for data consistency
- Added `timestamps: true` where missing

### 2. **Improved Compound Indexes**
```javascript
// Before: Basic compound indexes
Schema.index(
  { instituteId: 1, fieldName: 1 }, 
  { unique: true, name: 'unique_name' }
);

// After: Enhanced with partial filtering
Schema.index(
  { instituteId: 1, fieldName: 1 }, 
  { 
    unique: true, 
    name: 'unique_name',
    partialFilterExpression: { archive: { $ne: true } }
  }
);
```

### 3. **Schema-Level Validation Middleware**
- **Pre-save Middleware**: Validates uniqueness before saving new documents
- **Pre-update Middleware**: Validates uniqueness before updating existing documents
- **Archive Exclusion**: Archived records don't count for uniqueness
- **Custom Error Codes**: Specific error codes for different constraint violations

### 4. **Enhanced Error Handling**
- **Custom Error Codes**: Specific codes for each type of duplicate
- **Fallback Support**: MongoDB error codes still supported for backward compatibility
- **Clear Messages**: User-friendly error messages with actionable suggestions
- **Field-Specific Feedback**: Indicates which field caused the error

## Uniqueness Rules

### **Within Same Institute:**
- Department names and codes must be unique
- Grade names and codes must be unique
- Section names must be unique per grade
- Batch names must be unique per grade
- Section batch names must be unique per section

### **Across Different Institutes:**
- Same names/codes are allowed (each institute has its own namespace)
- No cross-institute conflicts

### **Archive Handling:**
- Archived records don't block new entries
- Uniqueness only applies to active records

## Validation Flow

```
Create/Update Request
         ↓
   Schema Validation
         ↓
   Pre-save/Pre-update Middleware
         ↓
   Uniqueness Check
         ↓
   Success or Custom Error
         ↓
   Controller Error Handling
         ↓
   User-Friendly Response
```

## Benefits

1. **Data Integrity**: Prevents duplicates across all grade system entities
2. **Better User Experience**: Clear error messages with actionable suggestions
3. **Archive Support**: Archived records don't block new entries
4. **Update Safety**: Prevents accidental duplicates during updates
5. **Performance**: Efficient compound indexes with partial filtering
6. **Maintainability**: Centralized validation logic in schemas
7. **Consistency**: Uniform approach across all models

## Testing Recommendations

### **Test Cases for Each Model:**
1. ✅ Create first entity - Should succeed
2. ✅ Create second entity (different values) - Should succeed
3. ✅ Try to create duplicate - Should fail with custom error
4. ✅ Create in different institute - Should succeed
5. ✅ Update to duplicate - Should fail with custom error
6. ✅ Archive and create duplicate - Should succeed

### **API Testing:**
```bash
# Test Grades
POST /api/grades
{
  "instituteId": "institute1_id",
  "gradeName": "Computer Science",
  "gradeCode": "CS001"
}

# Try duplicate (should fail)
POST /api/grades
{
  "instituteId": "institute1_id",
  "gradeName": "Computer Science",  # Same name
  "gradeCode": "CS002"              # Different code
}
```

## Migration Notes

- **No Breaking Changes**: Existing APIs continue to work
- **Enhanced Validation**: Better error handling and user feedback
- **Index Updates**: New indexes will be created automatically
- **Backward Compatibility**: MongoDB error codes still supported
- **Performance**: Improved query performance with partial indexes

## Troubleshooting

### **Common Issues:**
1. **Index Creation Fails**: Check MongoDB version compatibility
2. **Validation Not Working**: Verify middleware is properly attached
3. **Performance Issues**: Monitor index usage with `explain()`

### **Debug Mode:**
```javascript
mongoose.set('debug', true);
```

## Related Documentation

- [Department Uniques Fix](./DEPARTMENT_UNIQUES_FIX.md)
- [API Documentation](./api-docs/README.md)
- [Swagger Setup](./SWAGGER-SETUP.md)

## Summary

All grade system models now have robust combinational unique constraints that:
- Prevent duplicates within institutes
- Allow duplicates across institutes
- Handle archived records properly
- Provide clear error messages
- Maintain backward compatibility
- Improve overall data integrity

The system is now consistent, reliable, and user-friendly for managing educational data hierarchies.
