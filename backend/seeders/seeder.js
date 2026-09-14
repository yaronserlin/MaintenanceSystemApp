// seeders/seeder.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const Company = require('../models/Company');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Tool = Equipment;
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
            Equipment.deleteMany(),
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

        const in3Days = new Date();
        in3Days.setDate(in3Days.getDate() + 3);

        const in20Days = new Date();
        in20Days.setDate(in20Days.getDate() + 20);

        const in60Days = new Date();
        in60Days.setDate(in60Days.getDate() + 60);

        const acmeEquipments = await Equipment.insertMany([
            {
                name: 'CAT 320 Hydraulic Excavator',
                serialNumber: 'CAT-EX-9921',
                description: 'Heavy tracked earthmover for deep trenching and foundation work',
                localSerialNumber: 'EX-01',
                model: '320-GC',
                currentEngineHours: 1420,
                companyId: acme._id,
                books: [
                    {
                        title: 'Operator Manual (CAT 320-GC)',
                        fileUrl: '/uploads/sample-cat320-manual.pdf',
                        fileName: 'CAT320_Manual.pdf',
                        fileSize: 2457600,
                        uploadedAt: new Date(),
                    },
                    {
                        title: 'Hydraulic Schematic & Hose Routing',
                        fileUrl: '/uploads/sample-cat320-schematic.pdf',
                        fileName: 'CAT320_Hydraulics.pdf',
                        fileSize: 1540800,
                        uploadedAt: new Date(),
                    },
                ],
                maintenanceSchedule: [
                    {
                        title: '250hr Engine Oil & Filter Service',
                        description: 'Drain engine oil, replace filter element, inspect air intake',
                        intervalHours: 250,
                        intervalDays: 0,
                        lastPerformedHours: 1250,
                        lastPerformedDate: new Date(Date.now() - 30 * 86400000),
                        nextDueHours: 1500,
                        status: 'normal',
                        checklist: [
                            { text: 'Drain crankcase engine oil into recovery container', done: true },
                            { text: 'Replace primary engine oil filter spin-on cartridge', done: false },
                            { text: 'Inspect air intake ducting and clean primary element', done: false },
                            { text: 'Refill engine with 15W-40 API CK-4 oil and verify level on dipstick', done: false },
                        ],
                    },
                    {
                        title: '500hr Hydraulic Return Filter Replacement',
                        description: 'Replace hydraulic pilot and return filters, inspect fluid clarity',
                        intervalHours: 500,
                        intervalDays: 0,
                        lastPerformedHours: 1000,
                        lastPerformedDate: new Date(Date.now() - 75 * 86400000),
                        nextDueHours: 1500,
                        status: 'normal',
                        checklist: [
                            { text: 'Depressurize hydraulic reservoir tank and bleed air valve', done: false },
                            { text: 'Unscrew hydraulic return filter assembly and extract element', done: false },
                            { text: 'Inspect magnetic strainer for metal particulates', done: false },
                            { text: 'Install new genuine filter element and torque cover bolts', done: false },
                        ],
                    },
                    {
                        title: 'Monthly Track Tension & Undercarriage Check',
                        description: 'Measure track sag, check idler seals and roller play',
                        intervalHours: 0,
                        intervalDays: 30,
                        lastPerformedHours: 1400,
                        lastPerformedDate: new Date(Date.now() - 27 * 86400000),
                        nextDueDate: in3Days,
                        status: 'due_soon',
                        checklist: [
                            { text: 'Measure track sag between front idler and upper carrier roller', done: true },
                            { text: 'Inspect grease valve and track cylinder relief port', done: true },
                            { text: 'Check lower track rollers for oil leakage or abnormal binding', done: false },
                            { text: 'Verify drive sprocket segment bolt torques (450 Nm)', done: false },
                        ],
                    },
                ],
            },
            {
                name: 'Komatsu D65PX Crawler Bulldozer',
                serialNumber: 'KOM-DOZ-4410',
                description: 'Wide-track swamp bulldozer with semi-U tilting blade',
                localSerialNumber: 'DOZ-04',
                model: 'D65PX-18',
                currentEngineHours: 2865,
                companyId: acme._id,
                books: [
                    {
                        title: 'Komatsu D65PX Service Workshop Manual',
                        fileUrl: '/uploads/sample-d65px-service.pdf',
                        fileName: 'Komatsu_D65PX_Service.pdf',
                        fileSize: 4194304,
                        uploadedAt: new Date(),
                    },
                ],
                maintenanceSchedule: [
                    {
                        title: '1000hr Transmission & Final Drive Fluid',
                        description: 'Replace powertrain oil and magnetic strainer cleaning',
                        intervalHours: 1000,
                        intervalDays: 0,
                        lastPerformedHours: 1800,
                        lastPerformedDate: new Date(Date.now() - 180 * 86400000),
                        nextDueHours: 2800,
                        status: 'overdue',
                        checklist: [
                            { text: 'Drain torque converter, transmission, and bevel gear case', done: false },
                            { text: 'Remove and clean powertrain magnetic suction strainer', done: false },
                            { text: 'Replace transmission high-pressure inline oil filter element', done: false },
                            { text: 'Refill powertrain case with approved TO-4 SAE 30 fluid', done: false },
                        ],
                    },
                    {
                        title: '250hr Blade Wear Plates Inspection',
                        description: 'Check cutting edge bolt torques and weld seams',
                        intervalHours: 250,
                        intervalDays: 0,
                        lastPerformedHours: 2700,
                        lastPerformedDate: new Date(Date.now() - 20 * 86400000),
                        nextDueHours: 2950,
                        status: 'normal',
                        checklist: [
                            { text: 'Measure blade cutting edge thickness and wear life remaining', done: true },
                            { text: 'Check end bit plow bolts and re-torque loose fasteners', done: true },
                            { text: 'Inspect blade lift cylinder pins and spherical bushings', done: false },
                        ],
                    },
                ],
            },
            {
                name: 'John Deere 8R 410 Utility Tractor',
                serialNumber: 'JD-8R-7712',
                description: 'High-horsepower utility tractor with e23 powershift transmission',
                localSerialNumber: 'TR-12',
                model: '8R-410',
                currentEngineHours: 680,
                companyId: acme._id,
                books: [
                    {
                        title: 'John Deere 8R Series Operator Guide',
                        fileUrl: '/uploads/sample-jd8r-guide.pdf',
                        fileName: 'JD_8R_Guide.pdf',
                        fileSize: 3120000,
                        uploadedAt: new Date(),
                    },
                ],
                maintenanceSchedule: [
                    {
                        title: '50hr Chassis & 3-Point Hitch Grease',
                        description: 'Lubricate all grease fittings and PTO shaft bearings',
                        intervalHours: 50,
                        intervalDays: 0,
                        lastPerformedHours: 640,
                        lastPerformedDate: new Date(Date.now() - 10 * 86400000),
                        nextDueHours: 690,
                        status: 'due_soon',
                        checklist: [
                            { text: 'Grease front axle oscillation pivot pins and kingpins', done: true },
                            { text: 'Grease 3-point hitch sway blocks and lift arm pivot joints', done: true },
                            { text: 'Apply multi-purpose grease to PTO master shield collar', done: false },
                        ],
                    },
                    {
                        title: '500hr Fuel Filter & Water Separator',
                        description: 'Replace primary/secondary fuel filters, test rail pressure',
                        intervalHours: 500,
                        intervalDays: 0,
                        lastPerformedHours: 500,
                        lastPerformedDate: new Date(Date.now() - 45 * 86400000),
                        nextDueHours: 1000,
                        status: 'normal',
                        checklist: [
                            { text: 'Drain primary water separator bowl sediment', done: true },
                            { text: 'Replace pre-filter and secondary high-pressure fuel filters', done: false },
                            { text: 'Cycle ignition key 30 seconds to electronically purge fuel lines', done: false },
                        ],
                    },
                ],
            },
            {
                name: 'Volvo L120H Wheel Loader',
                serialNumber: 'VOL-WL-3301',
                description: 'Production wheel loader equipped with 3.5m³ rehandling bucket',
                localSerialNumber: 'WL-02',
                model: 'L120H',
                currentEngineHours: 3210,
                companyId: acme._id,
                maintenanceSchedule: [
                    {
                        title: '1000hr Brake Cooling & Axle Oil Service',
                        description: 'Replace wet disc brake fluid and planetaries oil',
                        intervalHours: 1000,
                        intervalDays: 0,
                        lastPerformedHours: 2000,
                        lastPerformedDate: new Date(Date.now() - 190 * 86400000),
                        nextDueHours: 3000,
                        status: 'overdue',
                        checklist: [
                            { text: 'Drain front and rear axle differential housings', done: false },
                            { text: 'Replace axle oil circulation and brake cooling spin-on filters', done: false },
                            { text: 'Inspect planetary hub wheel seals for oil weeping', done: false },
                            { text: 'Refill axles with approved wet disc brake gear lubricant', done: false },
                        ],
                    },
                ],
            },
            {
                name: 'Cummins QSK60 Industrial Generator',
                serialNumber: 'CUM-GEN-8833',
                description: '2000kVA emergency standby diesel generator unit',
                localSerialNumber: 'GEN-01',
                model: 'QSK60-G4',
                currentEngineHours: 495,
                companyId: acme._id,
                maintenanceSchedule: [
                    {
                        title: 'Monthly Load Bank & Transfer Switch Test',
                        description: 'Run 100% full-load bank test for 60 minutes, check AVR stability',
                        intervalHours: 0,
                        intervalDays: 30,
                        lastPerformedHours: 485,
                        lastPerformedDate: new Date(Date.now() - 10 * 86400000),
                        nextDueDate: in20Days,
                        status: 'normal',
                        checklist: [
                            { text: 'Perform automatic transfer switch (ATS) simulation test', done: true },
                            { text: 'Connect load bank and apply step loads up to 100% (1600 kW)', done: true },
                            { text: 'Record oil pressure, coolant temp, and frequency stability under full load', done: false },
                            { text: 'Inspect dual starting battery charger float voltage (27.2V DC)', done: false },
                        ],
                    },
                    {
                        title: '500hr Heavy Coolant Flush & DCA Test',
                        description: 'Check nitrite corrosion inhibitors and heater block seals',
                        intervalHours: 500,
                        intervalDays: 0,
                        lastPerformedHours: 0,
                        lastPerformedDate: new Date(Date.now() - 365 * 86400000),
                        nextDueHours: 500,
                        status: 'due_soon',
                        checklist: [
                            { text: 'Test coolant freeze point and supplemental coolant additives (SCA)', done: true },
                            { text: 'Inspect engine water pump weep hole for seal leakage', done: false },
                            { text: 'Flush radiator core fins and check fan drive belt tension', done: false },
                            { text: 'Replace coolant corrosion inhibitor filter cartridge', done: false },
                        ],
                    },
                ],
            },
            {
                name: 'Toyota 8FGU25 Forklift',
                serialNumber: 'TOY-FL-1092',
                description: '5,000 lb internal combustion pneumatic tire forklift',
                localSerialNumber: 'FL-05',
                model: '8FGU25',
                currentEngineHours: 850,
                companyId: acme._id,
                maintenanceSchedule: [
                    {
                        title: '90-Day Mast Chain & Fork Thickness Inspection',
                        description: 'Calibrate fork caliper wear (<10% threshold) and chain stretch',
                        intervalHours: 0,
                        intervalDays: 90,
                        lastPerformedHours: 800,
                        lastPerformedDate: new Date(Date.now() - 30 * 86400000),
                        nextDueDate: in60Days,
                        status: 'normal',
                        checklist: [
                            { text: 'Measure fork blade and heel thickness for wear (<10% allowed)', done: true },
                            { text: 'Check mast lift chains for elongation using chain wear gauge', done: true },
                            { text: 'Lubricate mast channels, side thrust rollers, and carriage', done: false },
                            { text: 'Inspect hydraulic lift and tilt cylinders and hose sheaves', done: false },
                        ],
                    },
                ],
            },
        ]);

        const acmeParts = await Part.insertMany([
            {
                name: 'Excavator Oil Filter',
                partNumber: '1R-1808',
                tool: acmeEquipments[0]._id,
                inStock: 8,
                companyId: acme._id,
            },
            {
                name: 'Hydraulic Return Filter',
                partNumber: 'HF-6510',
                tool: acmeEquipments[0]._id,
                inStock: 4,
                companyId: acme._id,
            },
            {
                name: 'Bulldozer End Bit Cutting Edge',
                partNumber: '14X-71-11310',
                tool: acmeEquipments[1]._id,
                inStock: 2,
                companyId: acme._id,
            },
            {
                name: 'Tractor Secondary Fuel Filter',
                partNumber: 'RE539465',
                tool: acmeEquipments[2]._id,
                inStock: 12,
                companyId: acme._id,
            },
            {
                name: 'Loader Brake Disc Set',
                partNumber: 'VOE-111029',
                tool: acmeEquipments[3]._id,
                inStock: 1,
                companyId: acme._id,
            },
            {
                name: 'Generator Fuel Water Separator',
                partNumber: 'FS1006',
                tool: acmeEquipments[4]._id,
                inStock: 6,
                companyId: acme._id,
            },
        ]);

        await Maintenance.insertMany([
            {
                tool: acmeEquipments[0]._id,
                mechanic: acmeMechanic._id,
                details: 'Completed 250hr service: drained 28L 15W-40 oil, replaced oil filter 1R-1808. Engine running smoothly.',
                date: new Date(Date.now() - 30 * 86400000),
                companyId: acme._id,
            },
            {
                tool: acmeEquipments[1]._id,
                mechanic: acmeMechanic._id,
                details: 'Replaced LH tilt cylinder hydraulic hose after minor weep noticed during inspection.',
                date: new Date(Date.now() - 40 * 86400000),
                companyId: acme._id,
            },
            {
                tool: acmeEquipments[2]._id,
                mechanic: acmeMechanic._id,
                details: 'Adjusted steering drag link and performed e23 transmission calibration.',
                date: new Date(Date.now() - 15 * 86400000),
                companyId: acme._id,
            },
        ]);

        const acmeFaults = await Fault.insertMany([
            {
                code: 'HYD-102',
                tool: acmeEquipments[0]._id,
                operator: acmeOperator._id,
                description: 'Main boom cylinder drops ~5cm over 10 minutes when parked with engine off.',
                engineHours: 1415,
                status: 'open',
                companyId: acme._id,
            },
            {
                code: 'ENG-401',
                tool: acmeEquipments[1]._id,
                operator: acmeOperator._id,
                description: 'Coolant temperature light illuminates under heavy blade load on incline.',
                engineHours: 2860,
                status: 'open',
                companyId: acme._id,
            },
            {
                code: 'ELEC-05',
                tool: acmeEquipments[2]._id,
                operator: acmeOperator._id,
                description: 'Cab work lamp LH array flickering when alternator is loaded.',
                engineHours: 678,
                status: 'open',
                companyId: acme._id,
            },
            {
                code: 'BRK-22',
                tool: acmeEquipments[3]._id,
                operator: acmeOperator._id,
                description: 'Front axle brake pedal soft feel, requires double pumping under full payload.',
                engineHours: 3200,
                status: 'closed',
                closingEngineHours: 3208,
                closedAt: new Date(Date.now() - 2 * 86400000),
                companyId: acme._id,
            },
            {
                code: 'GEN-08',
                tool: acmeEquipments[4]._id,
                operator: acmeOperator._id,
                description: 'Battery trickle charger fault code displayed on DSE control panel.',
                engineHours: 490,
                status: 'closed',
                closingEngineHours: 495,
                closedAt: new Date(Date.now() - 5 * 86400000),
                companyId: acme._id,
            },
            {
                code: 'FL-03',
                tool: acmeEquipments[5]._id,
                operator: acmeOperator._id,
                description: 'Propane regulator slow start in cold mornings.',
                engineHours: 840,
                status: 'open',
                companyId: acme._id,
            },
        ]);

        // Link faults to equipment
        for (const fault of acmeFaults) {
            await Equipment.updateOne(
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

        const betaMechanic = await User.create({
            name: 'Beta Mechanic',
            email: 'mechanic@beta.com',
            role: 'mechanic',
            password: passHash,
            companyId: beta._id,
        });

        const betaEquipments = await Equipment.insertMany([
            {
                name: 'Hitachi ZX350 Excavator',
                serialNumber: 'HIT-ZX-350',
                description: 'Heavy quarry excavator with quick coupler',
                localSerialNumber: 'B-01',
                model: 'ZX350LC-6',
                currentEngineHours: 1950,
                companyId: beta._id,
                maintenanceSchedule: [
                    {
                        title: '500hr Hydraulic Filter Service',
                        description: 'Replace main hydraulic return and pilot circuit filters',
                        intervalHours: 500,
                        lastPerformedHours: 1500,
                        nextDueHours: 2000,
                        status: 'due_soon',
                        checklist: [
                            { text: 'Release hydraulic reservoir air pressure through tank breather', done: true },
                            { text: 'Replace pilot filter and main return filter elements', done: false },
                            { text: 'Inspect suction strainer magnet for contamination', done: false },
                            { text: 'Torque filter head cover bolts to specification', done: false },
                        ],
                    },
                ],
            },
        ]);

        await Part.insertMany([
            {
                name: 'Hydraulic Seal Kit',
                partNumber: 'HS-900',
                tool: betaEquipments[0]._id,
                inStock: 3,
                companyId: beta._id,
            },
        ]);

        console.log('Database seeded successfully with rich multi-tenant equipment data:');
        console.log('  1. Acme Manufacturing (admin@acme.com / mechanic@acme.com / operator@acme.com | password123)');
        console.log(`     -> ${acmeEquipments.length} equipment items, ${acmeFaults.length} faults, ${acmeParts.length} parts`);
        console.log('  2. Beta Industrial    (admin@beta.com / mechanic@beta.com / operator@beta.com | password123)');
        console.log(`     -> ${betaEquipments.length} equipment items`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seed();