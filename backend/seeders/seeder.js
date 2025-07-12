// seeders/seeder.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const User = require('../models/User');
const Tool = require('../models/Tool');
const Part = require('../models/Part');
const Maintenance = require('../models/Maintenance');
const Fault = require('../models/Fault');

const seed = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing data
        await Promise.all([
            User.deleteMany(),
            Tool.deleteMany(),
            Part.deleteMany(),
            Maintenance.deleteMany(),
            Fault.deleteMany(),
        ]);

        // Create users
        const passHash = await bcrypt.hash('123456', 10);
        const admin = await User.create({ name: 'Yaron serlin', email: 'yaron155@gmail.com', role: 'admin', password: passHash });
        const operator = await User.create({ name: 'Operator User', email: 'operator@example.com', role: 'operator', password: passHash });
        const mechanic = await User.create({ name: 'Mechanic User', email: 'mechanic@example.com', role: 'mechanic', password: passHash });

        // Create tools
        const tools = await Tool.insertMany([
            { name: 'Class 890', serialNumber: 'T1001', description: 'Heavy-duty tractor', localSerialNumber: '23', model: '890' },
            { name: 'Krone 770', serialNumber: 'H2002', description: 'Field harvester', localSerialNumber: '24', model: '770' },
        ]);

        // Create parts
        const parts = await Part.insertMany([
            { name: 'Filter', partNumber: 'F-001', tool: tools[0]._id, inStock: 5 },
            { name: 'Blade', partNumber: 'B-123', tool: tools[1]._id, inStock: 10 },
        ]);

        // Create maintenance logs
        await Maintenance.insertMany([
            { tool: tools[0]._id, mechanic: mechanic._id, details: 'Changed oil and filter' },
            { tool: tools[1]._id, mechanic: mechanic._id, details: 'Sharpened blades' },
        ]);

        // Create faults
        await Fault.insertMany([
            { code: "000", tool: tools[0]._id, operator: operator._id, description: 'Engine overheating', photos: [], status: 'open' },
            { code: "000", tool: tools[0]._id, operator: operator._id, description: 'Engine overheating', photos: [], status: 'open' },
            { code: "000", tool: tools[0]._id, operator: operator._id, description: 'Engine overheating', photos: [], status: 'open' },
            { code: "000", tool: tools[0]._id, operator: operator._id, description: 'Engine overheating', photos: [], status: 'open' },
            { code: "001", tool: tools[1]._id, operator: operator._id, description: 'Blade damage', photos: [], status: 'closed', closedAt: new Date() },
        ]);
        // Associate faults with tools
        const faults = await Fault.find();
        for (const fault of faults) {
            await Tool.updateOne(
                { _id: fault.tool },
                { $push: { faults: fault._id } }
            );
        }

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seed();