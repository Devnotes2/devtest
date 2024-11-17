const createAcademicYearModel = require('../../Model/instituteData/academicYearMd');

// Function to get all academic years or a specific academic year by ID
exports.getAcademicYears = async (req, res) => {
    const AcademicYear = createAcademicYearModel(req.collegeDB);
    const { id } = req.params;
    try {
        const academicYearDoc = await AcademicYear.findById('academicYear');

        if (!academicYearDoc) {
            return res.status(404).json({ message: 'Academic year data not found' });
        }

        if (id) {
            // Convert id to an integer for comparison
            const year = academicYearDoc.academicYear.find(yr => yr._id.toString() === id.toString());
            console.log(year);
            if (!year) {
                return res.status(404).json({ message: 'Academic year not found' });
            }
            return res.json(year);
        } else {
            // Sort by startDate, which are strings in the format 'YYYYMMDD'
            academicYearDoc.academicYear.sort((a, b) => a.startDate-b.startDate);
            return res.json(academicYearDoc.academicYear);
        }

    } catch (error) {
        console.error("Error in getAcademicYears:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

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
        res.status(201).json({ message: "Academic year added" });

    } catch (error) {
        console.error("Error in insertAcademicYear:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Function to update an academic year
exports.updateAcademicYear = async (req, res) => {
    const AcademicYear = createAcademicYearModel(req.collegeDB);
    const { id, updatedData } = req.body;
    try {
        const academicYearDoc = await AcademicYear.findById("academicYear");

        if (!academicYearDoc) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Find the academic year by its integer _id
        const yearIndex = academicYearDoc.academicYear.findIndex(yr => yr._id.toString() === id);
        console.log(yearIndex);
        if (yearIndex !== -1) {
            // Preserve the _id and update only the fields in updatedData
            const existingYear = academicYearDoc.academicYear[yearIndex];
            academicYearDoc.academicYear[yearIndex] = {
                _id: existingYear._id, // Preserve _id
                ...existingYear, // Existing fields
                ...updatedData // Fields to update
            };
            await academicYearDoc.save();
            res.json({ message: "Academic year updated" });
        } else {
            return res.status(404).json({ message: "Academic year not found" });
        }

    } catch (error) {
        console.error("Error in updateAcademicYear:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAcademicYear = async (req, res) => {
    const AcademicYear = createAcademicYearModel(req.collegeDB);
    const { ids } = req.body; // Expecting an array of ObjectId strings

    try {
        const academicYearDoc = await AcademicYear.findById("academicYear");

        if (!academicYearDoc) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Filter out the academic years whose _id matches the provided ids
        const updatedAcademicYears = academicYearDoc.academicYear.filter(
            (yr) => !ids.includes(yr._id.toString())
        );

        if (updatedAcademicYears.length === academicYearDoc.academicYear.length) {
            return res.status(404).json({ message: "No matching academic years found for deletion" });
        }

        academicYearDoc.academicYear = updatedAcademicYears;
        await academicYearDoc.save();

        res.json({ message: "Academic year(s) deleted successfully", deletedCount: ids.length });

    } catch (error) {
        console.error("Error in deleteAcademicYear:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

