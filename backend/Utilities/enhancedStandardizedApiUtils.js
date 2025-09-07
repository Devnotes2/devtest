/**
 * Enhanced Standardized API Utilities
 * Provides consistent API behavior across all endpoints with configurable response codes and flexible features
 * All responses use flat structure (no nested objects)
 * 
 * See README.md for detailed usage instructions and examples
 */

const { ObjectId } = require('mongoose').Types;
const { buildMatchConditions, buildSortObject, validateUniqueField, buildValueBasedMatchStage } = require('./filterSortUtils');
const buildGenericAggregation = require('./genericAggregatorUtils');
const addPaginationAndSort = require('./paginationControllsUtils');
const { handleCRUD } = require('./crudUtils');

/**
 * Default response codes configuration
 */
const DEFAULT_RESPONSE_CODES = {
  success: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  unprocessableEntity: 422,
  internalServerError: 500
};

/**
 * Default response messages
 */
const DEFAULT_MESSAGES = {
  success: 'Operation completed successfully',
  created: 'Resource created successfully',
  updated: 'Resource updated successfully',
  deleted: 'Resource deleted successfully',
  notFound: 'Resource not found',
  alreadyExists: 'Resource already exists',
  validationFailed: 'Validation failed',
  unauthorized: 'Unauthorized access',
  forbidden: 'Access forbidden',
  serverError: 'Internal server error'
};

/**
 * Simple cache implementation (can be replaced with Redis)
 */
const simpleCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (req, suffix = '') => {
  const baseKey = `${req.collegeDB}_${req.route?.path || req.path}_${JSON.stringify(req.query)}`;
  return suffix ? `${baseKey}_${suffix}` : baseKey;
};

const getFromCache = (key) => {
  const cached = simpleCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  simpleCache.delete(key);
  return null;
};

