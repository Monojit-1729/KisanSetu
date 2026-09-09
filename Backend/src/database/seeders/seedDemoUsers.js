import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../../config/db.js';
import { User, USER_ROLES } from '../../modules/users/index.js';
import { FarmerProfile, farmerService } from '../../modules/farmers/index.js';
import { FpoProfile, fpoService } from '../../modules/fpos/index.js';
import { BuyerProfile, buyerService } from '../../modules/buyers/index.js';
import { Lot } from '../../modules/lots/index.js';
import { MarketPrice } from '../../modules/markets/index.js';
import { Demand } from '../../modules/demand/index.js';
import { Offer } from '../../modules/offers/index.js';
import { Order } from '../../modules/orders/index.js';
import { logisticsService } from '../../modules/logistics/index.js';
import { paymentService } from '../../modules/payments/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded when running script directly
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const DEMO_USERS = [
  {
    name: 'Ramesh Patel (Farmer)',
    email: 'farmer@kisansetu.in',
    password: 'Farmer@123',
    role: USER_ROLES.FARMER,
    phone: '+91 98230 11223',
    isVerified: true,
  },
  {
    name: 'Sahyadri Agro FPO Lead',
    email: 'fpo@kisansetu.in',
    password: 'Fpo@123',
    role: USER_ROLES.FPO,
    phone: '+91 98220 44556',
    isVerified: true,
  },
  {
    name: 'FreshDirect Buyer Procurement',
    email: 'buyer@kisansetu.in',
    password: 'Buyer@123',
    role: USER_ROLES.BUYER,
    phone: '+91 98210 77889',
    isVerified: true,
  },
  {
    name: 'Metro Wholesale Foods',
    email: 'metro_buyer@kisansetu.in',
    password: 'Buyer@123',
    role: USER_ROLES.BUYER,
    phone: '+91 98210 33445',
    isVerified: true,
  },
  {
    name: 'Godrej Agrovet Procurement',
    email: 'godrej_buyer@kisansetu.in',
    password: 'Buyer@123',
    role: USER_ROLES.BUYER,
    phone: '+91 98210 55667',
    isVerified: true,
  },
  {
    name: 'KisanSetu Admin Console',
    email: 'admin@kisansetu.in',
    password: 'Admin@123',
    role: USER_ROLES.ADMIN,
    phone: '+91 98000 00001',
    isVerified: true,
  },
];

