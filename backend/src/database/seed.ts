import bcrypt from 'bcryptjs';
import { generateDealerId, generateSKU } from '../utils/helpers';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  console.log('Creating categories...');
  const passengerCategory = await prisma.category.upsert({
    where: { slug: 'passenger-tires' },
    update: {},
    create: {
      name: 'Passenger Tires',
      slug: 'passenger-tires',
      description: 'Comfort, safety, and fuel efficiency for everyday driving',
      isActive: true,
      sortOrder: 1,
    },
  });

  const performanceCategory = await prisma.category.upsert({
    where: { slug: 'performance-tires' },
    update: {},
    create: {
      name: 'Performance Tires',
      slug: 'performance-tires',
      description: 'High-speed stability and precision handling for sports cars',
      isActive: true,
      sortOrder: 2,
    },
  });

  const truckCategory = await prisma.category.upsert({
    where: { slug: 'truck-bus-tires' },
    update: {},
    create: {
      name: 'Truck & Bus Tires',
      slug: 'truck-bus-tires',
      description: 'Heavy-duty reliability for commercial vehicles',
      isActive: true,
      sortOrder: 3,
    },
  });

  const offroadCategory = await prisma.category.upsert({
    where: { slug: 'off-road-tires' },
    update: {},
    create: {
      name: 'Off-Road Tires',
      slug: 'off-road-tires',
      description: 'Maximum traction for challenging terrains',
      isActive: true,
      sortOrder: 4,
    },
  });

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@arisegenius.com' },
    update: {},
    create: {
      email: 'admin@arisegenius.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  // Create sample dealer
  console.log('Creating sample dealer...');
  const dealerPassword = await bcrypt.hash('dealer123', 12);
  const dealerUser = await prisma.user.upsert({
    where: { email: 'dealer@abctire.com' },
    update: {},
    create: {
      email: 'dealer@abctire.com',
      password: dealerPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+234-xxx-xxxx',
      role: 'DEALER',
      isActive: true,
      emailVerified: true,
    },
  });

  const dealerId = await generateDealerId();
  const dealerProfile = await prisma.dealerProfile.upsert({
    where: { dealerId },
    update: {},
    create: {
      userId: dealerUser.id,
      dealerId,
      companyName: 'ABC Tire Company',
      contactPerson: 'Jane Smith',
      businessLicense: 'BL123456',
      taxId: 'TAX123456',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      city: 'Lagos',
      address: '123 Main Street, Victoria Island',
      phone: '+234-xxx-xxxx',
      website: 'https://abctire.com',
      yearsInBusiness: 5,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: adminUser.id,
      commissionRate: 0.1,
      creditLimit: 100000,
      currentBalance: 0,
    },
  });

  // Create sample customer
  console.log('Creating sample customer...');
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+234-xxx-xxxx',
      role: 'CUSTOMER',
      isActive: true,
      emailVerified: true,
    },
  });

  // Create sample products
  console.log('Creating sample products...');
  
  const products = [
    {
      name: 'Arisegenius Comfort Pro',
      description: 'Premium passenger tire offering exceptional comfort, safety, and fuel efficiency for everyday driving. Features advanced tread design for superior wet and dry traction.',
      shortDescription: 'Comfort, safety, and fuel efficiency for everyday driving',
      brand: 'Arisegenius',
      model: 'Comfort Pro',
      size: '205/55R16',
      width: 205,
      profile: 55,
      rimSize: 16,
      loadIndex: 91,
      speedRating: 'H',
      season: 'ALL_SEASON',
      type: 'PASSENGER',
      price: 120.00,
      costPrice: 80.00,
      stock: 100,
      minStock: 10,
      weight: 22.5,
      features: ['All-season traction', 'Fuel efficient', '50,000 mile warranty', 'Quiet ride comfort'],
      images: ['comfort-pro-1.jpg', 'comfort-pro-2.jpg'],
      isActive: true,
      isFeatured: true,
      categoryId: passengerCategory.id,
    },
    {
      name: 'Arisegenius Sport Max',
      description: 'High-performance tire designed for sports cars and performance vehicles. Delivers exceptional handling, grip, and stability at high speeds.',
      shortDescription: 'High-speed stability and precision handling for sports cars',
      brand: 'Arisegenius',
      model: 'Sport Max',
      size: '225/45R17',
      width: 225,
      profile: 45,
      rimSize: 17,
      loadIndex: 94,
      speedRating: 'Y',
      season: 'SUMMER',
      type: 'PERFORMANCE',
      price: 180.00,
      costPrice: 120.00,
      stock: 50,
      minStock: 5,
      weight: 24.0,
      features: ['High-speed stability', 'Precision handling', 'Sport performance', 'Enhanced grip'],
      images: ['sport-max-1.jpg', 'sport-max-2.jpg'],
      isActive: true,
      isFeatured: true,
      categoryId: performanceCategory.id,
    },
    {
      name: 'Arisegenius Heavy Duty',
      description: 'Commercial-grade tire built for heavy-duty applications. Designed for trucks, buses, and commercial vehicles with exceptional load capacity and durability.',
      shortDescription: 'Heavy-duty reliability for commercial vehicles',
      brand: 'Arisegenius',
      model: 'Heavy Duty',
      size: '275/70R18',
      width: 275,
      profile: 70,
      rimSize: 18,
      loadIndex: 125,
      speedRating: 'L',
      season: 'ALL_SEASON',
      type: 'TRUCK',
      price: 250.00,
      costPrice: 180.00,
      stock: 75,
      minStock: 10,
      weight: 45.0,
      features: ['Heavy load capacity', 'Long-lasting tread', 'Commercial grade', 'Fleet optimized'],
      images: ['heavy-duty-1.jpg', 'heavy-duty-2.jpg'],
      isActive: true,
      isFeatured: false,
      categoryId: truckCategory.id,
    },
    {
      name: 'Arisegenius Off-Road Master',
      description: 'Aggressive off-road tire designed for challenging terrains. Features deep tread patterns and reinforced sidewalls for maximum traction and durability.',
      shortDescription: 'Maximum traction for challenging terrains',
      brand: 'Arisegenius',
      model: 'Off-Road Master',
      size: '265/75R16',
      width: 265,
      profile: 75,
      rimSize: 16,
      loadIndex: 112,
      speedRating: 'Q',
      season: 'ALL_SEASON',
      type: 'OFF_ROAD',
      price: 200.00,
      costPrice: 140.00,
      stock: 60,
      minStock: 8,
      weight: 38.0,
      features: ['Mud terrain design', 'Rock crawling capability', 'All-terrain performance', 'Reinforced sidewalls'],
      images: ['offroad-master-1.jpg', 'offroad-master-2.jpg'],
      isActive: true,
      isFeatured: true,
      categoryId: offroadCategory.id,
    },
  ];

  for (const productData of products) {
    const sku = await generateSKU(productData.brand, productData.model, productData.size);
    
    await prisma.product.upsert({
      where: { sku },
      update: {},
      create: {
        ...productData,
        sku,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
        specifications: {
          loadIndex: productData.loadIndex,
          speedRating: productData.speedRating,
          season: productData.season,
          type: productData.type,
        },
        dimensions: {
          width: productData.width,
          profile: productData.profile,
          rimSize: productData.rimSize,
        },
        metaTitle: `${productData.name} - ${productData.brand} Tires`,
        metaDescription: productData.shortDescription,
        metaKeywords: [productData.brand, productData.model, productData.season, productData.type],
      },
    });
  }

  // Create sample pages
  console.log('Creating sample pages...');
  
  const pages = [
    {
      title: 'About Us',
      slug: 'about-us',
      content: `
        <h1>About Arisegenius</h1>
        <p>Arisegenius is Africa's leading tire manufacturer, committed to delivering innovative, safe, and durable tire solutions for the African market and beyond.</p>
        <p>With over a decade of experience in tire manufacturing, we have established ourselves as a trusted partner for both individual customers and commercial fleets across Africa.</p>
        <h2>Our Mission</h2>
        <p>To provide world-class tire solutions that meet the unique challenges of African roads while maintaining the highest standards of quality, safety, and innovation.</p>
        <h2>Our Vision</h2>
        <p>To be the leading tire manufacturer in Africa, recognized globally for our innovation, quality, and commitment to sustainable manufacturing practices.</p>
      `,
      excerpt: 'Learn about Arisegenius, Africa\'s leading tire manufacturer committed to innovation and quality.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      metaTitle: 'About Arisegenius - Leading African Tire Manufacturer',
      metaDescription: 'Learn about Arisegenius, Africa\'s leading tire manufacturer committed to innovation, safety, and quality.',
      metaKeywords: ['about', 'arisegenius', 'tire manufacturer', 'africa'],
    },
    {
      title: 'Contact Us',
      slug: 'contact-us',
      content: `
        <h1>Contact Arisegenius</h1>
        <p>Get in touch with our team for any inquiries, support, or business opportunities.</p>
        <h2>Headquarters</h2>
        <p><strong>Address:</strong> 123 Innovation Drive, Lagos, Nigeria</p>
        <p><strong>Phone:</strong> +234-xxx-xxxx</p>
        <p><strong>Email:</strong> info@arisegenius.com</p>
        <h2>Business Hours</h2>
        <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
        <p>Saturday: 9:00 AM - 4:00 PM</p>
        <p>Sunday: Closed</p>
        <h2>Customer Support</h2>
        <p>For customer support, please email us at support@arisegenius.com or call our support line.</p>
      `,
      excerpt: 'Contact Arisegenius for inquiries, support, or business opportunities.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      metaTitle: 'Contact Arisegenius - Get in Touch',
      metaDescription: 'Contact Arisegenius for inquiries, support, or business opportunities. Find our contact information and business hours.',
      metaKeywords: ['contact', 'arisegenius', 'support', 'inquiry'],
    },
  ];

  for (const pageData of pages) {
    await prisma.page.upsert({
      where: { slug: pageData.slug },
      update: {},
      create: pageData,
    });
  }

  // Create sample blog posts
  console.log('Creating sample blog posts...');
  
  const blogPosts = [
    {
      title: 'The Future of Tire Technology in Africa',
      slug: 'future-tire-technology-africa',
      content: `
        <h1>The Future of Tire Technology in Africa</h1>
        <p>As Africa continues to develop its infrastructure and automotive industry, tire technology is evolving to meet the unique challenges of the continent.</p>
        <h2>Smart Tires</h2>
        <p>Smart tire technology is becoming increasingly important, with sensors that can monitor tire pressure, temperature, and wear in real-time.</p>
        <h2>Sustainable Manufacturing</h2>
        <p>Environmental consciousness is driving innovation in tire manufacturing, with a focus on sustainable materials and processes.</p>
        <h2>Adaptation to African Roads</h2>
        <p>Tire manufacturers are developing specialized compounds and tread patterns designed specifically for African road conditions.</p>
      `,
      excerpt: "Exploring the latest innovations in tire technology and how they're being adapted for the African market.",
      status: 'PUBLISHED',
      authorId: adminUser.id,
      publishedAt: new Date(),
      views: 150,
      metaTitle: 'The Future of Tire Technology in Africa - Arisegenius Blog',
      metaDescription: 'Exploring the latest innovations in tire technology and how they\'re being adapted for the African market.',
      metaKeywords: ['tire technology', 'africa', 'innovation', 'smart tires'],
    },
    {
      title: 'Choosing the Right Tires for Your Vehicle',
      slug: 'choosing-right-tires-vehicle',
      content: `
        <h1>Choosing the Right Tires for Your Vehicle</h1>
        <p>Selecting the right tires for your vehicle is crucial for safety, performance, and longevity. Here's a comprehensive guide to help you make the right choice.</p>
        <h2>Understanding Tire Sizes</h2>
        <p>Tire sizes are indicated by a series of numbers and letters on the sidewall. Understanding these markings is essential for proper tire selection.</p>
        <h2>Seasonal Considerations</h2>
        <p>Different tire types are designed for different seasons and driving conditions. Consider your local climate and driving patterns.</p>
        <h2>Performance vs. Comfort</h2>
        <p>Balance your need for performance with comfort requirements. High-performance tires offer better handling but may sacrifice ride comfort.</p>
      `,
      excerpt: "A comprehensive guide to choosing the right tires for your vehicle, covering size, season, and performance considerations.",
      status: 'PUBLISHED',
      authorId: adminUser.id,
      publishedAt: new Date(),
      views: 89,
      metaTitle: 'Choosing the Right Tires for Your Vehicle - Arisegenius Guide',
      metaDescription: 'A comprehensive guide to choosing the right tires for your vehicle, covering size, season, and performance considerations.',
      metaKeywords: ['tire selection', 'vehicle tires', 'tire guide', 'tire size'],
    },
  ];

  for (const postData of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: postData.slug },
      update: {},
      create: postData,
    });
  }

  // Create system settings
  console.log('Creating system settings...');
  
  const settings = [
    {
      key: 'site_name',
      value: 'Arisegenius',
      type: 'STRING',
      description: 'Website name',
      isPublic: true,
    },
    {
      key: 'site_description',
      value: 'Leading African Tire Innovation',
      type: 'STRING',
      description: 'Website description',
      isPublic: true,
    },
    {
      key: 'contact_email',
      value: 'info@arisegenius.com',
      type: 'STRING',
      description: 'Contact email address',
      isPublic: true,
    },
    {
      key: 'contact_phone',
      value: '+234-xxx-xxxx',
      type: 'STRING',
      description: 'Contact phone number',
      isPublic: true,
    },
    {
      key: 'default_currency',
      value: 'USD',
      type: 'STRING',
      description: 'Default currency',
      isPublic: true,
    },
    {
      key: 'shipping_rate',
      value: '25.00',
      type: 'NUMBER',
      description: 'Default shipping rate',
      isPublic: false,
    },
    {
      key: 'tax_rate',
      value: '0.1',
      type: 'NUMBER',
      description: 'Default tax rate (10%)',
      isPublic: false,
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'BOOLEAN',
      description: 'Maintenance mode status',
      isPublic: false,
    },
  ];

  for (const settingData of settings) {
    await prisma.setting.upsert({
      where: { key: settingData.key },
      update: {},
      create: settingData,
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📋 Created:');
  console.log('  - 4 Categories');
  console.log('  - 1 Admin user (admin@arisegenius.com / admin123)');
  console.log('  - 1 Dealer user (dealer@abctire.com / dealer123)');
  console.log('  - 1 Customer user (customer@example.com / customer123)');
  console.log('  - 4 Sample products');
  console.log('  - 2 Sample pages');
  console.log('  - 2 Sample blog posts');
  console.log('  - 8 System settings');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