const setCache = (key, data) => {
  simpleCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

/**
 * Enhanced response helper with flat structure
 */
const sendResponse = (res, options = {}) => {
  const {
    statusCode = DEFAULT_RESPONSE_CODES.success,
    message = DEFAULT_MESSAGES.success,
    data = null,
    count = null,
    filteredDocs = null,
    totalDocs = null,
    page = null,
    limit = null,
    mode = null,
    errors = null,
    warnings = null,
    responseCodes = DEFAULT_RESPONSE_CODES,
    messages = DEFAULT_MESSAGES,
    includeTimestamp = true,
    includeRequestId = true,
    customFields = {},
    version = '1.0',
    requestId = null,
    timestamp = null,
    success = null,
    created = null,
    modified = null,
    deleted = null,
    modifiedCount = null,
    matchedCount = null,
    deletedCount = null,
    dependentCount = null,
    dependencyName = null,
    validationField = null,
    validationValue = null,
    exists = null,
    id = null,
    deletedIds = null
  } = options;

  // Build flat response object
  const response = {
    success: success !== null ? success : (statusCode >= 200 && statusCode < 300),
    message,
    version,
    ...customFields
  };

  // Add data if present
  if (data !== null) {
    response.data = data;
  }

  // Add pagination info
  if (count !== null) response.count = count;
  if (filteredDocs !== null) response.filteredDocs = filteredDocs;
  if (totalDocs !== null) response.totalDocs = totalDocs;
  if (page !== null) response.page = page;
  if (limit !== null) response.limit = limit;
  if (mode !== null) response.mode = mode;

  // Add operation results
  if (created !== null) response.created = created;
  if (modified !== null) response.modified = modified;
  if (deleted !== null) response.deleted = deleted;
  if (modifiedCount !== null) response.modifiedCount = modifiedCount;
  if (matchedCount !== null) response.matchedCount = matchedCount;
  if (deletedCount !== null) response.deletedCount = deletedCount;

  // Add validation info
  if (exists !== null) response.exists = exists;
  if (validationField !== null) response.validationField = validationField;
  if (validationValue !== null) response.validationValue = validationValue;

  // Add dependency info
  if (dependentCount !== null) response.dependentCount = dependentCount;
  if (dependencyName !== null) response.dependencyName = dependencyName;

  // Add IDs
  if (id !== null) response.id = id;
  if (deletedIds !== null) response.deletedIds = deletedIds;

  // Add errors and warnings
  if (errors && errors.length > 0) {
    response.errors = errors;
  }
  if (warnings && warnings.length > 0) {
    response.warnings = warnings;
  }

  // Add metadata
  if (includeTimestamp) {
    response.timestamp = timestamp || new Date().toISOString();
  }
  if (includeRequestId) {
    response.requestId = requestId || res.locals.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  return res.status(statusCode).json(response);
};

/**
 * Enhanced standardized GET handler with all features
 */
exports.enhancedStandardizedGet = async (req, res, createModel, options = {}) => {
  const {
    lookups = [],
    joinedFieldMap = {},
    dropdownFields = ['_id', 'name'],
    validationField = null,
    defaultSort = { createdAt: -1 },
    projectFields = null,
    transformData = null,
    responseCodes = DEFAULT_RESPONSE_CODES,
    messages = DEFAULT_MESSAGES,
    includeTimestamp = true,
    includeRequestId = true,
    customResponseFields = {},
    enableCaching = false,
    cacheKey = null,
    cacheTTL = 300,
    enableAuditLog = false,
    auditAction = 'READ',
    customValidation = null,
    preProcess = null,
    postProcess = null,
    errorHandling = 'standard',
    version = '1.0',
    slowQueryThreshold = 1000,
    logSlowQueries = true
  } = options;

  const startTime = Date.now();
  const Model = createModel(req.collegeDB);
  const { ids, aggregate, page, limit, validate, dropdown } = req.query;
  
  try {
    // Check cache first
    if (enableCaching) {
      const key = cacheKey || getCacheKey(req, 'get');
      const cachedData = getFromCache(key);
      if (cachedData) {
        return sendResponse(res, {
          ...cachedData,
          responseCodes,
          messages,
          includeTimestamp,
          includeRequestId,
          customFields: customResponseFields,
          version
        });
      }
    }

    // Pre-processing hook
    if (preProcess && typeof preProcess === 'function') {
      await preProcess(req, res, Model);
    }

    // Custom validation hook
    if (customValidation && typeof customValidation === 'function') {
      const validationResult = await customValidation(req, res, Model);
      if (validationResult && !validationResult.valid) {
        return sendResponse(res, {
          statusCode: responseCodes.badRequest,
          message: validationResult.message || messages.validationFailed,
          errors: validationResult.errors,
          responseCodes,
          messages,
          includeTimestamp,
          includeRequestId,
          customFields: customResponseFields,
          version
        });
      }
    }

    // Build match conditions and sort
    const matchConditions = buildMatchConditions(req.query);
    let valueBasedField = matchConditions.__valueBasedField;
    if (valueBasedField) delete matchConditions.__valueBasedField;
    
    const sortObj = buildSortObject(req.query) || defaultSort;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Dropdown mode
    if (dropdown === 'true') {
      const fields = {};
      dropdownFields.forEach(field => {
        fields[field] = 1;
      });
      
      let findQuery = Model.find({ ...matchConditions, archive: { $ne: true } }, fields);
      findQuery = findQuery.sort({ [dropdownFields[1] || 'name']: 1 });
      const data = await findQuery;
      
      const transformedData = transformData ? transformData(data) : data;
      
      const responseData = {
        statusCode: responseCodes.success,
        message: messages.success,
        data: transformedData,
        count: transformedData.length,
        mode: 'dropdown',
        responseCodes,
        messages,
        includeTimestamp,
        includeRequestId,
        customFields: customResponseFields,
        version
      };

      // Cache the response
      if (enableCaching) {
        const key = cacheKey || getCacheKey(req, 'dropdown');
        setCache(key, responseData);
      }

      return sendResponse(res, responseData);
    }

    // Validation mode
    if (validate === 'true' && validationField && req.query[validationField]) {
      const exists = await validateUniqueField(Model, validationField, req.query[validationField]);
      return sendResponse(res, {
        statusCode: responseCodes.success,
        message: exists ? messages.alreadyExists : messages.success,
        exists,
        validationField,
        validationValue: req.query[validationField],
        responseCodes,
        messages,
        includeTimestamp,
        includeRequestId,
        customFields: customResponseFields,
        version
      });
    }

    // Get total docs
    const totalDocs = await Model.countDocuments();
    let filteredDocs;

    // Handle specific IDs
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      
      if (aggregate === 'false') {
        // Simple find for specific IDs
        let query = Model.find({ _id: { $in: objectIds }, ...matchConditions });
        if (sortObj) query = query.sort(sortObj);
        query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
        const matchingData = await query;
        filteredDocs = await Model.countDocuments({ _id: { $in: objectIds }, ...matchConditions });
        
        const transformedData = transformData ? transformData(matchingData) : matchingData;
        
        const responseData = {
          statusCode: responseCodes.success,
          message: messages.success,
          data: transformedData,
          count: transformedData.length,
          filteredDocs,
          totalDocs,
          page: pageNum,
          limit: limitNum,
          mode: 'simple',
          responseCodes,
          messages,
          includeTimestamp,
          includeRequestId,
          customFields: customResponseFields,
          version
        };

        // Cache the response
        if (enableCaching) {
          const key = cacheKey || getCacheKey(req, 'ids_simple');
          setCache(key, responseData);
        }

        return sendResponse(res, responseData);
      }

      // Aggregation for specific IDs
      let pipeline = buildGenericAggregation({ 
        filters: { _id: { $in: objectIds }, ...matchConditions }, 
        lookups 
      });
      
      const valueMatch = buildValueBasedMatchStage(valueBasedField, joinedFieldMap);
      if (valueMatch) pipeline.push(valueMatch);
      
      pipeline.push({ $sort: sortObj });
      
      if (projectFields) {
        pipeline.push({ $project: projectFields });
      }
      
      const countPipeline = pipeline.filter(stage => 
        !stage.$skip && !stage.$limit && !stage.$sort && !stage.$project
      );
      const filteredDocsArr = await Model.aggregate([...countPipeline, { $count: 'count' }]);
      filteredDocs = filteredDocsArr[0]?.count || 0;
      
      addPaginationAndSort(pipeline, { page: pageNum, limit: limitNum, sort: {} });
      const data = await Model.aggregate(pipeline);
      
      const transformedData = transformData ? transformData(data) : data;
      
      const responseData = {
        statusCode: responseCodes.success,
        message: messages.success,
        data: transformedData,
        count: transformedData.length,
        filteredDocs,
        totalDocs,
        page: pageNum,
        limit: limitNum,
        mode: 'aggregated',
        responseCodes,
        messages,
        includeTimestamp,
        includeRequestId,
        customFields: customResponseFields,
        version
      };

      // Cache the response
      if (enableCaching) {
        const key = cacheKey || getCacheKey(req, 'ids_aggregated');
        setCache(key, responseData);
      }

      return sendResponse(res, responseData);
    }

    // Aggregation mode (default)
    if (aggregate !== 'false') {
      let pipeline = buildGenericAggregation({ filters: matchConditions, lookups });
      
      const valueMatch = buildValueBasedMatchStage(valueBasedField, joinedFieldMap);
      if (valueMatch) pipeline.push(valueMatch);
      
      pipeline.push({ $sort: sortObj });
      
      if (projectFields) {
        pipeline.push({ $project: projectFields });
      }
      
      const countPipeline = pipeline.filter(stage => 
        !stage.$skip && !stage.$limit && !stage.$sort && !stage.$project
      );
      const filteredDocsArr = await Model.aggregate([...countPipeline, { $count: 'count' }]);
      filteredDocs = filteredDocsArr[0]?.count || 0;
      
      addPaginationAndSort(pipeline, { page: pageNum, limit: limitNum, sort: {} });
      const data = await Model.aggregate(pipeline);
      
      const transformedData = transformData ? transformData(data) : data;
      
      const responseData = {
        statusCode: responseCodes.success,
        message: messages.success,
        data: transformedData,
        count: transformedData.length,
        filteredDocs,
        totalDocs,
        page: pageNum,
        limit: limitNum,
        mode: 'aggregated',
        responseCodes,
        messages,
        includeTimestamp,
        includeRequestId,
        customFields: customResponseFields,
        version
      };

      // Cache the response
      if (enableCaching) {
        const key = cacheKey || getCacheKey(req, 'aggregated');
        setCache(key, responseData);
      }

      return sendResponse(res, responseData);
    }

    // Simple find mode
    let query = Model.find(matchConditions);
    if (sortObj) query = query.sort(sortObj);
    query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    const data = await query;
    filteredDocs = await Model.countDocuments(matchConditions);
    
    const transformedData = transformData ? transformData(data) : data;
    
    // Post-processing hook
    if (postProcess && typeof postProcess === 'function') {
      await postProcess(req, res, transformedData);
    }

    const responseData = {
      statusCode: responseCodes.success,
      message: messages.success,
      data: transformedData,
      count: transformedData.length,
      filteredDocs,
      totalDocs,
      page: pageNum,
      limit: limitNum,
      mode: 'simple',
      responseCodes,
      messages,
      includeTimestamp,
      includeRequestId,
      customFields: customResponseFields,
      version
    };

    // Cache the response
    if (enableCaching) {
      const key = cacheKey || getCacheKey(req, 'simple');
      setCache(key, responseData);
    }

    // Log slow queries
    const queryTime = Date.now() - startTime;
    if (logSlowQueries && queryTime > slowQueryThreshold) {
      console.warn(`Slow query detected: ${queryTime}ms for ${req.path}`);
    }

    return sendResponse(res, responseData);

  } catch (error) {
    // Enhanced error handling
    let errorResponse = {
      statusCode: responseCodes.internalServerError,
      message: messages.serverError,
      responseCodes,
      messages,
      includeTimestamp,
      includeRequestId,
      customFields: customResponseFields,
      version
    };

    if (errorHandling === 'detailed') {
      errorResponse.errors = [{
        field: 'server',
        message: error.message,
        code: error.code || 'INTERNAL_ERROR'
      }];
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
      }
    } else if (errorHandling === 'minimal') {
      errorResponse.message = 'An error occurred';
    }

    return sendResponse(res, errorResponse);
  }
};