export const seedDemoUsers = async ({ reset = false } = {}) => {
  console.log('[KisanSetu Seeder] Connecting to database...');
  await connectDB();

  console.log('[KisanSetu Seeder] Seeding deterministic demo accounts...');

  const userMap = {};

  for (const demoUser of DEMO_USERS) {
    let user = await User.findOne({ email: demoUser.email }).select('+password');
    if (!user) {
      user = await User.create(demoUser);
      console.log(`  + Created demo account: [${demoUser.role.toUpperCase()}] ${demoUser.email} (Password: ${demoUser.password})`);
    } else {
      const isPasswordValid = await user.comparePassword(demoUser.password);
      if (!isPasswordValid || user.role !== demoUser.role || !user.isVerified) {
        user.password = demoUser.password;
        user.role = demoUser.role;
        user.isVerified = true;
        await user.save();
        console.log(`  ~ Updated demo account credentials: [${demoUser.role.toUpperCase()}] ${demoUser.email}`);
      } else {
        console.log(`  - Demo account already exists and verified: [${demoUser.role.toUpperCase()}] ${demoUser.email}`);
      }
    }
    userMap[demoUser.role] = user;
  }

  // Seed Demo Farmer Profile
  if (userMap.farmer) {
    const existingFarmerProfile = await FarmerProfile.findOne({ user: userMap.farmer._id });
    if (!existingFarmerProfile || reset) {
      await farmerService.upsertProfile(userMap.farmer._id, {
        fullName: 'Ramesh Patel',
        phone: '+91 98230 11223',
        location: {
          state: 'Maharashtra',
          district: 'Nashik',
          taluka: 'Dindori',
          village: 'Janori',
          pincode: '422206',
        },
        preferredLanguage: 'mr',
        cropInterests: ['Onion', 'Soybean', 'Tomato', 'Grapes'],
        farmInfo: {
          totalLandAcres: 4.5,
          soilType: 'Black Cotton Loam',
          irrigationSource: 'Drip & Borewell',
        },
        fpoAffiliation: {
          isMember: true,
          fpoName: 'Sahyadri Agro FPC',
        },
      });
      console.log('  + Seeded Farmer profile for Ramesh Patel (Nashik, Maharashtra)');
    } else {
      console.log('  - Farmer profile already exists');
    }
  }

  // Seed Demo FPO Profile
  if (userMap.fpo) {
    const existingFpoProfile = await FpoProfile.findOne({ user: userMap.fpo._id });
    if (!existingFpoProfile || reset) {
      await fpoService.upsertProfile(userMap.fpo._id, {
        fpoName: 'Sahyadri Farmer Producer Company Ltd.',
        registrationNumber: 'FPO-MH-2022-9941',
        location: {
          state: 'Maharashtra',
          district: 'Nashik',
          officeAddress: 'Agro Hub Center, Mohadi Road, Nashik',
          pincode: '422003',
        },
        contactInfo: {
          contactPerson: 'Vilas Shinde (FPO Director)',
          contactPhone: '+91 98220 44556',
          contactEmail: 'fpo@kisansetu.in',
        },
        memberCount: 1250,
        majorCrops: ['Onion', 'Tomato', 'Grapes', 'Pomegranate', 'Soybean'],
        description: 'Aggregating smallholder farmers across Nashik district for direct collective selling and post-harvest grading.',
        isVerified: true,
      });
      console.log('  + Seeded FPO profile for Sahyadri Agro FPC');
    } else {
      console.log('  - FPO profile already exists');
    }
  }

  // Seed Demo Buyer Profiles
  const buyersData = [
    {
      email: 'buyer@kisansetu.in',
      profile: {
        businessName: 'FreshDirect Retail Procurement Ltd.',
        buyerType: 'wholesaler',
        location: {
          state: 'Maharashtra',
          district: 'Pune',
          facilityAddress: 'Hub 14, APMC Market Yard Complex, Gultekdi, Pune',
          pincode: '411037',
        },
        contactInfo: {
          contactPerson: 'Anand Verma (Procurement Lead)',
          contactPhone: '+91 98210 77889',
          contactEmail: 'buyer@kisansetu.in',
        },
        interestedCrops: ['Onion', 'Tomato', 'Potato', 'Green Chilli'],
        description: 'Large-scale fresh produce distributor supplying 120+ retail grocery stores across Western Maharashtra.',
        isVerified: true,
      },
    },
    {
      email: 'metro_buyer@kisansetu.in',
      profile: {
        businessName: 'Metro Wholesale Cash & Carry',
        buyerType: 'wholesaler',
        location: {
          state: 'Maharashtra',
          district: 'Pune',
          facilityAddress: 'Metro Distribution Center, Wagholi, Pune',
          pincode: '412207',
        },
        contactInfo: {
          contactPerson: 'Sunil Deshmukh (Sourcing Manager)',
          contactPhone: '+91 98210 33445',
          contactEmail: 'metro_buyer@kisansetu.in',
        },
        interestedCrops: ['Wheat', 'Soybean', 'Onion', 'Pomegranate'],
        description: 'B2B institutional wholesaler serving 500+ commercial caterers, hotels, and retail merchants.',
        isVerified: true,
      },
    },
    {
      email: 'godrej_buyer@kisansetu.in',
      profile: {
        businessName: 'Godrej Agrovet Processing Division',
        buyerType: 'processor',
        location: {
          state: 'Maharashtra',
          district: 'Nashik',
          facilityAddress: 'MIDC Agro Food Park, Malegaon, Nashik',
          pincode: '423105',
        },
        contactInfo: {
          contactPerson: 'Pooja Kulkarni (Agri Procurement)',
          contactPhone: '+91 98210 55667',
          contactEmail: 'godrej_buyer@kisansetu.in',
        },
        interestedCrops: ['Soybean', 'Maize', 'Wheat'],
        description: 'Food and agro-processing plant producing packaged oil and cattle feed products with high quality compliance.',
        isVerified: true,
      },
    },
  ];

  for (const b of buyersData) {
    const user = await User.findOne({ email: b.email });
    if (user) {
      const existing = await BuyerProfile.findOne({ user: user._id });
      if (!existing || reset) {
        await buyerService.upsertProfile(user._id, b.profile);
        console.log(`  + Seeded Buyer profile for ${b.profile.businessName}`);
      } else {
        console.log(`  - Buyer profile for ${b.profile.businessName} already exists`);
      }
    }
  }

  console.log('[KisanSetu Seeder] Demo accounts and profiles verification complete.');
};

