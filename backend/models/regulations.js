import mongoose from 'mongoose';

const regulationSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
      unique: true
  },
  description: {
      type: String,
      required: true,
      unique: true
  },
  version: {
      type: String, // You can use String for version numbering (e.g., "v1.0", "v1.1", etc.)
      required: true,
      default: 'v1.0' // Default to the initial version
  }
});

// updates version everytime the schema is updated. 
regulationSchema.pre('save', async function(next) {
  try {
    // Find the latest version of regulations
    const latestVersion = await Regulation.find({})
    let maxVersion=0
    if(latestVersion.length>0)
    {
      maxVersion = latestVersion[0].version
    }

    // // Increment the version for this regulation
    // get the minor part i.e the decimal part of the version number and increment that
    const [major, minor] = maxVersion.substring(1).split('.').map(Number);

    // Increment the minor version
    const newMinor = minor + 1;

    // Generate the new version string
    const newVersion = `v${major}.${newMinor}`;
    this.version = newVersion

    // Update all regulations with the latest version
    await Regulation.updateMany({}, { version: this.version });

    next();
  } 
  catch (error) 
  {
    next(error);
  }
});

const Regulation = mongoose.model('Regulation', regulationSchema);

export default Regulation;