/**
 * Enhanced standardized POST handler with all features
 */
exports.enhancedStandardizedPost = async (req, res, createModel, options = {}) => {
  const {
    successMessage = DEFAULT_MESSAGES.created,
    requiredFields = [],
    uniqueFields = [],
    transformData = null,
    responseCodes = DEFAULT_RESPONSE_CODES,
    messages = DEFAULT_MESSAGES,
    includeTimestamp = true,
    includeRequestId = true,
    customResponseFields = {},
    enableAuditLog = false,
    auditAction = 'CREATE',
    customValidation = null,
    preProcess = null,
    postProcess = null,
    errorHandling = 'standard',
    allowPartialSuccess = false,
    batchMode = false,
    version = '1.0',
    rateLimit = null
  } = options;

  const startTime = Date.now();
  const Model = createModel(req.collegeDB);
  
  try {
    // Rate limiting check
    if (rateLimit) {
      const key = `rate_limit_${req.ip}_${req.path}`;
      const current = simpleCache.get(key) || { count: 0, resetTime: Date.now() + rateLimit.windowMs };
      
      if (Date.now() > current.resetTime) {
        current.count = 0;
        current.resetTime = Date.now() + rateLimit.windowMs;
      }
      
      if (current.count >= rateLimit.max) {
        return sendResponse(res, {
          statusCode: responseCodes.badRequest,
          message: 'Rate limit exceeded',
          responseCodes,
          messages,
          includeTimestamp,
          includeRequestId,
          customFields: customResponseFields,
          version
        });
      }
      
      current.count++;
      simpleCache.set(key, current);
    }

    // Pre-processing hook
    if (preProcess && typeof preProcess === 'function') {
      await preProcess(req, res, Model);
    }

    // Custom validation hook
    if (customValidation && typeof customValidation === 'function') {
      const validationResult = await customValidation(req, res, Model);
      if (validationResult && !validationResult.valid) {
        return sendResponse(res, {
          statusCode: responseCodes.badRequest,
          message: validationResult.message || messages.validationFailed,
          errors: validationResult.errors,
          responseCodes,
          messages,
          includeTimestamp,
          includeRequestId,
          customFields: customResponseFields,
          version
        });
      }
    }

    // Required fields validation
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return sendResponse(res, {
        statusCode: responseCodes.badRequest,
        message: messages.validationFailed,
        errors: missingFields.map(field => ({
          field,
          message: `${field} is required`,
          code: 'REQUIRED_FIELD'
        })),
        responseCodes,
        messages,
        includeTimestamp,
        includeRequestId,
        customFields: customResponseFields,
        version
      });
    }

    // Unique fields validation
    for (const uniqueField of uniqueFields) {
      const fields = Array.isArray(uniqueField.fields) ? uniqueField.fields : [uniqueField.fields];
      const values = fields.map(field => req.body[field]).filter(val => val !== undefined);
      
      if (values.length > 0) {
        const query = {};
        fields.forEach((field, index) => {
          if (values[index] !== undefined) {
            query[field] = values[index];
          }
        });
        
        const existing = await Model.findOne(query);
        if (existing) {
          return sendResponse(res, {
            statusCode: responseCodes.conflict,
            message: uniqueField.message || messages.alreadyExists,
            errors: [{
              field: fields.join(','),
              message: uniqueField.message || `${fields.join(', ')} already exists`,
              code: 'DUPLICATE_VALUE'
            }],
            responseCodes,
            messages,
            includeTimestamp,
            includeRequestId,
            customFields: customResponseFields,
            version
          });
        }
      }
    }

    // Transform data if provided
    const dataToCreate = transformData ? transformData(req.body) : req.body;

    // Create the document
    const newDocument = await handleCRUD(Model, 'create', {}, dataToCreate);

    // Post-processing hook
    if (postProcess && typeof postProcess === 'function') {
      await postProcess(req, res, newDocument);
    }

    // Audit logging
    if (enableAuditLog) {
      console.log(`AUDIT: ${auditAction} - ${req.path} - User: ${req.user?.id || 'anonymous'} - Time: ${Date.now() - startTime}ms`);
    }

    return sendResponse(res, {
      statusCode: responseCodes.created,
      message: successMessage,
      data: newDocument,
      created: true,
      id: newDocument._id,
      responseCodes,
      messages,
      includeTimestamp,
      includeRequestId,
      customFields: customResponseFields,
      version
    });

  } catch (error) {
    let errorResponse = {
      statusCode: responseCodes.internalServerError,
      message: messages.serverError,
      responseCodes,
      messages,
      includeTimestamp,
      includeRequestId,
      customFields: customResponseFields,
      version
    };

    if (errorHandling === 'detailed') {
      errorResponse.errors = [{
        field: 'server',
        message: error.message,
        code: error.code || 'INTERNAL_ERROR'
      }];
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
      }
    } else if (errorHandling === 'minimal') {
      errorResponse.message = 'An error occurred';
    }

    return sendResponse(res, errorResponse);
  }
};