// ---------------------------------------------------------------------------
// Market Price Seeder
// ---------------------------------------------------------------------------

const CROPS_DATA = [
  { name: 'Onion',       base: 2200, spread: 600 },
  { name: 'Tomato',      base: 1400, spread: 800 },
  { name: 'Soybean',     base: 4800, spread: 400 },
  { name: 'Grapes',      base: 6500, spread: 1200 },
  { name: 'Pomegranate', base: 8000, spread: 2000 },
  { name: 'Wheat',       base: 2100, spread: 200 },
  { name: 'Cotton',      base: 6200, spread: 800 },
];

const MANDIS = [
  { district: 'Nashik',     mandiName: 'Nashik APMC Yard' },
  { district: 'Pune',       mandiName: 'Gultekdi Market Yard' },
  { district: 'Solapur',    mandiName: 'Solapur APMC Main' },
  { district: 'Aurangabad', mandiName: 'Aurangabad APMC' },
  { district: 'Kolhapur',   mandiName: 'Kolhapur Market Yard' },
];

export const seedMarketPrices = async ({ days = 30 } = {}) => {
  console.log('[KisanSetu Seeder] Seeding APMC market price data...');
  let created = 0;
  let skipped = 0;

  for (let d = days - 1; d >= 0; d--) {
    const arrivalDate = new Date();
    arrivalDate.setDate(arrivalDate.getDate() - d);
    arrivalDate.setHours(0, 0, 0, 0);

    for (const mandi of MANDIS) {
      for (const crop of CROPS_DATA) {
        // Deterministic daily variance using day index and crop name length
        const variance = ((d * 7 + crop.name.length * 13) % crop.spread);
        const modalPrice = Math.round(crop.base + variance - crop.spread / 2);
        const minPrice = Math.round(modalPrice * 0.88);
        const maxPrice = Math.round(modalPrice * 1.12);

        try {
          await MarketPrice.create({
            cropName: crop.name,
            district: mandi.district,
            state: 'Maharashtra',
            mandiName: mandi.mandiName,
            minPrice,
            maxPrice,
            modalPrice,
            arrivalDate,
            unit: 'quintal',
            arrivalQuantity: Math.round(50 + Math.random() * 450),
          });
          created++;
        } catch (err) {
          if (err.code === 11000) {
            skipped++; // Duplicate key — idempotent skip
          } else {
            throw err;
          }
        }
      }
    }
  }

  console.log(`  + Market prices: ${created} created, ${skipped} already existed`);
};

// ---------------------------------------------------------------------------
// Demo Lots Seeder
// ---------------------------------------------------------------------------

