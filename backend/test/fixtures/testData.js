/**
 * Test data fixtures for consistent testing
 */
const testData = {
  // User test data
  users: {
    validUser: {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      role: 'user'
    },
    adminUser: {
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567891',
      role: 'admin'
    },
    invalidUser: {
      email: 'invalid-email',
      password: '123',
      firstName: '',
      lastName: '',
      phone: 'invalid-phone'
    }
  },

  // Institute test data
  institutes: {
    validInstitute: {
      name: 'Test Institute',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      pincode: '12345',
      contactEmail: 'contact@testinstitute.com',
      contactPhone: '+1234567890'
    },
    invalidInstitute: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: ''
    }
  },

  // Department test data
  departments: {
    validDepartment: {
      name: 'Computer Science',
      description: 'Computer Science Department',
      headOfDepartment: 'Dr. John Doe',
      contactEmail: 'cs@testinstitute.com'
    },
    invalidDepartment: {
      name: '',
      description: '',
      headOfDepartment: '',
      contactEmail: 'invalid-email'
    }
  },

  // Grade test data
  grades: {
    validGrade: {
      name: 'Grade 10',
      description: 'Tenth Grade',
      level: 10,
      ageGroup: '15-16'
    },
    invalidGrade: {
      name: '',
      description: '',
      level: 'invalid',
      ageGroup: ''
    }
  },

  // Subject test data
  subjects: {
    validSubject: {
      name: 'Mathematics',
      code: 'MATH101',
      description: 'Basic Mathematics',
      credits: 4,
      type: 'core'
    },
    invalidSubject: {
      name: '',
      code: '',
      description: '',
      credits: 'invalid',
      type: ''
    }
  },

  // Enrollment test data
  enrollments: {
    validEnrollment: {
      studentId: 'STU001',
      academicYear: new Date().getFullYear(),
      grade: 'Grade 10',
      section: 'A',
      rollNumber: '001',
      admissionDate: new Date(),
      status: 'active'
    },
    invalidEnrollment: {
      studentId: '',
      academicYear: 'invalid',
      grade: '',
      section: '',
      rollNumber: '',
      admissionDate: 'invalid-date',
      status: 'invalid-status'
    }
  },

  // Academic Year test data
  academicYears: {
    validAcademicYear: {
      year: new Date().getFullYear(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isCurrent: true,
      description: 'Current Academic Year'
    },
    invalidAcademicYear: {
      year: 'invalid',
      startDate: 'invalid-date',
      endDate: 'invalid-date',
      isCurrent: 'invalid',
      description: ''
    }
  },

  // Grade Section test data
  gradeSections: {
    validGradeSection: {
      name: 'Section A',
      grade: 'Grade 10',
      capacity: 30,
      classTeacher: 'Mrs. Jane Smith',
      roomNumber: 'A101'
    },
    invalidGradeSection: {
      name: '',
      grade: '',
      capacity: 'invalid',
      classTeacher: '',
      roomNumber: ''
    }
  },

  // Grade Batch test data
  gradeBatches: {
    validGradeBatch: {
      name: 'Batch 2024',
      grade: 'Grade 10',
      section: 'Section A',
      academicYear: new Date().getFullYear(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    invalidGradeBatch: {
      name: '',
      grade: '',
      section: '',
      academicYear: 'invalid',
      startDate: 'invalid-date',
      endDate: 'invalid-date'
    }
  },

  // Grade Section Batch test data
  gradeSectionBatches: {
    validGradeSectionBatch: {
      gradeSectionId: '507f1f77bcf86cd799439014',
      batchId: '507f1f77bcf86cd799439015',
      academicYear: new Date().getFullYear(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    invalidGradeSectionBatch: {
      gradeSectionId: '',
      batchId: '',
      academicYear: 'invalid',
      startDate: 'invalid-date',
      endDate: 'invalid-date'
    }
  },

  // Location Types test data
  locationTypes: {
    validLocationType: {
      name: 'Classroom',
      description: 'Regular classroom for teaching',
      capacity: 30,
      type: 'academic'
    },
    invalidLocationType: {
      name: '',
      description: '',
      capacity: 'invalid',
      type: ''
    }
  },

  // General Data test data
  generalData: {
    validGeneralData: {
      key: 'school_motto',
      value: 'Excellence in Education',
      category: 'school_info',
      description: 'School motto'
    },
    invalidGeneralData: {
      key: '',
      value: '',
      category: '',
      description: ''
    }
  },

  // Aside Data test data
  asideData: {
    validAsideData: {
      title: 'Quick Links',
      content: 'Links to important pages',
      type: 'navigation',
      order: 1,
      isActive: true
    },
    invalidAsideData: {
      title: '',
      content: '',
      type: '',
      order: 'invalid',
      isActive: 'invalid'
    }
  },

  // Member Data test data
  memberData: {
    validMember: {
      email: 'member@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'teacher',
      department: 'Computer Science',
      employeeId: 'EMP001'
    },
    invalidMember: {
      email: 'invalid-email',
      firstName: '',
      lastName: '',
      phone: 'invalid-phone',
      role: '',
      department: '',
      employeeId: ''
    }
  },

  // Authentication test data
  auth: {
    validLogin: {
      email: 'test@example.com',
      password: 'TestPassword123!'
    },
    invalidLogin: {
      email: 'invalid-email',
      password: 'wrong-password'
    },
    validRegister: {
      email: 'newuser@example.com',
      password: 'NewPassword123!',
      firstName: 'New',
      lastName: 'User',
      phone: '+1234567892'
    },
    invalidRegister: {
      email: 'invalid-email',
      password: '123',
      firstName: '',
      lastName: '',
      phone: 'invalid-phone'
    }
  },

  // S3 test data
  s3: {
    validFileUpload: {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test file content')
    },
    invalidFileUpload: {
      fieldname: 'file',
      originalname: 'test.exe',
      encoding: '7bit',
      mimetype: 'application/x-executable',
      size: 1024,
      buffer: Buffer.from('test file content')
    }
  },

  // Pagination test data
  pagination: {
    validPagination: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    },
    invalidPagination: {
      page: 'invalid',
      limit: 'invalid',
      sortBy: '',
      sortOrder: 'invalid'
    }
  },

  // Filter test data
  filters: {
    validFilters: {
      search: 'test',
      status: 'active',
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31'
    },
    invalidFilters: {
      search: '',
      status: 'invalid',
      dateFrom: 'invalid-date',
      dateTo: 'invalid-date'
    }
  }
};

module.exports = testData;