/**
 * Enhanced standardized PUT handler with all features
 */
exports.enhancedStandardizedPut = async (req, res, createModel, options = {}) => {
  const {
    successMessage = DEFAULT_MESSAGES.updated,
    uniqueFields = [],
    transformData = null,
    responseCodes = DEFAULT_RESPONSE_CODES,
    messages = DEFAULT_MESSAGES,
    includeTimestamp = true,
    includeRequestId = true,
    customResponseFields = {},
    enableAuditLog = false,
    auditAction = 'UPDATE',
    customValidation = null,
    preProcess = null,
    postProcess = null,
    errorHandling = 'standard',
    allowPartialUpdate = false,
    validateExistence = true,
    version = '1.0'
  } = options;

  const startTime = Date.now();
  const Model = createModel(req.collegeDB);
  const { _id, updatedData } = req.body;
  
  try {
    // Pre-processing hook
    if (preProcess && typeof preProcess === 'function') {
      await preProcess(req, res, Model);
    }

    // Validate existence
    if (validateExistence) {
      const existing = await Model.findById(_id);
      if (!existing) {
        return sendResponse(res, {
          statusCode: responseCodes.notFound,
          message: messages.notFound,
          responseCodes,
          messages,
          includeTimestamp,
          includeRequestId,
          customFields: customResponseFields,
          version
        });
      }
    }

    // Custom validation hook
    if (customValidation && typeof customValidation === 'function') {
      const validationResult = await customValidation(req, res, Model);
      if (validationResult && !validationResult.valid) {
        return sendResponse(res, {
          statusCode: responseCodes.badRequest,
          message: validationResult.message || messages.validationFailed,
          errors: validationResult.errors,
          responseCodes,
          messages,
          includeTimestamp,
          includeRequestId,
          customFields: customResponseFields,
          version
        });
      }
    }

    // Unique fields validation
    for (const uniqueField of uniqueFields) {
      const fields = Array.isArray(uniqueField.fields) ? uniqueField.fields : [uniqueField.fields];
      const values = fields.map(field => updatedData[field]).filter(val => val !== undefined);
      
      if (values.length > 0) {
        const query = { _id: { $ne: _id } };
        fields.forEach((field, index) => {
          if (values[index] !== undefined) {
            query[field] = values[index];
          }
        });
        
        const existing = await Model.findOne(query);
        if (existing) {
          return sendResponse(res, {
            statusCode: responseCodes.conflict,
            message: uniqueField.message || messages.alreadyExists,
            errors: [{
              field: fields.join(','),
              message: uniqueField.message || `${fields.join(', ')} already exists`,
              code: 'DUPLICATE_VALUE'
            }],
            responseCodes,
            messages,
            includeTimestamp,
            includeRequestId,
            customFields: customResponseFields,
            version
          });
        }
      }
    }

    // Transform data if provided
    const dataToUpdate = transformData ? transformData(updatedData) : updatedData;

    // Update the document
    const result = await handleCRUD(Model, 'update', { _id }, { $set: dataToUpdate });

    if (result.modifiedCount > 0) {
      // Post-processing hook
      if (postProcess && typeof postProcess === 'function') {
        await postProcess(req, res, result);
      }

      // Audit logging
      if (enableAuditLog) {
        console.log(`AUDIT: ${auditAction} - ${req.path} - User: ${req.user?.id || 'anonymous'} - Time: ${Date.now() - startTime}ms`);
      }

      return sendResponse(res, {
        statusCode: responseCodes.success,
        message: successMessage,
        data: { _id, modified: true },
        modified: true,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        responseCodes,
        messages,
        includeTimestamp,
        includeRequestId,
        customFields: customResponseFields,
        version
      });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      return sendResponse(res, {
        statusCode: responseCodes.success,
        message: 'No updates were made',
        data: { _id, modified: false },
        modified: false,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        responseCodes,
        messages,
        includeTimestamp,
        includeRequestId,
        customFields: customResponseFields,
        version
      });
    } else {
      return sendResponse(res, {
        statusCode: responseCodes.notFound,
        message: messages.notFound,
        responseCodes,
        messages,
        includeTimestamp,
        includeRequestId,
        customFields: customResponseFields,
        version
      });
    }

  } catch (error) {
    let errorResponse = {
      statusCode: responseCodes.internalServerError,
      message: messages.serverError,
      responseCodes,
      messages,
      includeTimestamp,
      includeRequestId,
      customFields: customResponseFields,
      version
    };

    if (errorHandling === 'detailed') {
      errorResponse.errors = [{
        field: 'server',
        message: error.message,
        code: error.code || 'INTERNAL_ERROR'
      }];
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
      }
    } else if (errorHandling === 'minimal') {
      errorResponse.message = 'An error occurred';
    }

    return sendResponse(res, errorResponse);
  }
};