export const seedDemoLots = async (userMap) => {
  console.log('[KisanSetu Seeder] Seeding demo produce lots...');

  const farmerUser = userMap?.farmer;
  const fpoUser = userMap?.fpo;

  const demoLots = [
    {
      owner: farmerUser?._id,
      ownerRole: 'farmer',
      cropName: 'Onion',
      variety: 'Red Nasik',
      quantity: 40,
      unit: 'quintal',
      pricePerQuintal: 2400,
      quality: 'A',
      qualityStatus: 'verified',
      qualityNotes: 'Verified Grade A by Sahyadri Agro Quality Cell. Uniform medium-large bulb size, dry outer skin.',
      qualityRef: 'QC-NSK-2026-041',
      harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      location: { state: 'Maharashtra', district: 'Nashik', taluka: 'Dindori', village: 'Janori', pincode: '422206' },
      status: 'active',
      description: 'Fresh Red Nasik variety onions, hand-graded, dry outer skin. Direct from farm at Dindori taluka.',
    },
    {
      owner: farmerUser?._id,
      ownerRole: 'farmer',
      cropName: 'Tomato',
      variety: 'Hybrid F1',
      quantity: 20,
      unit: 'quintal',
      pricePerQuintal: 1600,
      quality: 'B',
      qualityStatus: 'declared',
      qualityNotes: 'Farmer self-declared Grade B harvest. Firm texture, fresh pick for wholesale distribution.',
      qualityRef: '',
      harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      location: { state: 'Maharashtra', district: 'Nashik', taluka: 'Dindori', village: 'Janori', pincode: '422206' },
      status: 'active',
      description: 'Hybrid tomatoes, firm texture, suitable for wholesale.',
    },
    {
      owner: fpoUser?._id,
      ownerRole: 'fpo',
      cropName: 'Grapes',
      variety: 'Thompson Seedless',
      quantity: 150,
      unit: 'quintal',
      pricePerQuintal: 7200,
      quality: 'A',
      qualityStatus: 'verified',
      qualityNotes: 'Cold-chain sorted and certified residue-free for domestic supermarket wholesale.',
      qualityRef: 'APEDA-QC-2026-992',
      harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      location: { state: 'Maharashtra', district: 'Nashik', taluka: 'Niphad', village: 'Vadner', pincode: '422303' },
      status: 'active',
      description: 'Aggregated lot from 35 member farmers. Thompson Seedless, export-grade, pre-cooled at FPO warehouse.',
    },
    {
      owner: fpoUser?._id,
      ownerRole: 'fpo',
      cropName: 'Soybean',
      variety: 'JS 335',
      quantity: 250,
      unit: 'quintal',
      pricePerQuintal: 4900,
      quality: 'B',
      qualityStatus: 'verified',
      qualityNotes: 'Standard FCI milling grade, moisture 8.5%, foreign matter <2%.',
      qualityRef: 'FCI-NIP-2026-108',
      harvestDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      location: { state: 'Maharashtra', district: 'Nashik', taluka: 'Sinnar', village: 'Sinnar', pincode: '422103' },
      status: 'active',
      description: 'Collective soybean lot, 8% moisture content, standard FCI grading.',
    },
    {
      owner: farmerUser?._id,
      ownerRole: 'farmer',
      cropName: 'Pomegranate',
      variety: 'Bhagwa',
      quantity: 15,
      unit: 'quintal',
      pricePerQuintal: 9500,
      quality: 'A',
      qualityStatus: 'declared',
      qualityNotes: 'Hand-picked Bhagwa variety, >350g fruit weight, blemish-free.',
      qualityRef: '',
      harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      location: { state: 'Maharashtra', district: 'Nashik', taluka: 'Dindori', village: 'Janori', pincode: '422206' },
      status: 'draft',
      description: 'Premium Bhagwa pomegranates, 300-400g per fruit, no blemishes. Ready for export packaging.',
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const lotData of demoLots) {
    if (!lotData.owner) {
      skipped++;
      continue;
    }
    const existing = await Lot.findOne({
      owner: lotData.owner,
      cropName: lotData.cropName,
      variety: lotData.variety,
    });
    if (existing) {
      if (!existing.qualityStatus || existing.qualityStatus === 'declared') {
        existing.qualityStatus = lotData.qualityStatus;
        existing.qualityNotes = lotData.qualityNotes;
        existing.qualityRef = lotData.qualityRef;
        await existing.save();
      }
      skipped++;
    } else {
      await Lot.create(lotData);
      created++;
    }
  }

  console.log(`  + Demo lots: ${created} created, ${skipped} already existed`);
};

export const seedDemoDemands = async () => {
  console.log('[KisanSetu Seeder] Seeding deterministic demo buyer demands...');

  const freshDirect = await User.findOne({ email: 'buyer@kisansetu.in' });
  const metroBuyer = await User.findOne({ email: 'metro_buyer@kisansetu.in' });
  const godrejBuyer = await User.findOne({ email: 'godrej_buyer@kisansetu.in' });

  const demoDemands = [
    {
      demandId: 'DEM-FD-ONION1',
      buyer: freshDirect?._id,
      cropName: 'Onion',
      variety: 'Garva',
      quantity: 30,
      unit: 'quintal',
      quality: 'B',
      deliveryLocation: {
        state: 'Maharashtra',
        district: 'Nashik',
        taluka: 'Sinnar',
        village: 'Sinnar',
        pincode: '422103',
        deliveryAddress: 'FreshDirect Sourcing Depot, Sinnar-Shirdi Highway',
      },
      deliveryWindow: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 10 * 86400000),
      },
      targetPrice: 1500,
      status: 'active',
      description: 'Procuring 30 quintals of Grade B or better Garva onions for direct supermarket distribution.',
    },
    {
      demandId: 'DEM-FD-TOMATO1',
      buyer: freshDirect?._id,
      cropName: 'Tomato',
      variety: 'Abhinav',
      quantity: 20,
      unit: 'quintal',
      quality: 'B',
      deliveryLocation: {
        state: 'Maharashtra',
        district: 'Nashik',
        taluka: 'Dindori',
        village: 'Dindori',
        pincode: '422202',
        deliveryAddress: 'Dindori Cold Sorting Hub',
      },
      deliveryWindow: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 86400000),
      },
      targetPrice: 1150,
      status: 'active',
      description: 'Direct farm sourcing for Abhinav fresh table tomatoes.',
    },
    {
      demandId: 'DEM-FD-TOMATO2',
      buyer: freshDirect?._id,
      cropName: 'Tomato',
      variety: '',
      quantity: 100,
      unit: 'quintal',
      quality: 'A',
      deliveryLocation: {
        state: 'Maharashtra',
        district: 'Pune',
        taluka: 'Haveli',
        village: 'Gultekdi',
        pincode: '411037',
        deliveryAddress: 'Gultekdi APMC Buyer Stall 14',
      },
      deliveryWindow: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 86400000),
      },
      targetPrice: 1200,
      status: 'active',
      description: 'Bulk Grade A table tomatoes required for retail network.',
    },
    {
      demandId: 'DEM-MW-WHEAT1',
      buyer: metroBuyer?._id,
      cropName: 'Wheat',
      variety: 'GW 496',
      quantity: 50,
      unit: 'quintal',
      quality: 'B',
      deliveryLocation: {
        state: 'Maharashtra',
        district: 'Pune',
        taluka: 'Haveli',
        village: 'Wagholi',
        pincode: '412207',
        deliveryAddress: 'Metro Distribution Center, Wagholi',
      },
      deliveryWindow: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 86400000),
      },
      targetPrice: 2250,
      status: 'active',
      description: 'Institutional milling grade wheat for wholesale distribution.',
    },
    {
      demandId: 'DEM-MW-COTTON1',
      buyer: metroBuyer?._id,
      cropName: 'Cotton',
      variety: '',
      quantity: 50,
      unit: 'quintal',
      quality: 'A',
      deliveryLocation: {
        state: 'Maharashtra',
        district: 'Aurangabad',
        taluka: 'Aurangabad',
        village: 'Waluj',
        pincode: '431005',
        deliveryAddress: 'Aurangabad Textile Depot',
      },
      deliveryWindow: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 86400000),
      },
      targetPrice: 6500,
      status: 'active',
      description: 'Long staple cotton procurement for spinning mills.',
    },
    {
      demandId: 'DEM-GA-SOY1',
      buyer: godrejBuyer?._id,
      cropName: 'Soybean',
      variety: 'JS 335',
      quantity: 300,
      unit: 'quintal',
      quality: 'B',
      deliveryLocation: {
        state: 'Maharashtra',
        district: 'Nashik',
        taluka: 'Malegaon',
        village: 'Malegaon',
        pincode: '423105',
        deliveryAddress: 'MIDC Food Park, Malegaon',
      },
      deliveryWindow: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 20 * 86400000),
      },
      targetPrice: 5000,
      status: 'active',
      description: 'High-oil content soybean for processing plant.',
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const d of demoDemands) {
    if (!d.buyer) {
      skipped++;
      continue;
    }
    const existing = await Demand.findOne({ demandId: d.demandId });
    if (existing) {
      skipped++;
    } else {
      await Demand.create(d);
      created++;
    }
  }

  console.log(`  + Demo demands: ${created} created, ${skipped} already existed`);
};

