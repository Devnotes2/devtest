const Tenant = require('../../Model/authentication/tenantMd');

// GET all tenant mappings
exports.getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({}).sort({ instituteCode: 1 });
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tenants', error: error.message });
  }
};

// POST a new tenant mapping
exports.createTenant = async (req, res) => {
  const { instituteCode, dbName, clusterURI, description } = req.body;
  if (!instituteCode || !dbName || !clusterURI) {
    return res.status(400).json({ message: 'instituteCode, dbName, and clusterURI are required.' });
  }

  try {
    const newTenant = new Tenant({ instituteCode, dbName, clusterURI, description });
    await newTenant.save();
    res.status(201).json({ message: 'Tenant created successfully.', data: newTenant });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `A tenant with ${field} '${error.keyValue[field]}' already exists.` });
    }
    res.status(500).json({ message: 'Failed to create tenant', error: error.message });
  }
};

// PUT (update) a tenant mapping
exports.updateTenant = async (req, res) => {
  const { instituteCode } = req.params;
  const { clusterURI, description } = req.body;

  // Build the update object with only allowed fields to prevent unwanted updates.
  // instituteCode and dbName are treated as immutable here.
  const updatePayload = {};
  if (clusterURI) {
    updatePayload.clusterURI = clusterURI;
  }
  if (description !== undefined) {
    updatePayload.description = description;
  }

  if (Object.keys(updatePayload).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update.' });
  }

  try {
    const updatedTenant = await Tenant.findOneAndUpdate(
      { instituteCode: instituteCode.toUpperCase() },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedTenant) {
      return res.status(404).json({ message: `Tenant with institute code '${instituteCode}' not found.` });
    }

    res.status(200).json({ message: 'Tenant updated successfully.', data: updatedTenant });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update tenant', error: error.message });
  }
};

// DELETE a tenant mapping
exports.deleteTenant = async (req, res) => {
  const { instituteCode } = req.params;

  try {
    const deletedTenant = await Tenant.findOneAndDelete({ instituteCode: instituteCode.toUpperCase() });

    if (!deletedTenant) {
      return res.status(404).json({ message: `Tenant with institute code '${instituteCode}' not found.` });
    }

    res.status(200).json({ message: 'Tenant deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete tenant', error: error.message });
  }
};