/**
 * Enhanced standardized DELETE handler with all features
 */
exports.enhancedStandardizedDelete = async (req, res, createModel, options = {}) => {
  const {
    successMessage = DEFAULT_MESSAGES.deleted,
    dependencies = [],
    modelName = 'Resource',
    responseCodes = DEFAULT_RESPONSE_CODES,
    messages = DEFAULT_MESSAGES,
    includeTimestamp = true,
    includeRequestId = true,
    customResponseFields = {},
    enableAuditLog = false,
    auditAction = 'DELETE',
    customValidation = null,
    preProcess = null,
    postProcess = null,
    errorHandling = 'standard',
    softDelete = false,
    cascadeDelete = false,
    archiveMode = false,
    version = '1.0'
  } = options;

  const startTime = Date.now();
  const Model = createModel(req.collegeDB);
  const { ids } = req.body;
  
  try {
    // Pre-processing hook
    if (preProcess && typeof preProcess === 'function') {
      await preProcess(req, res, Model);
    }

    // Custom validation hook
    if (customValidation && typeof customValidation === 'function') {
      const validationResult = await customValidation(req, res, Model);
      if (validationResult && !validationResult.valid) {
        return sendResponse(res, {
          statusCode: responseCodes.badRequest,
          message: validationResult.message || messages.validationFailed,
          errors: validationResult.errors,
          responseCodes,
          messages,
          includeTimestamp,
          includeRequestId,
          customFields: customResponseFields,
          version
        });
      }
    }

    // Check dependencies if provided
    for (const dependency of dependencies) {
      const DependencyModel = dependency.model(req.collegeDB);
      const dependentCount = await DependencyModel.countDocuments({ [dependency.field]: { $in: ids } });
      
      if (dependentCount > 0) {
        return sendResponse(res, {
          statusCode: responseCodes.conflict,
          message: `Cannot delete ${modelName.toLowerCase()}(s) with existing ${dependency.name.toLowerCase()}(s)`,
          errors: [{
            field: dependency.field,
            message: `Found ${dependentCount} dependent ${dependency.name.toLowerCase()}(s)`,
            code: 'DEPENDENCY_EXISTS'
          }],
          dependentCount,
          dependencyName: dependency.name,
          responseCodes,
          messages,
          includeTimestamp,
          includeRequestId,
          customFields: customResponseFields,
          version
        });
      }
    }

    // Perform deletion
    let result;
    if (softDelete) {
      result = await Model.updateMany(
        { _id: { $in: ids } },
        { $set: { deletedAt: new Date(), deleted: true } }
      );
    } else if (archiveMode) {
      result = await Model.updateMany(
        { _id: { $in: ids } },
        { $set: { archive: true, archivedAt: new Date() } }
      );
    } else {
      result = await handleCRUD(Model, 'delete', { _id: { $in: ids } });
    }

    if (result.deletedCount > 0 || result.modifiedCount > 0) {
      // Post-processing hook
      if (postProcess && typeof postProcess === 'function') {
        await postProcess(req, res, result);
      }

      // Audit logging
      if (enableAuditLog) {
        console.log(`AUDIT: ${auditAction} - ${req.path} - User: ${req.user?.id || 'anonymous'} - Time: ${Date.now() - startTime}ms`);
      }

      return sendResponse(res, {
        statusCode: responseCodes.success,
        message: successMessage,
        data: { deletedIds: ids, deleted: true },
        deleted: true,
        deletedIds: ids,
        deletedCount: result.deletedCount || result.modifiedCount,
        responseCodes,
        messages,
        includeTimestamp,
        includeRequestId,
        customFields: customResponseFields,
        version
      });
    } else {
      return sendResponse(res, {
        statusCode: responseCodes.notFound,
        message: messages.notFound,
        responseCodes,
        messages,
        includeTimestamp,
        includeRequestId,
        customFields: customResponseFields,
        version
      });
    }

  } catch (error) {
    let errorResponse = {
      statusCode: responseCodes.internalServerError,
      message: messages.serverError,
      responseCodes,
      messages,
      includeTimestamp,
      includeRequestId,
      customFields: customResponseFields,
      version
    };

    if (errorHandling === 'detailed') {
      errorResponse.errors = [{
        field: 'server',
        message: error.message,
        code: error.code || 'INTERNAL_ERROR'
      }];
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
      }
    } else if (errorHandling === 'minimal') {
      errorResponse.message = 'An error occurred';
    }

    return sendResponse(res, errorResponse);
  }
};

