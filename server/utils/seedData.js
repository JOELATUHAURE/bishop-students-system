const bcrypt = require('bcryptjs');
const { User, Role, sequelize } = require('../models');

const seedRoles = async () => {
  try {
    // Create roles
    await Role.bulkCreate([
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'reviewer', description: 'Application reviewer with limited admin access' },
      { name: 'applicant', description: 'Student applicant' },
    ]);

    console.log('Roles seeded successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
  }
};

const seedAdminUser = async () => {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@bishopstuart.ac.ug',
      password: hashedPassword,
      phone: '+256700000000',
      isActive: true,
      isVerified: true,
    });

    // Find admin role
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (adminRole) {
      await admin.addRole(adminRole);
    }

    console.log('Admin user seeded successfully');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

const seedData = async () => {
  const transaction = await sequelize.transaction();

  try {
    // Check if roles already exist
    const rolesCount = await Role.count();
    if (rolesCount === 0) {
      await seedRoles();
    }

    // Check if admin user already exists
    const adminExists = await User.findOne({ where: { email: 'admin@bishopstuart.ac.ug' } });
    if (!adminExists) {
      await seedAdminUser();
    }

    await transaction.commit();
    console.log('Seed data complete');
  } catch (error) {
    await transaction.rollback();
    console.error('Error seeding data:', error);
  }
};

module.exports = seedData;