export const seedOperationsData = async () => {
  console.log('[KisanSetu Seeder] Ensuring baseline transaction and operations records...');

  // 1. Ensure baseline demo offer and completed order exist
  const baselineOrderId = 'ORD-DEMO-2026-001';
  let baselineOrder = await Order.findOne({ orderId: baselineOrderId });

  if (!baselineOrder) {
    const farmerUser = await User.findOne({ email: 'farmer@kisansetu.in' });
    const buyerUser = await User.findOne({ email: 'buyer@kisansetu.in' });
    const onionLot = await Lot.findOne({ owner: farmerUser?._id, cropName: 'Onion' });

    if (farmerUser && buyerUser && onionLot) {
      const offerId = 'OFF-DEMO-2026-001';
      let demoOffer = await Offer.findOne({ offerId });
      if (!demoOffer) {
        demoOffer = await Offer.create({
          offerId,
          lot: onionLot._id,
          buyer: buyerUser._id,
          seller: farmerUser._id,
          cropName: onionLot.cropName,
          quantity: 20,
          unit: onionLot.unit || 'quintal',
          offeredPricePerUnit: 2400,
          totalOfferedValue: 48000,
          deliveryLocation: {
            state: 'Maharashtra',
            district: 'Pune',
            address: 'Gultekdi Market Yard, Pune',
            pincode: '411037',
          },
          status: 'accepted',
          lastActionBy: buyerUser._id,
          lastActionRole: 'buyer',
          history: [
            {
              action: 'created',
              by: buyerUser._id,
              byRole: 'buyer',
              byName: 'FreshDirect Buyer Procurement',
              price: 2300,
              quantity: 20,
              totalValue: 46000,
              message: 'Initial procurement offer for Red Nasik onions',
              timestamp: new Date(Date.now() - 3 * 86400000),
            },
            {
              action: 'countered',
              by: farmerUser._id,
              byRole: 'farmer',
              byName: 'Ramesh Patel',
              price: 2400,
              quantity: 20,
              totalValue: 48000,
              message: 'Grade A verified onions, countered to ₹2400/q',
              timestamp: new Date(Date.now() - 2 * 86400000),
            },
            {
              action: 'accepted',
              by: buyerUser._id,
              byRole: 'buyer',
              byName: 'FreshDirect Buyer Procurement',
              price: 2400,
              quantity: 20,
              totalValue: 48000,
              message: 'Counter-offer accepted. Generating dispatch order.',
              timestamp: new Date(Date.now() - 1 * 86400000),
            },
          ],
        });
        console.log('  + Seeded baseline demo offer OFF-DEMO-2026-001');
      }

      baselineOrder = await Order.create({
        orderId: baselineOrderId,
        lot: onionLot._id,
        buyer: buyerUser._id,
        seller: farmerUser._id,
        acceptedOffer: demoOffer._id,
        cropName: onionLot.cropName,
        variety: onionLot.variety || 'Red Nasik',
        grade: onionLot.quality || 'A',
        qualityStatus: onionLot.qualityStatus || 'verified',
        qualityNotes: onionLot.qualityNotes || 'Verified Grade A by Sahyadri Agro Quality Cell.',
        qualityRef: onionLot.qualityRef || 'QC-NSK-2026-041',
        quantity: 20,
        unit: onionLot.unit || 'quintal',
        agreedPricePerUnit: 2400,
        totalValue: 48000,
        orderStatus: 'completed',
        timeline: [
          {
            status: 'confirmed',
            updatedBy: buyerUser._id,
            note: 'Order confirmed upon acceptance of offer OFF-DEMO-2026-001',
            timestamp: new Date(Date.now() - 2 * 86400000),
          },
          {
            status: 'logistics_scheduled',
            updatedBy: farmerUser._id,
            note: 'Dispatch carrier assigned',
            timestamp: new Date(Date.now() - 36 * 3600000),
          },
          {
            status: 'picked_up',
            updatedBy: farmerUser._id,
            note: 'Consignment picked up from Janori farm depot',
            timestamp: new Date(Date.now() - 24 * 3600000),
          },
          {
            status: 'in_transit',
            updatedBy: farmerUser._id,
            note: 'Vehicle in transit on Nashik-Pune expressway',
            timestamp: new Date(Date.now() - 18 * 3600000),
          },
          {
            status: 'delivered',
            updatedBy: buyerUser._id,
            note: 'Consignment received and weighed at Pune depot',
            timestamp: new Date(Date.now() - 12 * 3600000),
          },
          {
            status: 'completed',
            updatedBy: buyerUser._id,
            note: 'Settlement confirmed, transaction closed',
            timestamp: new Date(Date.now() - 6 * 3600000),
          },
        ],
      });
      console.log('  + Seeded baseline completed demo order ORD-DEMO-2026-001');
    }
  }

  // 2. Ensure logistics & payment records for all orders
  const orders = await Order.find({});
  let initializedCount = 0;

  for (const order of orders) {
    let changed = false;
    if (!order.logistics) {
      try {
        const logDoc = await logisticsService.createForOrder(order, order.seller);
        if (order.orderStatus === 'completed') {
          logDoc.status = 'delivered';
          logDoc.actualDeliveryDate = new Date();
          await logDoc.save();
        }
        order.logistics = logDoc._id;
        changed = true;
      } catch (err) {
        console.warn('  - Skipped logistics init for order', order.orderId, err.message);
      }
    }
    if (!order.payment) {
      try {
        const payDoc = await paymentService.createForOrder(order, order.buyer);
        if (order.orderStatus === 'completed') {
          payDoc.status = 'completed';
          payDoc.paymentMethod = 'bank_transfer';
          payDoc.transactionRef = 'NEFT-SIM-20260908-7712';
          payDoc.paidAt = new Date();
          await payDoc.save();
        }
        order.payment = payDoc._id;
        changed = true;
      } catch (err) {
        console.warn('  - Skipped payment init for order', order.orderId, err.message);
      }
    }
    if (changed) {
      await order.save();
      initializedCount++;
    }
  }

  console.log(`  + Operations data: ${initializedCount} orders initialized with logistics/payments`);
};


// If run directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const isReset = process.argv.includes('--reset');

  (async () => {
    try {
      // seedDemoUsers connects to DB internally
      await seedDemoUsers({ reset: isReset });

      // Seed market prices (DB already connected)
      await seedMarketPrices({ days: 30 });

      // Fetch fresh user map for lot seeding (users created above)
      const freshMap = {};
      for (const du of DEMO_USERS) {
        const u = await User.findOne({ email: du.email });
        if (u) freshMap[du.role] = u;
      }
      await seedDemoLots(freshMap);

      // Seed demo demands
      await seedDemoDemands();

      // Seed operations data for orders
      await seedOperationsData();

      console.log('[KisanSetu Seeder] All seeding complete.');
      mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('[KisanSetu Seeder] Error:', err);
      process.exit(1);
    }
  })();
}