/**
 * Configuration helper for creating custom response codes and messages
 */
exports.createApiConfig = (customConfig = {}) => {
  return {
    responseCodes: { ...DEFAULT_RESPONSE_CODES, ...customConfig.responseCodes },
    messages: { ...DEFAULT_MESSAGES, ...customConfig.messages },
    includeTimestamp: customConfig.includeTimestamp !== undefined ? customConfig.includeTimestamp : true,
    includeRequestId: customConfig.includeRequestId !== undefined ? customConfig.includeRequestId : true,
    errorHandling: customConfig.errorHandling || 'standard',
    enableAuditLog: customConfig.enableAuditLog || false,
    enableCaching: customConfig.enableCaching || false,
    version: customConfig.version || '1.0'
  };
};

/**
 * Middleware for adding request ID to responses
 */
exports.requestIdMiddleware = (req, res, next) => {
  res.locals.requestId = req.headers['x-request-id'] || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
};

/**
 * Middleware for adding audit logging
 */
exports.auditLogMiddleware = (options = {}) => {
  return async (req, res, next) => {
    if (options.enabled) {
      req.auditLog = {
        action: req.method,
        resource: req.route?.path,
        userId: req.user?.id,
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };
    }
    next();
  };
};

/**
 * Rate limiting middleware
 */
