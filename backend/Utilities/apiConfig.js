/**
 * API Configuration Management
 * Centralized configuration for all standardized APIs
 */

const { createApiConfig } = require('./enhancedStandardizedApiUtils');

/**
 * Default API configuration
 */
const DEFAULT_CONFIG = {
  version: '1.0',
  includeTimestamp: true,
  includeRequestId: true,
  errorHandling: 'standard',
  enableAuditLog: false,
  enableCaching: false
};

/**
 * Environment-specific configurations
 */
const ENVIRONMENT_CONFIGS = {
  development: {
    version: '1.0-dev',
    errorHandling: 'detailed',
    enableAuditLog: true,
    enableCaching: false,
    includeTimestamp: true,
    includeRequestId: true
  },
  
  staging: {
    version: '1.0-staging',
    errorHandling: 'standard',
    enableAuditLog: true,
    enableCaching: true,
    includeTimestamp: true,
    includeRequestId: true
  },
  
  production: {
    version: '1.0',
    errorHandling: 'minimal',
    enableAuditLog: true,
    enableCaching: true,
    includeTimestamp: true,
    includeRequestId: true
  }
};

/**
 * API-specific configurations
 */
const API_CONFIGS = {
  // Institute Data APIs
  institutes: {
    enableCaching: true,
    cacheTTL: 300,
    customResponseFields: { apiType: 'institute-management' }
  },
  
  academicYear: {
    enableCaching: true,
    cacheTTL: 600,
    customResponseFields: { apiType: 'academic-management' }
  },
  
  // Aggregation APIs
  subjects: {
    enableCaching: true,
    cacheTTL: 300,
    customResponseFields: { apiType: 'subject-management' }
  },
  
  gradeSections: {
    enableCaching: true,
    cacheTTL: 300,
    customResponseFields: { apiType: 'grade-section-management' }
  },
  
  gradeBatches: {
    enableCaching: true,
    cacheTTL: 300,
    customResponseFields: { apiType: 'grade-batch-management' }
  },
  
  gradeSectionBatches: {
    enableCaching: true,
    cacheTTL: 300,
    customResponseFields: { apiType: 'grade-section-batch-management' }
  },
  
  locationTypes: {
    enableCaching: true,
    cacheTTL: 600,
    customResponseFields: { apiType: 'location-management' }
  },
  
  grades: {
    enableCaching: true,
    cacheTTL: 300,
    customResponseFields: { apiType: 'grade-management' }
  },
  
  // Members Data APIs
  members: {
    enableCaching: true,
    cacheTTL: 180,
    enableAuditLog: true,
    customResponseFields: { apiType: 'member-management' }
  }
};

/**
 * Custom response codes for specific scenarios
 */
const CUSTOM_RESPONSE_CODES = {
  memberSuspended: 423,
  instituteInactive: 424,
  academicYearClosed: 425,
  quotaExceeded: 429,
  hasActiveStudents: 409,
  hasActiveTeachers: 409,
  hasActiveBatches: 409
};

/**
 * Custom messages for specific scenarios
 */
const CUSTOM_MESSAGES = {
  memberSuspended: 'Member account is suspended',
  instituteInactive: 'Institute is currently inactive',
  academicYearClosed: 'Academic year is closed for modifications',
  quotaExceeded: 'Quota limit exceeded',
  hasActiveStudents: 'Cannot delete - has active students',
  hasActiveTeachers: 'Cannot delete - has active teachers',
  hasActiveBatches: 'Cannot delete - has active batches'
};

/**
 * Get configuration for specific API
 */
const getApiConfig = (apiName, environment = process.env.NODE_ENV || 'development') => {
  const baseConfig = ENVIRONMENT_CONFIGS[environment] || DEFAULT_CONFIG;
  const apiConfig = API_CONFIGS[apiName] || {};
  
  return {
    ...baseConfig,
    ...apiConfig,
    responseCodes: {
      ...CUSTOM_RESPONSE_CODES
    },
    messages: {
      ...CUSTOM_MESSAGES
    }
  };
};

module.exports = {
  DEFAULT_CONFIG,
  ENVIRONMENT_CONFIGS,
  API_CONFIGS,
  CUSTOM_RESPONSE_CODES,
  CUSTOM_MESSAGES,
  getApiConfig
};
