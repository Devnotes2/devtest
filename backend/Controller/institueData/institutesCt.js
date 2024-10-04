const createInstitutesModel = require('../../Model/instituteData/institutesMd'); // Assuming your model is in models/Asinstitute_IdeData.js

exports.getInstitutes = async (req, res) => {
    const Institute = createInstitutesModel(req.collegeDB);
    const { instituteID } = req.params; // Optional institute ID from URL

    try {
        const instituteDoc = await Institute.findById("institutes");

        if (!instituteDoc) {
            return res.status(404).json({ message: 'Institutes data not found' });
        }

        if (instituteID) {
            // Find the specific institute by its ID
            const institute = instituteDoc.institutes.find(inst => inst._id.toString() === instituteID);
            if (!institute) {
                return res.status(404).json({ message: 'Institute not found' });
            }
            return res.status(200).json(institute);
        } else {
            // Sort institutes by ID before returning the list
            instituteDoc.institutes.sort((a, b) => a._id.toString().localeCompare(b._id.toString()));
            return res.status(200).json(instituteDoc.institutes);
        }

    } catch (error) {
        console.error("Error in getInstitutes:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.insertInstitute = async (req, res) => {
    const Institute = createInstitutesModel(req.collegeDB);
    const { newInst } = req.body; // Expecting an object for newInst

    // Ensure the request contains a valid newInst object
    if (!newInst || typeof newInst !== 'object') {
        return res.status(400).json({ message: 'Invalid institute data' });
    }

    try {
        const instituteDoc = await Institute.findById("institutes");

        if (!instituteDoc) {
            // Create a new document if none exists
            const newDoc = new Institute({
                _id: "institutes",
                institutes: [newInst] // Add the new institute object
            });
            await newDoc.save();
            return res.status(200).json({ message: "Document created with new institute", newDoc });
        }

        // Add newInst object to the institutes array
        instituteDoc.institutes.push(newInst); // Directly push the newInst object into the array

        await instituteDoc.save();
        res.status(200).json({ message: "Institute added", instituteDoc });

    } catch (error) {
        console.error("Error in insertInstitute:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



exports.updateInstitute = async (req, res) => {
    const Institute = createInstitutesModel(req.collegeDB);
    const { instituteID, updatedData } = req.body;

    // Ensure the request body contains the necessary data
    if (!instituteID || !updatedData || typeof updatedData !== 'object') {
        return res.status(400).json({ message: 'Invalid institute ID or update data' });
    }

    try {
        const instituteDoc = await Institute.findById("institutes");

        if (!instituteDoc) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Find the institute by its ID
        const instituteIndex = instituteDoc.institutes.findIndex(inst => inst._id.toString() === instituteID);
        if (instituteIndex === -1) {
            return res.status(404).json({ message: "Institute not found" });
        }

        // Update the institute data while preserving the original ID and other fields
        instituteDoc.institutes[instituteIndex] = {
            ...instituteDoc.institutes[instituteIndex].toObject(), // Preserve existing fields
            ...updatedData // Apply updated fields
        };

        await instituteDoc.save();
        res.status(200).json({ message: "Institute updated", updatedInstitute: instituteDoc.institutes[instituteIndex] });

    } catch (error) {
        console.error("Error in updateInstitute:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



exports.deleteInstitutes = async (req, res) => {
    const Institute = createInstitutesModel(req.collegeDB);
    const { ids } = req.body; // Expecting a single ID for deletion or an array of IDs

    if (!ids) {
        return res.status(400).json({ message: "Institute ID is required" });
    }

    try {
        const instituteDoc = await Institute.findById("institutes");

        if (!instituteDoc) {
            return res.status(404).json({ message: "Document not found" });
        }

        // If instituteID is an array, delete multiple institutes, otherwise delete one
        const instituteIds = Array.isArray(ids) ? ids : [ids];

        // Filter out the institutes that match the given ID(s)
        const updatedInstitutes = instituteDoc.institutes.filter(inst => !instituteIds.includes(inst._id.toString()));

        if (updatedInstitutes.length === instituteDoc.institutes.length) {
            return res.status(404).json({ message: "No matching institutes found for deletion" });
        }

        instituteDoc.institutes = updatedInstitutes;
        await instituteDoc.save();
        res.status(200).json({ message: "Institute(s) deleted successfully" });

    } catch (error) {
        console.error("Error in deleteInstitute:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
