const { Role, User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function seedRoles() {
  const transaction = await sequelize.transaction();
  
  try {
    // Create roles
    const roles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'reviewer', description: 'Application reviewer with limited admin access' },
      { name: 'applicant', description: 'Student applicant' },
    ];
    
    // Check if roles already exist
    const existingRoles = await Role.findAll();
    if (existingRoles.length === 0) {
      await Role.bulkCreate(roles, { transaction });
      console.log('Roles seeded successfully');
    } else {
      console.log('Roles already exist, skipping seed');
    }
    
    // Check if admin user exists
    const adminExists = await User.findOne({ 
      where: { email: 'admin@bishopstuart.ac.ug' } 
    });
    
    if (!adminExists) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@bishopstuart.ac.ug',
        password: hashedPassword,
        phone: '+256700000000',
        isActive: true,
        isVerified: true,
      }, { transaction });
      
      // Find admin role
      const adminRole = await Role.findOne({ 
        where: { name: 'admin' },
        transaction,
      });
      
      if (adminRole) {
        await admin.addRole(adminRole, { transaction });
      }
      
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists, skipping seed');
    }
    
    await transaction.commit();
    console.log('Seed completed successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('Error seeding data:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  seedRoles()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during seeding:', error);
      process.exit(1);
    });
}

module.exports = seedRoles;