const createInstitutesModel = require('../../Model/instituteData/institutesMd'); // Adjust the path as necessary

// Get Institutes or a specific Institute
exports.getInstitutes = async (req, res) => {
    const Institute = createInstitutesModel(req.collegeDB);
    const { instituteID } = req.params; // Optional institute ID

    try {
        const instituteDoc = await Institute.findById("institutes");

        if (!instituteDoc) {
            return res.status(404).json({ message: 'Institutes data not found' });
        }

        if (instituteID) {
            const institute = instituteDoc.data.find(inst => inst._id.toString() === instituteID);
            if (!institute) {
                return res.status(404).json({ message: 'Institute not found' });
            }
            return res.status(200).json(institute);
        } else {
            instituteDoc.data.sort((a, b) => a._id.toString().localeCompare(b._id.toString()));
            return res.status(200).json(instituteDoc.data);
        }

    } catch (error) {
        console.error("Error in getInstitutes:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add a New Institute
exports.insertInstitute = async (req, res) => {
    const Institute = createInstitutesModel(req.collegeDB);
    const { newInst } = req.body;

    if (!newInst || typeof newInst !== 'object') {
        return res.status(400).json({ message: 'Invalid institute data' });
    }

    try {
        const instituteDoc = await Institute.findById("institutes");

        if (!instituteDoc) {
            const newDoc = new Institute({
                _id: "institutes",
                data: [newInst]
            });
            await newDoc.save();
            return res.status(200).json({ message: "Document created with new institute", newDoc });
        }

        instituteDoc.data.push(newInst);
        await instituteDoc.save();
        res.status(200).json({ message: "Institute added", instituteDoc });

    } catch (error) {
        console.error("Error in insertInstitute:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update an Institute
exports.updateInstitute = async (req, res) => {
    const Institute = createInstitutesModel(req.collegeDB);
    const { instituteID, updatedData } = req.body;

    if (!instituteID || !updatedData || typeof updatedData !== 'object') {
        return res.status(400).json({ message: 'Invalid institute ID or update data' });
    }

    try {
        const instituteDoc = await Institute.findById("institutes");

        if (!instituteDoc) {
            return res.status(404).json({ message: "Document not found" });
        }

        const instituteIndex = instituteDoc.data.findIndex(inst => inst._id.toString() === instituteID);
        if (instituteIndex === -1) {
            return res.status(404).json({ message: "Institute not found" });
        }

        instituteDoc.data[instituteIndex] = {
            ...instituteDoc.data[instituteIndex].toObject(),
            ...updatedData
        };

        await instituteDoc.save();
        res.status(200).json({ message: "Institute updated", updatedInstitute: instituteDoc.data[instituteIndex] });

    } catch (error) {
        console.error("Error in updateInstitute:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete Institute(s)
exports.deleteInstitutes = async (req, res) => {
    const Institute = createInstitutesModel(req.collegeDB);
    const { ids } = req.body;

    if (!ids) {
        return res.status(400).json({ message: "Institute ID(s) required" });
    }

    try {
        const instituteDoc = await Institute.findById("institutes");

        if (!instituteDoc) {
            return res.status(404).json({ message: "Document not found" });
        }

        const instituteIds = Array.isArray(ids) ? ids : [ids];
        const updatedInstitutes = instituteDoc.data.filter(inst => !instituteIds.includes(inst._id.toString()));

        if (updatedInstitutes.length === instituteDoc.data.length) {
            return res.status(404).json({ message: "No matching institutes found for deletion" });
        }

        instituteDoc.data = updatedInstitutes;
        await instituteDoc.save();
        res.status(200).json({ message: "Institute(s) deleted successfully" });

    } catch (error) {
        console.error("Error in deleteInstitutes:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
