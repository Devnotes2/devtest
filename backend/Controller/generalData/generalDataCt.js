const createGeneralDataModel = require('../../Model/generalData/generalDataMd');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../Utilities/enhancedStandardizedApiUtils');
const { getApiConfig } = require('../../Utilities/apiConfig');
const { ObjectId } = require('mongoose').Types;

// GET General Data
exports.getGeneraldata = async (req, res) => {
  const apiConfig = getApiConfig('generalData');
  const { type } = req.params;
  const { itemId } = req.params;

  try {
    const GeneralData = createGeneralDataModel(req.collegeDB);
    
    // Find the general data document by type
    const generaldataDoc = await GeneralData.findOne({ _id: type });
    if (!generaldataDoc) {
      return res.status(404).json({ 
        success: false,
        message: 'General data type not found',
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      });
    }

    if (itemId) {
      // Return specific item
      const item = generaldataDoc.data.find(item => item._id === parseInt(itemId));
      if (!item) {
        return res.status(404).json({ 
          success: false,
          message: 'General data item not found',
          requestId: res.locals.requestId,
          timestamp: new Date().toISOString()
        });
      }
      return res.json({
        success: true,
        message: 'General data item retrieved successfully',
        data: item,
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString(),
        version: apiConfig.version
      });
    } else {
      // Return all items for the type
      return res.json({
        success: true,
        message: 'General data retrieved successfully',
        data: generaldataDoc.data,
        count: generaldataDoc.data.length,
        type: type,
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString(),
        version: apiConfig.version
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString()
    });
  }
};

// POST General Data
exports.addGeneraldata = async (req, res) => {
  const apiConfig = getApiConfig('generalData');
  const { type } = req.params;
  const { value } = req.body;

  try {
    const GeneralData = createGeneralDataModel(req.collegeDB);
    
    // Validate required fields
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Value is required',
        errors: [{
          field: 'value',
          message: 'Value is required',
          code: 'REQUIRED_FIELD'
        }],
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      });
    }

    let generaldataDoc = await GeneralData.findOne({ _id: type });
    const newItem = { value };

    if (generaldataDoc) {
      // Check for duplicate values
      const existingItem = generaldataDoc.data.find(item => item.value === value);
      if (existingItem) {
        return res.status(409).json({
          success: false,
          message: 'Value already exists',
          errors: [{
            field: 'value',
            message: 'Value already exists',
            code: 'DUPLICATE_VALUE'
          }],
          requestId: res.locals.requestId,
          timestamp: new Date().toISOString()
        });
      }
      
      generaldataDoc.data.push(newItem);
      await generaldataDoc.save();
    } else {
      await GeneralData.create({ _id: type, data: [newItem] });
    }

    return res.status(201).json({
      success: true,
      message: 'General data added successfully',
      data: newItem,
      created: true,
      type: type,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
      version: apiConfig.version
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString()
    });
  }
};

// PUT General Data
exports.updateGeneraldata = async (req, res) => {
  const apiConfig = getApiConfig('generalData');
  const { type } = req.params;
  const { itemId } = req.params;
  const { value } = req.body;

  try {
    const GeneralData = createGeneralDataModel(req.collegeDB);
    
    // Validate required fields
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Value is required',
        errors: [{
          field: 'value',
          message: 'Value is required',
          code: 'REQUIRED_FIELD'
        }],
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      });
    }

    const generaldataDoc = await GeneralData.findOne({ _id: type });
    if (!generaldataDoc) {
      return res.status(404).json({ 
        success: false,
        message: 'General data type not found',
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      });
    }

    const itemIndex = generaldataDoc.data.findIndex(item => item._id === parseInt(itemId));
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'General data item not found',
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      });
    }

    // Check for duplicate values (excluding current item)
    const existingItem = generaldataDoc.data.find(item => item.value === value && item._id !== parseInt(itemId));
    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'Value already exists',
        errors: [{
          field: 'value',
          message: 'Value already exists',
          code: 'DUPLICATE_VALUE'
        }],
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      });
    }

    generaldataDoc.data[itemIndex].value = value;
    await generaldataDoc.save();

    return res.json({
      success: true,
      message: 'General data updated successfully',
      data: { _id: parseInt(itemId), value },
      modified: true,
      type: type,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
      version: apiConfig.version
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString()
    });
  }
};

// DELETE General Data
exports.deleteGeneraldata = async (req, res) => {
  const apiConfig = getApiConfig('generalData');
  const { type } = req.params;
  const { itemId } = req.params;

  try {
    const GeneralData = createGeneralDataModel(req.collegeDB);
    
    const generaldataDoc = await GeneralData.findOne({ _id: type });
    if (!generaldataDoc) {
      return res.status(404).json({ 
        success: false,
        message: 'General data type not found',
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      });
    }

    const itemIndex = generaldataDoc.data.findIndex(item => item._id === parseInt(itemId));
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'General data item not found',
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      });
    }

    const deletedItem = generaldataDoc.data.splice(itemIndex, 1)[0];
    await generaldataDoc.save();

    return res.json({
      success: true,
      message: 'General data deleted successfully',
      data: { deletedItem },
      deleted: true,
      type: type,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
      version: apiConfig.version
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getGeneraldata: exports.getGeneraldata,
  addGeneraldata: exports.addGeneraldata,
  updateGeneraldata: exports.updateGeneraldata,
  deleteGeneraldata: exports.deleteGeneraldata
};