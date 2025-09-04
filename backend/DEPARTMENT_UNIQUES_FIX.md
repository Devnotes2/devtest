# Department Combinational Unique Constraints Fix

## Problem Description

The combinational unique constraints for departments were not working as expected due to several issues:

1. **Incomplete Index Definition**: The original compound indexes lacked proper configuration
2. **Missing Validation Middleware**: No pre-save or pre-update validation to catch duplicates
3. **Archive Handling**: Archived departments were still considered in uniqueness checks
4. **Update Validation**: Updates could bypass uniqueness constraints

## Solution Implemented

### 1. Enhanced Schema Definition

- Added `ref: 'instituteData'` to `instituteId` for proper referencing
- Added `trim: true` to string fields for data consistency
- Improved field validation and requirements

### 2. Improved Compound Indexes

```javascript
// Before: Basic compound indexes
DepartmentDataSchema.index(
    { instituteId: 1, departmentName: 1 }, 
    { unique: true, name: 'unique_department_name_per_institute' }
);

// After: Enhanced with partial filtering
DepartmentDataSchema.index(
    { instituteId: 1, departmentName: 1 }, 
    { 
        unique: true, 
        name: 'unique_department_name_per_institute',
        partialFilterExpression: { archive: { $ne: true } }
    }
);
```

**Key Improvements:**
- `partialFilterExpression: { archive: { $ne: true } }` - Only active departments count for uniqueness
- Better index naming and configuration

### 3. Schema-Level Validation Middleware

#### Pre-save Middleware
- Validates uniqueness before saving new documents
- Checks both department name and code within the same institute
- Excludes archived departments from uniqueness checks
- Provides custom error codes for better error handling

#### Pre-update Middleware
- Validates uniqueness before updating existing documents
- Handles both `findOneAndUpdate` operations
- Prevents updates that would create duplicates

### 4. Enhanced Error Handling

**Custom Error Codes:**
- `DUPLICATE_DEPARTMENT_NAME` - When department name already exists
- `DUPLICATE_DEPARTMENT_CODE` - When department code already exists

**Controller Updates:**
- Both `createDepartment` and `updateDepartment` functions handle custom errors
- Fallback to MongoDB error code 11000 for backward compatibility
- Clear error messages with field-specific suggestions

## How It Works

### Uniqueness Rules

1. **Within Same Institute:**
   - Department names must be unique
   - Department codes must be unique
   - Archived departments don't count for uniqueness

2. **Across Different Institutes:**
   - Same department names are allowed
   - Same department codes are allowed
   - Each institute maintains its own namespace

### Validation Flow

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
```

## Testing

### Run the Test Script

```bash
cd backend
node test-department-uniques.js
```

### Test Cases Covered

1. ✅ **Create first department** - Should succeed
2. ✅ **Create second department** - Should succeed (different name/code)
3. ✅ **Duplicate name prevention** - Should fail with custom error
4. ✅ **Duplicate code prevention** - Should fail with custom error
5. ✅ **Cross-institute duplicates** - Should succeed
6. ✅ **Update validation** - Should prevent duplicate updates

### Manual Testing

You can also test manually through your API endpoints:

```bash
# Create first department
POST /api/departments
{
  "instituteId": "institute1_id",
  "departmentName": "Computer Science",
  "departmentCode": "CS001"
}

# Try to create duplicate (should fail)
POST /api/departments
{
  "instituteId": "institute1_id",
  "departmentName": "Computer Science",  # Same name
  "departmentCode": "CS002"              # Different code
}
```

## Benefits

1. **Data Integrity**: Prevents duplicate departments within institutes
2. **Better Error Messages**: Clear, actionable error responses
3. **Archive Support**: Archived departments don't block new entries
4. **Update Safety**: Prevents accidental duplicates during updates
5. **Performance**: Efficient compound indexes with partial filtering
6. **Maintainability**: Centralized validation logic in schema

## Migration Notes

- **No Breaking Changes**: Existing APIs continue to work
- **Enhanced Validation**: Better error handling and user feedback
- **Index Updates**: New indexes will be created automatically
- **Backward Compatibility**: MongoDB error codes still supported

## Related Models

This pattern can be applied to other models with similar requirements:
- Grades (`gradesMd.js`)
- Grade Sections (`gradeSectionsMd.js`)
- Grade Batches (`gradeBatchesMd.js`)
- Subjects (`subjectsMd.js`)

## Troubleshooting

### Common Issues

1. **Index Creation Fails**
   - Check MongoDB version compatibility
   - Ensure no existing duplicate data

2. **Validation Not Working**
   - Verify middleware is properly attached
   - Check for syntax errors in schema

3. **Performance Issues**
   - Monitor index usage with `explain()`
   - Consider adding additional indexes if needed

### Debug Mode

Enable Mongoose debug mode to see validation queries:

```javascript
mongoose.set('debug', true);
```
