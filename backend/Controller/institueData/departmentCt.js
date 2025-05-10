const createDepartmentModel = require('../../Model/instituteData/departmentMd');



// Function to add a new academic year
exports.insertAcademicYear = async (req, res) => {
    const AcademicYear = createAcademicYearModel(req.collegeDB);
    const { newYear } = req.body;
    try {
        const academicYearDoc = await AcademicYear.findById("academicYear");
        if (!academicYearDoc) {
            // newYear._id=0;
            const newDoc = new AcademicYear({
                _id: "academicYear",
                data: [newYear]
            });
            await newDoc.save();
            return res.status(201).json({ message: "Document created with new academic year", newDoc });
        }

        // Find the highest _id value and increment for the new entry
        // const maxId = Math.max(...academicYearDoc.academicYear.map(yr => yr._id), 0);
        // newYear._id = parseInt(maxId + 1);
        academicYearDoc.data.push(newYear);
        await academicYearDoc.save();
        res.status(200).json({ message: "Academic year added" });

    } catch (error) {
        console.error("Error in insertAcademicYear:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
