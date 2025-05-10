const createGeneralDataModel = require('../../Model/generalData/generalDataMd');
const { handleCRUD } = require('../../Utilities/crudUtils');

exports.getGeneraldata = async (req, res) => {
  const GeneralData = createGeneralDataModel(req.collegeDB);
  const { type } = req.params;
  const { itemId } = req.params;

  try {
    const generaldataDoc = await handleCRUD(GeneralData, 'findOne', { _id: type });
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
      return res.json(generaldataDoc.data);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addGeneraldata = async (req, res) => {
  const GeneralData = createGeneralDataModel(req.collegeDB);
  const { type } = req.params;
  const { value } = req.body;

  try {
    let generaldataDoc = await handleCRUD(GeneralData, 'findOne', { _id: type });
    const newItem = { value };

    if (generaldataDoc) {
      generaldataDoc.data.push(newItem);
      await generaldataDoc.save();
    } else {
      await handleCRUD(GeneralData, 'create', {}, { _id: type, data: [newItem] });
    }

    return res.status(200).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateGeneraldata = async (req, res) => {
  const GeneralData = createGeneralDataModel(req.collegeDB);
  const { type } = req.params;
  const { itemId, updatedData } = req.body;

  try {
    const result = await handleCRUD(
      GeneralData,
      'update',
      { _id: type, 'data._id': itemId },
      { $set: { 'data.$.value': updatedData } }
    );

    if (result) {
      return res.status(200).json({ message: 'Generaldata Updated successfully' });
    } else {
      return res.status(404).json({ message: 'Generaldata item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteGeneraldata = async (req, res) => {
  const GeneralData = createGeneralDataModel(req.collegeDB);
  const { type } = req.params;
  const { ids } = req.body;

  try {
    const generalDataDoc = await handleCRUD(GeneralData, 'findOne', { _id: type });

    if (!generalDataDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const updatedData = generalDataDoc.data.filter(item => !ids.includes(item._id));

    if (updatedData.length === generalDataDoc.data.length) {
      return res.status(404).json({ message: 'No matching items found for deletion' });
    }

    generalDataDoc.data = updatedData;
    await generalDataDoc.save();

    return res.status(200).json(generalDataDoc);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


