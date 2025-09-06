#!/usr/bin/env node

/**
 * Generate timestamped report names for cross-platform compatibility
 */

function generateReportName(module, environment) {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '-');
  
  return `${module}-${environment}-report-${timestamp}.html`;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateReportName };
}

// Command line usage
if (require.main === module) {
  const module = process.argv[2] || 'health-check';
  const environment = process.argv[3] || 'dev';
  console.log(generateReportName(module, environment));
}
