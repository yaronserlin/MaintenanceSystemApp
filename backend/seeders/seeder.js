// seeders/seeder.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const Company = require('../models/Company');
const User = require('../models/User');
const Tool = require('../models/Tool');
const Part = require('../models/Part');
const Maintenance = require('../models/Maintenance');
const Fault = require('../models/Fault');

const seed = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Promise.all([
            Company.deleteMany(),
            User.deleteMany(),
            Tool.deleteMany(),
            Part.deleteMany(),
            Maintenance.deleteMany(),
            Fault.deleteMany(),
        ]);

        const passHash = await bcrypt.hash('password123', 10);

        // ── Company 1: Acme Manufacturing ──────────────────────────────
        const acme = await Company.create({
            name: 'Acme Manufacturing',
            slug: 'acme-manufacturing',
            isActive: true,
        });

        const acmeAdmin = await User.create({
            name: 'Acme Admin',
            email: 'admin@acme.com',
            role: 'admin',
            password: passHash,
            companyId: acme._id,
        });

        const acmeOperator = await User.create({
            name: 'Acme Operator',
            email: 'operator@acme.com',
            role: 'operator',
            password: passHash,
            companyId: acme._id,
        });

        const acmeMechanic = await User.create({
            name: 'Acme Mechanic',
            email: 'mechanic@acme.com',
            role: 'mechanic',
            password: passHash,
            companyId: acme._id,
        });

        const acmeTools = await Tool.insertMany([
            {
                name: 'Class 890 Harvester',
                serialNumber: 'T1001',
                description: 'Heavy-duty field harvester',
                localSerialNumber: '23',
                model: '890',
                companyId: acme._id,
            },
            {
                name: 'Krone 770 Tractor',
                serialNumber: 'H2002',
                description: 'Industrial utility tractor',
                localSerialNumber: '24',
                model: '770',
                companyId: acme._id,
            },
        ]);

        const acmeParts = await Part.insertMany([
            {
                name: 'Oil Filter',
                partNumber: 'F-001',
                tool: acmeTools[0]._id,
                inStock: 5,
                companyId: acme._id,
            },
            {
                name: 'Cutter Blade',
                partNumber: 'B-123',
                tool: acmeTools[1]._id,
                inStock: 10,
                companyId: acme._id,
            },
        ]);

        await Maintenance.insertMany([
            {
                tool: acmeTools[0]._id,
                mechanic: acmeMechanic._id,
                details: 'Changed hydraulic oil and primary filter',
                companyId: acme._id,
            },
            {
                tool: acmeTools[1]._id,
                mechanic: acmeMechanic._id,
                details: 'Sharpened rotary blades',
                companyId: acme._id,
            },
        ]);

        const acmeFaults = await Fault.insertMany([
            {
                code: '001',
                tool: acmeTools[0]._id,
                operator: acmeOperator._id,
                description: 'Engine temperature warning active',
                status: 'open',
                companyId: acme._id,
            },
            {
                code: '002',
                tool: acmeTools[1]._id,
                operator: acmeOperator._id,
                description: 'Hydraulic pressure drop during load',
                status: 'closed',
                closedAt: new Date(),
                companyId: acme._id,
            },
        ]);

        // Link faults to tools
        for (const fault of acmeFaults) {
            await Tool.updateOne(
                { _id: fault.tool },
                { $push: { faults: fault._id } }
            );
        }

        // ── Company 2: Beta Industrial ─────────────────────────────────
        const beta = await Company.create({
            name: 'Beta Industrial',
            slug: 'beta-industrial',
            isActive: true,
        });

        const betaAdmin = await User.create({
            name: 'Beta Admin',
            email: 'admin@beta.com',
            role: 'admin',
            password: passHash,
            companyId: beta._id,
        });

        const betaOperator = await User.create({
            name: 'Beta Operator',
            email: 'operator@beta.com',
            role: 'operator',
            password: passHash,
            companyId: beta._id,
        });

        const betaTools = await Tool.insertMany([
            {
                name: 'CAT 320 Excavator',
                serialNumber: 'CAT-320',
                description: 'Standard hydraulic excavator',
                localSerialNumber: 'B-10',
                model: '320D',
                companyId: beta._id,
            },
        ]);

        await Part.insertMany([
            {
                name: 'Hydraulic Seal Kit',
                partNumber: 'HS-900',
                tool: betaTools[0]._id,
                inStock: 3,
                companyId: beta._id,
            },
        ]);

        console.log('Database seeded successfully with two isolated companies:');
        console.log('  1. Acme Manufacturing (admin@acme.com / password123)');
        console.log('  2. Beta Industrial    (admin@beta.com / password123)');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seed();