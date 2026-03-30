const mongoose = require('mongoose');
require('dotenv').config();

const Loan = require('./models/Loan');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to DB");

    const loans = await Loan.find({ items: { $exists: true, $size: 0 }, itemId: { $exists: true, $ne: null } });
    console.log(`Found ${loans.length} loans to migrate`);

    for (const loan of loans) {
      if (loan.itemId) {
        loan.items = [loan.itemId];
        await loan.save();
      }
    }

    console.log("Migration complete");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
