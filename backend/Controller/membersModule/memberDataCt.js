const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const {createMembersDataModel} = require('../../Model/membersModule/memberDataMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const buildGenericAggregation = require('../../Utilities/genericAggregatorUtils');
const addPaginationAndSort = require('../../Utilities/paginationControllsUtils');
const { generalDataLookup } = require('../../Utilities/aggregations/generalDataLookups');
const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');
const { gradesLookup } = require('../../Utilities/aggregations/gradesLookups');
const { departmentLookup } = require('../../Utilities/aggregations/departmentLookups');
const { gradeBatchesLookup } = require('../../Utilities/aggregations/gradesBatchesLookups');
const { gradeSectionLookup } = require('../../Utilities/aggregations/gradesSectionLookups');
const { gradeSectionBatchesLookup } = require('../../Utilities/aggregations/gradesSectionBatchesLookups');
const { buildMatchConditions, buildSortObject, validateUniqueField, buildValueBasedMatchStage } = require('../../Utilities/filterSortUtils');
const { getPublicS3Url } = require('../../Utilities/s3Utils');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../Utilities/enhancedStandardizedApiUtils');
const { membersDataInInstituteLookup } = require('../../Utilities/aggregations/membersDataLookups');

const getMembersData = async (req, res) => {
  // Custom transform function for S3 URL transformation
  const transformData = (data) => {
    if (Array.isArray(data)) {
      return data.map(member => ({
        ...member,
        image: member.image ? getPublicS3Url(process.env.AWS_S3_BUCKET, member.image, process.env.AWS_REGION) : member.image,
      }));
    }
    return {
      ...data,
      image: data.image ? getPublicS3Url(process.env.AWS_S3_BUCKET, data.image, process.env.AWS_REGION) : data.image,
    };
  };

  const options = {
    lookups: [
      ...instituteLookup(),
      ...generalDataLookup('bloodGroup', 'bloodGroup', 'bloodGroupDetails', 'bloodGroupValue'),
      ...generalDataLookup('gender', 'gender', 'genderDetails', 'genderValue'),
      ...generalDataLookup('memberType', 'memberType', 'memberTypeDetails', 'memberTypeValue'),
      ...departmentLookup(),
      ...gradesLookup(),
      ...gradeBatchesLookup(),
      ...gradeSectionLookup(),
      ...gradeSectionBatchesLookup(),
    ],
    joinedFieldMap: {
      gender: 'genderDetails.genderValue',
      bloodGroup: 'bloodGroupDetails.bloodGroupValue',
      memberType: 'memberTypeDetails.memberTypeValue',
      department: 'departmentDetails.departmentName',
      institute: 'instituteDetails.instituteName',
      grade: 'gradeDetails.gradeCode',
      batch: 'gradeBatchDetails.batchName',
      section: 'gradeSectionDetails.sectionName',
      gradeSectionBatch: 'gradeSectionBatchDetails.sectionBatchName'
    },
    dropdownFields: ['_id', 'fullName'],
    validationField: 'memberId',
    defaultSort: { fullName: 1 },
    projectFields: {
      firstName: 1,
      middleName: 1,
      lastName: 1,
      fullName: 1,
      memberId: 1,
      memberType: '$memberTypeDetails.memberTypeValue',
      instituteName: '$instituteDetails.instituteName',
      grade: '$gradeDetails.gradeCode',
      batch: '$gradeBatchDetails.batchName',
      section: '$gradeSectionDetails.sectionName',
      gradeSectionBatch: '$gradeSectionBatchDetails.sectionBatchName',
      department: '$departmentDetails.departmentName',
      gender: '$genderDetails.genderValue',
      bloodGroup: '$bloodGroupDetails.bloodGroupValue',
      dob: 1,
      createdDate: 1,
      expiryDate: 1,
      email: 1,
      contactNo1: 1,
      contactNo2: 1,
      image: 1,
      fatherName: 1,
      motherName: 1,
      guardian: 1,
      parentOrGuardianNo: 1,
      parentOrGuardianEmail: 1,
      parentOrGuardianOccupation: 1,
      parentOrGuardianPassword: 1,
      tempAddress: 1,
      permAddress: 1,
      createdAt: 1,
      updatedAt: 1
    },
    transformData
  };

  await enhancedStandardizedGet(req, res, createMembersDataModel, options);
};

const createMember = async (req, res) => {
  // Custom transform function for fullName generation and file handling
  const transformData = (data) => {
    const { firstName, middleName, lastName, ...restData } = data;
    let fullName = firstName;
    if (middleName && middleName.trim()) {
      fullName += ' ' + middleName.trim();
    }
    if (lastName && lastName.trim()) {
      fullName += ' ' + lastName.trim();
    }

    return {
      ...restData,
      firstName,
      middleName,
      lastName,
      fullName,
      // Handle file upload if present
      image: req.file ? req.file.key : data.image
    };
  };

  const options = {
    successMessage: 'Member created successfully',
    requiredFields: ['firstName', 'lastName', 'email', 'instituteId'],
    uniqueFields: [
      {
        fields: ['email'],
        message: 'Email already exists'
      },
      {
        fields: ['memberId'],
        message: 'Member ID already exists'
      }
    ],
    transformData
  };

  await enhancedStandardizedPost(req, res, createMembersDataModel, options);
};

const updateMember = async (req, res) => {
  // Custom transform function for fullName regeneration and file handling
  const transformData = (data) => {
    const { firstName, middleName, lastName, ...restData } = data;
    
    // Only regenerate fullName if name fields are being updated
    if (firstName || middleName || lastName) {
      let fullName = firstName || '';
      if (middleName && middleName.trim()) {
        fullName += ' ' + middleName.trim();
      }
      if (lastName && lastName.trim()) {
        fullName += ' ' + lastName.trim();
      }
      
      return {
        ...restData,
        firstName,
        middleName,
        lastName,
        fullName: fullName.trim()
      };
    }

    return {
      ...restData,
      // Handle file upload if present
      image: req.file ? req.file.key : data.image
    };
  };

  const options = {
    successMessage: 'Member updated successfully',
    uniqueFields: [
      {
        fields: ['email'],
        message: 'Email already exists'
      },
      {
        fields: ['memberId'],
        message: 'Member ID already exists'
      }
    ],
    transformData
  };

  await enhancedStandardizedPut(req, res, createMembersDataModel, options);
};

const deleteMembers = async (req, res) => {
  const options = {
    successMessage: 'Member deleted successfully',
    dependencies: [], // Members typically don't have dependencies that need cascade handling
    modelName: 'Members'
  };

  await enhancedStandardizedDelete(req, res, createMembersDataModel, options);
};



module.exports = {
    getMembersData,
    createMember,
    updateMember,
    deleteMembers
}