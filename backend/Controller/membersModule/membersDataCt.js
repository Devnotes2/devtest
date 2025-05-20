// membersDataCt.js (Controller for handling member data)
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createMembersDataModel = require('../../Model/membersModule/membersDataMd');

exports.createMembersData = async (req, res) => {
    try {
        const MemberData = createMembersDataModel(req.collegeDB);  // Get the member data model for the current college

        const {
            memberType,
            firstName,
            middleName,
            lastName,
            gender,
            DOB,
            bloodGroup,
            instituteId,
            department,
            gradeId,
            createdDate,
            expiryDate,
            password,
            image,
            mobileNo1,
            mobileNo2,
            email,
            fatherName,
            motherName,
            guardian,
            parentGuardianNo,
            parentGuardianEmail,
            parentGuardianOccupation,
            tempAddress,
            permAddress,
            memberId  // Ensure memberId is provided in the request body
        } = req.body;

        // Get the image path from the uploaded file
        // const subdomain = req.get('host').split('.')[0];  // Extract subdomain (e.g., college name)
        // const imagePath = req.file ? `/uploads/${subdomain}/${req.file.filename}` : null;  // Save the image path

        // Create a new member document
        const newMember = new MemberData({
            memberType,
            firstName,
            middleName,
            lastName,
            gender,
            DOB,
            bloodGroup,
            instituteId,
            department,
            gradeId,
            createdDate,
            expiryDate,
            password,
            image,  // Store the image path for the single image
            mobileNo1,
            mobileNo2,
            email,
            fatherName,
            motherName,
            guardian,
            parentGuardianNo,
            parentGuardianEmail,
            parentGuardianOccupation,
            tempAddress,
            permAddress,
            memberId
        });

        // Save the new member to the database
        await newMember.save();

        // Send a success response
        res.status(200).json({
            message: 'Member added successfully!',
            data: newMember,  // Send back the created member data
        });
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ error: 'Failed to add member', details: error.message });
    }
};