exports.rateLimitMiddleware = (options = {}) => {
  const { windowMs = 15 * 60 * 1000, max = 100 } = options;
  
  return (req, res, next) => {
    const key = `rate_limit_${req.ip}_${req.path}`;
    const current = simpleCache.get(key) || { count: 0, resetTime: Date.now() + windowMs };
    
    if (Date.now() > current.resetTime) {
      current.count = 0;
      current.resetTime = Date.now() + windowMs;
    }
    
    if (current.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((current.resetTime - Date.now()) / 1000)
      });
    }
    
    current.count++;
    simpleCache.set(key, current);
    next();
  };
};

/**
 * Cache management utilities
 */
exports.cacheUtils = {
  clear: (pattern) => {
    if (pattern) {
      for (const key of simpleCache.keys()) {
        if (key.includes(pattern)) {
          simpleCache.delete(key);
        }
      }
    } else {
      simpleCache.clear();
    }
  },
  
  getStats: () => {
    return {
      size: simpleCache.size,
      keys: Array.from(simpleCache.keys())
    };
  },
  
  setTTL: (newTTL) => {
    CACHE_TTL = newTTL;
  }
};

/**
 * MIDDLEWARE UTILITIES
 * ===================
 */

/**
 * Request ID middleware with enhanced features
 */
exports.requestIdMiddleware = (options = {}) => {
  return (req, res, next) => {
    // Generate or use existing request ID
    const requestId = req.headers['x-request-id'] || 
      req.headers['x-correlation-id'] ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to request and response
    req.requestId = requestId;
    res.locals.requestId = requestId;
    
    // Add to response headers
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Correlation-ID', requestId);
    
    // Add to request context for logging
    req.context = {
      requestId,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      method: req.method,
      path: req.path,
      query: req.query
    };
    
    next();
  };
};

/**
 * Enhanced audit logging middleware
 */
exports.auditLogMiddleware = (options = {}) => {
  const config = { 
    enabled: process.env.NODE_ENV !== 'test',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    sensitiveFields: ['password', 'token', 'secret', 'key'],
    ...options 
  };
  
  return async (req, res, next) => {
    if (!config.enabled) {
      return next();
    }
    
    const startTime = Date.now();
    const originalSend = res.send;
    
    // Capture request data
    req.auditData = {
      requestId: req.requestId,
      action: req.method,
      resource: req.route?.path || req.path,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date(),
      ip: req.context?.ip,
      userAgent: req.context?.userAgent,
      requestBody: sanitizeRequestBody(req.body, config.sensitiveFields),
      query: req.query
    };
    
    // Override res.send to capture response data
    res.send = function(data) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Capture response data
      req.auditData.responseTime = responseTime;
      req.auditData.statusCode = res.statusCode;
      req.auditData.responseSize = data ? data.length : 0;
      
      // Log audit entry
      logAuditEntry(req.auditData, config);
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Rate limiting middleware
 */
exports.rateLimitMiddleware = (options = {}) => {
  const config = { 
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    ...options 
  };
  
  return (req, res, next) => {
    const key = `rate_limit_${req.context?.ip || req.ip}_${req.path}`;
    const now = Date.now();
    
    // Get or create rate limit data
    let rateLimitData = req.app.locals.rateLimits?.get(key);
    if (!rateLimitData) {
      rateLimitData = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false
      };
    }
    
    // Reset if window has passed
    if (now > rateLimitData.resetTime) {
      rateLimitData.count = 0;
      rateLimitData.resetTime = now + config.windowMs;
      rateLimitData.blocked = false;
    }
    
    // Check if rate limit exceeded
    if (rateLimitData.count >= config.max) {
      rateLimitData.blocked = true;
      
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000),
        limit: config.max,
        remaining: 0,
        resetTime: rateLimitData.resetTime
      });
    }
    
    // Increment counter
    rateLimitData.count++;
    
    // Store rate limit data
    if (!req.app.locals.rateLimits) {
      req.app.locals.rateLimits = new Map();
    }
    req.app.locals.rateLimits.set(key, rateLimitData);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', config.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - rateLimitData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitData.resetTime / 1000));
    
    next();
  };
};

