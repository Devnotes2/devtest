const createGeneralDataModel = require('../../Model/generalData/generalDataMd'); // Adjust the path as necessary

exports.getGeneraldata = async (req, res) => {
  const GeneralData = createGeneralDataModel(req.collegeDB);
  const { type } = req.params; // e.g., 'religion', 'state', etc.
  const { itemId } = req.params; // Optional query parameter for specific item ID
console.log(type);
  try {
      const generaldataDoc = await GeneralData.findById(type);
      if (!generaldataDoc) {
          return res.status(404).json({ message: 'Generaldata type not found' });
      }

      if (itemId) {
          const item = generaldataDoc.data.find(item => item._id === parseInt(itemId));
          if (!item) {
              return res.status(404).json({ message: 'Generaldata item not found' });
          }
          return res.json(item);
      } else {
        console.log(generaldataDoc)
        //   generaldataDoc.data.sort((a, b) => a._id - b._id);
          return res.json(generaldataDoc.data);
      }

  } catch (error) {
      console.error("Error in getGeneraldata:", error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.addGeneraldata = async (req, res) => {
  const GeneralData = createGeneralDataModel(req.collegeDB);
  const { type } = req.params; // e.g., 'religion', 'state', etc.
  const { value } = req.body; // The value to add
    
  try {
      let generaldataDoc = await GeneralData.findById(type);
      if (generaldataDoc) {
          // Get the current max _id
          const newItem = {value: value };
          generaldataDoc.data.push(newItem);
          await generaldataDoc.save();
          return res.status(200).json(newItem);
      } else {
          // If no existing data, start with _id = 0
          const newItem = {value: value };
          await GeneralData.create({ _id: type, data: [newItem] });
          return res.status(200).json(newItem);
      }

  } catch (error) {
      console.error("Error in addGeneraldata:", error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.updateGeneraldata = async (req, res) => {
  const GeneralData = createGeneralDataModel(req.collegeDB);
  const { type } = req.params; // e.g., 'religion', 'state', etc.
  const { itemId, updatedData } = req.body;

  try {
      const result = await GeneralData.findOneAndUpdate(
          { _id: type, 'data._id': itemId },
          { $set: { 'data.$.value': updatedData } },
          { new: true }
      );
      if (result) {
          return res.status(200).json({ message: 'Generaldata Updated successfully' });
      } else {
          return res.status(404).json({ message: 'Generaldata item not found' });
      }
  } catch (error) {
      console.error("Error in updateGeneraldata:", error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteGeneraldata = async (req, res) => {

    const GeneralData = createGeneralDataModel(req.collegeDB);

    // const GeneralData = createGeneralDataModel(req.collegeDB);

    const { type } = req.params; // e.g., 'religion', 'state', etc.
    const { ids } = req.body; // Expecting an array of IDs

    try {
        // Find the document corresponding to the specified type
        const generalDataDoc = await GeneralData.findById(type);

        if (!generalDataDoc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        console.log(generalDataDoc);
        // Filter out the items that match the given ids
        const updatedData = generalDataDoc.data.filter(item => !ids.includes(item._id));
        console.log(updatedData);
        
        // If no items were removed, return a 404 response
        if (updatedData.length === generalDataDoc.data.length) {
            return res.status(404).json({ message: 'No matching items found for deletion' });
        }

        // Update the data array and save the document
        generalDataDoc.data = updatedData;
        await generalDataDoc.save();

        // Respond with the updated document
        return res.status(200).json(generalDataDoc);

    } catch (error) {
        console.error("Error in deleteGeneraldata:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


