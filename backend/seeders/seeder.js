// seeders/seeder.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const Company = require('../models/Company');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Part = require('../models/Part');
const Maintenance = require('../models/Maintenance');
const Fault = require('../models/Fault');

const daysAgo = (days) => new Date(Date.now() - days * 86400000);
const daysFromNow = (days) => new Date(Date.now() + days * 86400000);

const service = (title, description, intervalHours, lastPerformedHours, status, checklist, options = {}) => ({
    title,
    description,
    intervalHours,
    intervalDays: options.intervalDays || 0,
    lastPerformedHours,
    lastPerformedDate: options.lastPerformedDate || daysAgo(30),
    nextDueHours: options.nextDueHours || (intervalHours ? lastPerformedHours + intervalHours : 0),
    nextDueDate: options.nextDueDate,
    status,
    checklist: checklist.map((text, index) => ({ text, done: index < (options.completed || 0) })),
});

const createUsers = async (company, people) => Promise.all(people.map((person) => User.create({
    ...person,
    password: person.password,
    companyId: company._id,
})));

const linkFaults = async (faults) => {
    for (const fault of faults) {
        await Equipment.updateOne({ _id: fault.tool }, { $push: { faults: fault._id } });
    }
};

const seed = async () => {
    try {
        await connectDB();
        await Promise.all([
            Company.deleteMany(),
            User.deleteMany(),
            Equipment.deleteMany(),
            Part.deleteMany(),
            Maintenance.deleteMany(),
            Fault.deleteMany(),
        ]);

        const password = await bcrypt.hash('password123', 10);

        const valley = await Company.create({
            name: 'Green Valley Forage & Dairy',
            slug: 'green-valley-forage-dairy',
            isActive: true,
        });
        const [valleyAdmin, valleyOperator, valleyMechanic] = await createUsers(valley, [
            { name: 'Megan Carter', email: 'admin@greenvalleyfarm.com', role: 'admin', password },
            { name: 'Luke Bennett', email: 'operator@greenvalleyfarm.com', role: 'operator', password },
            { name: 'Tom Alvarez', email: 'mechanic@greenvalleyfarm.com', role: 'mechanic', password },
        ]);

        const valleyEquipment = await Equipment.insertMany([
            {
                name: 'John Deere 8R 410 Tractor', serialNumber: '1RW8410DCPD102481', localSerialNumber: 'TRACTOR-01', model: '8R 410',
                description: '410 hp row-crop tractor used for forage harvest, tillage, and heavy haulage', currentEngineHours: 2480, companyId: valley._id,
                maintenanceSchedule: [
                    service('500-hour engine and transmission service', 'Replace engine oil, filters, and transmission oil sample.', 500, 2000, 'normal', ['Replace John Deere Plus-50 II engine oil and filter', 'Replace fuel filters and drain water separator', 'Take transmission and hydraulic oil samples', 'Grease front axle, three-point hitch, and PTO shaft'], { completed: 3 }),
                    service('Daily pre-harvest inspection', 'Inspect fluids, tires, lights, hitch, and PTO before field work.', 0, 2475, 'due_soon', ['Check engine coolant, engine oil, hydraulic oil, and DEF levels', 'Inspect dual tires and wheel lug torque', 'Test PTO, work lights, and ISOBUS connection'], { intervalDays: 1, nextDueDate: daysFromNow(1), completed: 2 }),
                ],
            },
            {
                name: 'CLAAS JAGUAR 970 Forage Harvester', serialNumber: 'J970-CA-2022-00417', localSerialNumber: 'SILAGE-01', model: 'JAGUAR 970',
                description: '884 hp self-propelled forage harvester with PICK UP 300 grass pick-up and corn header', currentEngineHours: 1890, companyId: valley._id,
                maintenanceSchedule: [
                    service('Knife drum and shear bar adjustment', 'Set knife clearance and inspect drum knives before the silage season.', 100, 1800, 'due_soon', ['Inspect all V-Classic knives for cracks and edge wear', 'Set shear bar clearance with the CEBIS adjustment routine', 'Check metal detector and stone detector operation', 'Inspect crop accelerator paddles and mounting bolts'], { nextDueHours: 1900, completed: 1 }),
                    service('1000-hour engine service', 'Service the MAN V12 engine and inspect the cooling package.', 1000, 1000, 'normal', ['Replace engine oil and both primary and secondary oil filters', 'Clean reversible radiator and intercooler screens', 'Inspect drive belts and cooling fan hydraulic motor'], { completed: 3 }),
                ],
            },
            {
                name: 'New Holland BigBaler 1290 High Density', serialNumber: 'HB1290HD-2021-01763', localSerialNumber: 'BALER-01', model: 'BigBaler 1290 High Density',
                description: 'High-density square baler producing 120 x 90 cm bales of hay and straw', currentEngineHours: 0, companyId: valley._id,
                maintenanceSchedule: [
                    service('Pre-season plunger and knotter inspection', 'Check plunger bearings, needles, knotters, and bale chamber wear.', 250, 0, 'overdue', ['Inspect plunger rollers and set plunger knife clearance', 'Check knotter billhooks, needles, and twine discs', 'Inspect pickup tines and replace bent or missing tines', 'Grease all automatic lubrication points and fill reservoir'], { nextDueHours: 250 }),
                ],
            },
            {
                name: 'Krone EasyCut B 1000 CV Mower Conditioner', serialNumber: 'KR-EC1000-2023-00891', localSerialNumber: 'MOWER-01', model: 'EasyCut B 1000 CV',
                description: '10.10 m butterfly mower conditioner for high-capacity grass and alfalfa cutting', currentEngineHours: 0, companyId: valley._id,
                maintenanceSchedule: [
                    service('Mower bed and conditioner inspection', 'Inspect cutterbar oil, blades, guards, rollers, and PTO driveline.', 0, 0, 'due_soon', ['Check cutterbar oil level and inspect for leaks', 'Replace damaged blades and verify blade bolt torque', 'Inspect conditioner roller timing and rubber profiles', 'Grease PTO universal joints and telescoping tubes'], { intervalDays: 30, nextDueDate: daysFromNow(6), completed: 2 }),
                ],
            },
            {
                name: 'JCB 541-70 Agri Super Telehandler', serialNumber: 'JCB54170-AG-2020-03142', localSerialNumber: 'TELEHANDLER-01', model: '541-70 Agri Super',
                description: '17 m telehandler used for silage clamp loading, pallet handling, and manure work', currentEngineHours: 4120, companyId: valley._id,
                maintenanceSchedule: [
                    service('500-hour boom and hydraulic service', 'Replace hydraulic filters and inspect boom wear pads and pins.', 500, 4000, 'due_soon', ['Replace hydraulic return and pilot filters', 'Inspect boom sections, wear pads, and extension chains', 'Check carriage locking pins and attachment coupler', 'Grease boom pivot pins and stabilizer cylinders'], { nextDueHours: 4500, completed: 2 }),
                ],
            },
        ]);

        const valleyParts = await Part.insertMany([
            { name: 'John Deere Engine Oil Filter', partNumber: 'RE572785', tool: valleyEquipment[0]._id, inStock: 6, companyId: valley._id },
            { name: 'John Deere Fuel Filter', partNumber: 'RE539465', tool: valleyEquipment[0]._id, inStock: 8, companyId: valley._id },
            { name: 'CLAAS JAGUAR V-Classic Knife', partNumber: 'CLAAS-000981', tool: valleyEquipment[1]._id, inStock: 48, companyId: valley._id },
            { name: 'CLAAS Shear Bar', partNumber: 'CLAAS-000982', tool: valleyEquipment[1]._id, inStock: 2, companyId: valley._id },
            { name: 'New Holland BigBaler Knotter Knife', partNumber: '84476512', tool: valleyEquipment[2]._id, inStock: 12, companyId: valley._id },
            { name: 'Krone Mower Blade Set', partNumber: '1370660', tool: valleyEquipment[3]._id, inStock: 24, companyId: valley._id },
            { name: 'JCB Hydraulic Return Filter', partNumber: '32/925346', tool: valleyEquipment[4]._id, inStock: 4, companyId: valley._id },
        ]);
        await Maintenance.insertMany([
            { tool: valleyEquipment[0]._id, mechanic: valleyMechanic._id, details: 'Completed 2,000-hour service before spring field preparation. Oil samples sent to the lab; no abnormal wear reported.', date: daysAgo(18), companyId: valley._id },
            { tool: valleyEquipment[1]._id, mechanic: valleyMechanic._id, details: 'Replaced 24 worn forage harvester knives and set the shear bar. Metal detector test passed.', date: daysAgo(9), companyId: valley._id },
            { tool: valleyEquipment[4]._id, mechanic: valleyMechanic._id, details: 'Replaced the hydraulic return filter and repaired a small leak at the boom auxiliary coupler.', date: daysAgo(32), companyId: valley._id },
        ]);
        const valleyFaults = await Fault.insertMany([
            { code: 'FORAGE-014', tool: valleyEquipment[1]._id, operator: valleyOperator._id, description: 'Metal detector warning appears intermittently while harvesting first-cut grass; drum stops as designed.', engineHours: 1882, status: 'open', companyId: valley._id },
            { code: 'TRACTOR-007', tool: valleyEquipment[0]._id, operator: valleyOperator._id, description: 'Hydraulic oil temperature rises above normal during continuous silage trailer loading.', engineHours: 2471, status: 'open', companyId: valley._id },
            { code: 'BALER-003', tool: valleyEquipment[2]._id, operator: valleyOperator._id, description: 'Knotter 4 is missing twine on occasional bales at high plunger speed.', engineHours: 0, status: 'closed', closingEngineHours: 0, closedAt: daysAgo(4), companyId: valley._id },
        ]);
        await linkFaults(valleyFaults);

        const prairie = await Company.create({ name: 'Prairie Crest Grain & Hay', slug: 'prairie-crest-grain-hay', isActive: true });
        const [prairieAdmin, prairieOperator, prairieMechanic] = await createUsers(prairie, [
            { name: 'Daniel Morgan', email: 'admin@prairiecrestfarm.com', role: 'admin', password },
            { name: 'Sarah Wilson', email: 'operator@prairiecrestfarm.com', role: 'operator', password },
            { name: 'Ethan Brooks', email: 'mechanic@prairiecrestfarm.com', role: 'mechanic', password },
        ]);
        const prairieEquipment = await Equipment.insertMany([
            {
                name: 'Case IH Axial-Flow 9250 Combine', serialNumber: 'Y9G00950VJRF01284', localSerialNumber: 'COMBINE-01', model: 'Axial-Flow 9250',
                description: 'Class 9 rotary combine with 45 ft grain platform for wheat, soybeans, and corn harvest', currentEngineHours: 3260, companyId: prairie._id,
                maintenanceSchedule: [
                    service('Pre-harvest rotor and elevator inspection', 'Inspect rotor elements, concaves, elevators, belts, and grain loss sensors.', 500, 3000, 'due_soon', ['Inspect rotor rasp bars and concave wire condition', 'Check clean grain elevator chain tension and paddles', 'Calibrate yield monitor and grain loss sensors', 'Inspect unloading auger flighting and gearbox oil level'], { nextDueHours: 3500, completed: 1 }),
                    service('Engine and hydraulic service', 'Service the FPT Cursor engine and hydraulic system after harvest.', 1000, 3000, 'normal', ['Replace engine oil, fuel filters, and hydraulic filters', 'Inspect cooling package and clean chaff screens', 'Take hydraulic oil sample and inspect steering cylinders'], { completed: 3 }),
                ],
            },
            {
                name: 'Fendt 1050 Vario Tractor', serialNumber: 'AGCF1050P0MFA01892', localSerialNumber: 'TRACTOR-02', model: '1050 Vario',
                description: '517 hp high-horsepower tractor for deep tillage and grain cart work', currentEngineHours: 1765, companyId: prairie._id,
                maintenanceSchedule: [service('1000-hour Vario transmission service', 'Replace transmission and hydraulic oil filters and inspect drive train.', 1000, 1000, 'normal', ['Replace Vario transmission oil filter', 'Inspect rear axle and final drive oil levels', 'Run transmission pressure and calibration diagnostics'], { completed: 3 })],
            },
            {
                name: 'John Deere 6220R Tractor', serialNumber: '1L06220RCKH884203', localSerialNumber: 'TRACTOR-03', model: '6220R',
                description: '220 hp utility tractor used for hay rake, baler, spraying, and yard duties', currentEngineHours: 5120, companyId: prairie._id,
                maintenanceSchedule: [service('500-hour fuel and valve service', 'Replace fuel filters and check engine valve clearance.', 500, 5000, 'overdue', ['Replace primary and secondary fuel filters', 'Check engine valve clearance at operating temperature', 'Inspect turbocharger hoses and exhaust manifold', 'Grease front axle and inspect steering linkage'], { nextDueHours: 5500 })],
            },
            {
                name: 'John Deere 569 Premium Round Baler', serialNumber: '1E00569XKKN472115', localSerialNumber: 'BALER-02', model: '569 Premium',
                description: 'Variable-chamber round baler producing 1.2 to 1.8 m hay and straw bales', currentEngineHours: 0, companyId: prairie._id,
                maintenanceSchedule: [service('Hay season pickup and bale chamber inspection', 'Inspect pickup tine bars, belts, chains, bearings, and net wrap system.', 250, 0, 'due_soon', ['Replace bent pickup tines and set pickup height', 'Inspect bale belts for fraying and correct tracking', 'Lubricate chains, bearings, and automatic grease system', 'Test net wrap knife and bale size sensor'], { nextDueHours: 250, completed: 2 })],
            },
            {
                name: 'Brent 2096 Grain Cart', serialNumber: 'BR2096-2022-00564', localSerialNumber: 'GRAIN-CART-01', model: '2096',
                description: '2,100 bushel grain cart with corner auger for combine unloading during harvest', currentEngineHours: 0, companyId: prairie._id,
                maintenanceSchedule: [service('Grain cart auger and gearbox inspection', 'Inspect auger flighting, PTO driveline, gearbox oil, and tarp.', 0, 0, 'normal', ['Check vertical and horizontal auger flighting thickness', 'Inspect PTO shear bolt and driveline shields', 'Check gearbox oil level and wheel hub grease'], { intervalDays: 30, nextDueDate: daysFromNow(20), completed: 3 })],
            },
        ]);

        const prairieParts = await Part.insertMany([
            { name: 'Case IH Combine Rotor Rasp Bar', partNumber: '87339395', tool: prairieEquipment[0]._id, inStock: 16, companyId: prairie._id },
            { name: 'Case IH Clean Grain Elevator Chain', partNumber: '87582918', tool: prairieEquipment[0]._id, inStock: 1, companyId: prairie._id },
            { name: 'Fendt Vario Transmission Filter', partNumber: 'FENDT-H716', tool: prairieEquipment[1]._id, inStock: 3, companyId: prairie._id },
            { name: 'John Deere 6220R Fuel Filter', partNumber: 'RE541922', tool: prairieEquipment[2]._id, inStock: 6, companyId: prairie._id },
            { name: 'John Deere 569 Baler Belt', partNumber: 'AE57479', tool: prairieEquipment[3]._id, inStock: 4, companyId: prairie._id },
            { name: 'Brent Grain Cart PTO Shear Bolt', partNumber: 'BR-2096-SB', tool: prairieEquipment[4]._id, inStock: 20, companyId: prairie._id },
        ]);
        await Maintenance.insertMany([
            { tool: prairieEquipment[0]._id, mechanic: prairieMechanic._id, details: 'Completed post-harvest clean-down and replaced two worn rotor rasp bars. Yield monitor calibration stored for next season.', date: daysAgo(61), companyId: prairie._id },
            { tool: prairieEquipment[3]._id, mechanic: prairieMechanic._id, details: 'Replaced three cracked pickup tines, aligned the belts, and tested the net wrap cycle with an empty chamber.', date: daysAgo(24), companyId: prairie._id },
        ]);
        const prairieFaults = await Fault.insertMany([
            { code: 'COMBINE-021', tool: prairieEquipment[0]._id, operator: prairieOperator._id, description: 'Clean grain elevator slip alarm activates when harvesting high-moisture corn.', engineHours: 3252, status: 'open', companyId: prairie._id },
            { code: 'TRACTOR-011', tool: prairieEquipment[2]._id, operator: prairieOperator._id, description: 'Engine cranks longer than normal after sitting overnight; inspect fuel filter head for air ingress.', engineHours: 5114, status: 'open', companyId: prairie._id },
            { code: 'BALER-009', tool: prairieEquipment[3]._id, operator: prairieOperator._id, description: 'Net wrap occasionally starts late on dense alfalfa windrows.', engineHours: 0, status: 'closed', closingEngineHours: 0, closedAt: daysAgo(12), companyId: prairie._id },
        ]);
        await linkFaults(prairieFaults);

        console.log('Database seeded successfully with agricultural operations data:');
        console.log('  1. Green Valley Forage & Dairy (admin@greenvalleyfarm.com / mechanic@greenvalleyfarm.com / operator@greenvalleyfarm.com | password123)');
        console.log(`     -> ${valleyEquipment.length} equipment items, ${valleyFaults.length} faults, ${valleyParts.length} parts`);
        console.log('  2. Prairie Crest Grain & Hay (admin@prairiecrestfarm.com / mechanic@prairiecrestfarm.com / operator@prairiecrestfarm.com | password123)');
        console.log(`     -> ${prairieEquipment.length} equipment items, ${prairieFaults.length} faults, ${prairieParts.length} parts`);
        void valleyAdmin;
        void prairieAdmin;
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seed();