/**
 * Performance monitoring middleware
 */
exports.performanceMonitoringMiddleware = (options = {}) => {
  const config = { 
    enabled: true,
    slowQueryThreshold: 1000, // ms
    logSlowQueries: true,
    ...options 
  };
  
  return (req, res, next) => {
    if (!config.enabled) return next();
    
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    // Override res.send to capture performance metrics
    const originalSend = res.send;
    res.send = function(data) {
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      const responseTime = endTime - startTime;
      
      // Log slow queries
      if (config.logSlowQueries && responseTime > config.slowQueryThreshold) {
        console.warn(`SLOW QUERY: ${responseTime}ms - ${req.method} ${req.path}`, {
          requestId: req.requestId,
          responseTime,
          memoryDelta: endMemory.heapUsed - startMemory.heapUsed
        });
      }
      
      // Add performance headers
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Memory-Usage', `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`);
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Security headers middleware
 */
exports.securityHeadersMiddleware = (options = {}) => {
  return (req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    
    next();
  };
};

/**
 * Error handling middleware
 */
exports.errorHandlingMiddleware = (options = {}) => {
  return (err, req, res, next) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Default error response
    let errorResponse = {
      success: false,
      message: 'Internal server error',
      requestId: req.requestId
    };
    
    // Handle different error types
    if (err.name === 'ValidationError') {
      errorResponse.message = 'Validation failed';
      errorResponse.errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message,
        code: 'VALIDATION_ERROR'
      }));
      res.status(400);
    } else if (err.name === 'CastError') {
      errorResponse.message = 'Invalid ID format';
      errorResponse.errors = [{
        field: err.path,
        message: 'Invalid ID format',
        code: 'CAST_ERROR'
      }];
      res.status(400);
    } else if (err.name === 'MongoError' && err.code === 11000) {
      errorResponse.message = 'Duplicate value';
      errorResponse.errors = [{
        field: Object.keys(err.keyPattern)[0],
        message: 'Value already exists',
        code: 'DUPLICATE_ERROR'
      }];
      res.status(409);
    } else {
      res.status(err.status || 500);
      if (isDevelopment) {
        errorResponse.stack = err.stack;
        errorResponse.details = err.message;
      }
    }
    
    // Log error
    console.error('ERROR:', {
      requestId: req.requestId,
      error: err.message,
      stack: isDevelopment ? err.stack : undefined,
      path: req.path,
      method: req.method
    });
    
    res.json(errorResponse);
  };
};

/**
 * Combine all middleware into a single function
 */
exports.createEnhancedMiddleware = (options = {}) => {
  return [
    exports.requestIdMiddleware(options.requestId),
    exports.auditLogMiddleware(options.audit),
    exports.rateLimitMiddleware(options.rateLimit),
    exports.performanceMonitoringMiddleware(options.performance),
    exports.securityHeadersMiddleware(options.security)
  ];
};

/**
 * Helper functions
 */
const sanitizeRequestBody = (body, sensitiveFields = []) => {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

const logAuditEntry = (auditData, config) => {
  const logEntry = {
    timestamp: auditData.timestamp.toISOString(),
    requestId: auditData.requestId,
    action: auditData.action,
    resource: auditData.resource,
    userId: auditData.userId,
    ip: auditData.ip,
    userAgent: auditData.userAgent,
    statusCode: auditData.statusCode,
    responseTime: auditData.responseTime,
    responseSize: auditData.responseSize
  };
  
  // Add request body for non-GET requests
  if (auditData.action !== 'GET' && auditData.requestBody) {
    logEntry.requestBody = auditData.requestBody;
  }
  
  // Log based on level
  if (config.logLevel === 'debug') {
    console.log('AUDIT:', JSON.stringify(logEntry, null, 2));
  } else {
    console.log('AUDIT:', JSON.stringify(logEntry));
  }
};

module.exports = {
  ...exports,
  DEFAULT_RESPONSE_CODES,
  DEFAULT_MESSAGES,
  sendResponse,
  sanitizeRequestBody,
  logAuditEntry
};
