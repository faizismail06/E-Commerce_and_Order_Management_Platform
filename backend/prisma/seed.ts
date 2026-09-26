import { PrismaClient, RoleName } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function slugify(text: string): string {
 return text
 .toString()
 .toLowerCase()
 .trim()
 .replace(/\s+/g, '-')
 .replace(/[^\w\-]+/g, '')
 .replace(/\-\-+/g, '-');
}

async function main() {
 console.log(' Starting comprehensive database seeding...');

 // 1. Seed Roles
 const rolesData = [
 { name: RoleName.SUPER_ADMIN, description: 'Super Administrator with full system control and audit access' },
 { name: RoleName.ADMIN, description: 'Store Manager for managing catalog, stock, orders, and promotions' },
 { name: RoleName.CUSTOMER, description: 'Standard Customer for browsing, purchasing, and managing orders' },
 ];

 const rolesMap = new Map<RoleName, string>();
 for (const role of rolesData) {
 const createdRole = await prisma.role.upsert({
 where: { name: role.name },
 update: { description: role.description },
 create: role,
 });
 rolesMap.set(createdRole.name, createdRole.id);
 }
 console.log('[x] Roles seeded successfully.');

 // 2. Seed Users
 const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 10);
 const adminPassword = await bcrypt.hash('Admin123!', 10);
 const customerPassword = await bcrypt.hash('Customer123!', 10);

 const usersData = [
 {
 email: 'superadmin@platform.com',
 password: superAdminPassword,
 fullName: 'Super Administrator',
 phone: '+6281234567890',
 roleId: rolesMap.get(RoleName.SUPER_ADMIN)!,
 },
 {
 email: 'admin@platform.com',
 password: adminPassword,
 fullName: 'Admin Operations Manager',
 phone: '+6281234567891',
 roleId: rolesMap.get(RoleName.ADMIN)!,
 },
 {
 email: 'customer@platform.com',
 password: customerPassword,
 fullName: 'Demo Customer',
 phone: '+6281234567892',
 roleId: rolesMap.get(RoleName.CUSTOMER)!,
 },
 ];

 for (const user of usersData) {
 await prisma.user.upsert({
 where: { email: user.email },
 update: { password: user.password, fullName: user.fullName, phone: user.phone, roleId: user.roleId },
 create: { ...user, cart: { create: {} } },
 });
 }
 console.log('[x] Demo Users seeded successfully.');

 // 3. Seed 8 Categories
 const categoriesData = [
 {
 name: 'Electronics & Gadgets',
 description: 'Smartphones, laptops, audio devices, smart wearables, and tech accessories.',
 imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
 },
 {
 name: 'Fashion & Apparel',
 description: 'Trendy menswear, womenswear, footwear, bags, and fashion accessories.',
 imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
 },
 {
 name: 'Home & Living',
 description: 'Modern furniture, minimalist decor, kitchen appliances, and lighting.',
 imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
 },
 {
 name: 'Books & Stationery',
 description: 'Bestselling fiction, business guides, tech books, journals, and pens.',
 imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
 },
 {
 name: 'Sports & Outdoors',
 description: 'Fitness gear, athletic apparel, camping equipment, and outdoor accessories.',
 imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=600&auto=format&fit=crop&q=80',
 },
 {
 name: 'Beauty & Wellness',
 description: 'Skincare products, organic cosmetics, perfumes, and personal care essentials.',
 imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
 },
 {
 name: 'Toys & Hobbies',
 description: 'Action figures, board games, puzzle kits, scale models, and collectibles.',
 imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80',
 },
 {
 name: 'Gourmet Food & Drinks',
 description: 'Artisanal coffee beans, specialty teas, organic snacks, and gourmet chocolates.',
 imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
 },
 ];

 const categoryMap = new Map<string, string>();
 for (const cat of categoriesData) {
 const slug = slugify(cat.name);
 const createdCat = await prisma.category.upsert({
 where: { slug },
 update: { description: cat.description, imageUrl: cat.imageUrl },
 create: { name: cat.name, slug, description: cat.description, imageUrl: cat.imageUrl },
 });
 categoryMap.set(cat.name, createdCat.id);
 }
 console.log('[x] 8 Categories seeded successfully.');

 // 4. Seed 50 Products
 const rawProducts = [
 // Electronics (10 items)
 {
 sku: 'SKU-ELE-001',
 name: 'Pro ANC Wireless Noise Canceling Headphones',
 price: 2499000,
 discountPrice: 1999000,
 stock: 35,
 weight: 320,
 catName: 'Electronics & Gadgets',
 desc: 'Immersive spatial audio experience with active noise cancellation, 40-hour battery life, and ultra-soft memory foam earcups.',
 img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-ELE-002',
 name: 'UltraSlim Mechanical Bluetooth Keyboard',
 price: 1299000,
 discountPrice: 1099000,
 stock: 45,
 weight: 650,
 catName: 'Electronics & Gadgets',
 desc: 'Low-profile mechanical switches, aluminum chassis, RGB backlighting, and seamless multi-device Bluetooth switching.',
 img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-ELE-003',
 name: 'Ergonomic Precision Wireless Mouse',
 price: 799000,
 discountPrice: 649000,
 stock: 50,
 weight: 140,
 catName: 'Electronics & Gadgets',
 desc: 'Thumb rest design, hyper-fast scroll wheel, 8000 DPI track-anywhere sensor, and quiet-click technology.',
 img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-ELE-004',
 name: '4K UltraHD Streamer Webcam 60FPS',
 price: 1599000,
 discountPrice: 1399000,
 stock: 20,
 weight: 210,
 catName: 'Electronics & Gadgets',
 desc: 'Auto-focus HDR lens, dual noise-canceling stereo mics, magnetic privacy shutter, and tripod mounting bracket.',
 img: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-ELE-005',
 name: 'Smart OLED Fitness Tracker Watch',
 price: 1899000,
 discountPrice: 1499000,
 stock: 18,
 weight: 55,
 catName: 'Electronics & Gadgets',
 desc: 'Continuous SpO2 and heart rate tracking, built-in GPS, 50m water resistance, and 14-day continuous battery performance.',
 img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-ELE-006',
 name: 'Portable Bluetooth Waterproof Speaker 20W',
 price: 899000,
 discountPrice: 749000,
 stock: 40,
 weight: 550,
 catName: 'Electronics & Gadgets',
 desc: 'Deep punchy bass boost, IP67 dustproof and waterproof rating, 12-hour playtime, and party-pair wireless mesh link.',
 img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-ELE-007',
 name: '100W GaN Fast Charger 4-Port Hub',
 price: 599000,
 discountPrice: 499000,
 stock: 60,
 weight: 230,
 catName: 'Electronics & Gadgets',
 desc: 'Compact Gallium Nitride technology supporting Power Delivery 3.0, charging laptops, tablets, and smartphones concurrently.',
 img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-ELE-008',
 name: 'Curved Gaming Monitor 27-inch 165Hz',
 price: 3499000,
 discountPrice: 2999000,
 stock: 10,
 weight: 4800,
 catName: 'Electronics & Gadgets',
 desc: '1500R curvature, 1ms MPRT response time, AMD FreeSync Premium, and 99% sRGB color accuracy panel.',
 img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-ELE-009',
 name: 'Active Noise Canceling Earbuds Pro',
 price: 1399000,
 discountPrice: 1199000,
 stock: 25,
 weight: 45,
 catName: 'Electronics & Gadgets',
 desc: 'Transparency mode, wireless charging case, touch gesture controls, and IPX5 sweat-proof endurance.',
 img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-ELE-010',
 name: 'Smart Home Hub Display 8-inch',
 price: 1799000,
 discountPrice: null,
 stock: 0, // Test Out of Stock
 weight: 850,
 catName: 'Electronics & Gadgets',
 desc: 'Control smart lighting, security cameras, music streaming, and video calls with voice assistant integration.',
 img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
 },

 // Fashion (7 items)
 {
 sku: 'SKU-FAS-001',
 name: 'Classic Japanese Denim Jacket',
 price: 799000,
 discountPrice: 649000,
 stock: 25,
 weight: 850,
 catName: 'Fashion & Apparel',
 desc: '13.5oz raw selvedge denim, tailored vintage cut, brass hardware, and double needle reinforced stitching.',
 img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-FAS-002',
 name: 'Minimalist Leather Everyday Sneaker',
 price: 1199000,
 discountPrice: 949000,
 stock: 30,
 weight: 920,
 catName: 'Fashion & Apparel',
 desc: 'Full-grain Nappa leather upper, stitched rubber outsole, cushioned memory foam footbed, and breathable lining.',
 img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-FAS-003',
 name: 'Waterproof Commuter Backpack 22L',
 price: 899000,
 discountPrice: 749000,
 stock: 40,
 weight: 780,
 catName: 'Fashion & Apparel',
 desc: 'Padded 16-inch laptop compartment, YKK waterproof zippers, hidden anti-theft back pocket, and ergonomic straps.',
 img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-FAS-004',
 name: 'Heavyweight Oversized Streetwear Hoodie',
 price: 499000,
 discountPrice: 399000,
 stock: 50,
 weight: 680,
 catName: 'Fashion & Apparel',
 desc: '450GSM French terry cotton, pre-shrunk fabric, double-layered hood, and kangaroo front pocket.',
 img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-FAS-005',
 name: 'Polarized Aviator Sunglasses Stainless',
 price: 399000,
 discountPrice: 329000,
 stock: 35,
 weight: 85,
 catName: 'Fashion & Apparel',
 desc: 'UV400 protection TAC polarized lenses, ultra-lightweight stainless steel frame, and adjustable silicone nose pads.',
 img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-FAS-006',
 name: 'Tailored Slim Fit Chino Trousers',
 price: 449000,
 discountPrice: null,
 stock: 28,
 weight: 420,
 catName: 'Fashion & Apparel',
 desc: 'Stretch cotton twill fabric, wrinkle-resistant finish, button-closure waist, and versatile office-to-weekend style.',
 img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-FAS-007',
 name: 'Genuine Leather Minimalist Bifold Wallet',
 price: 299000,
 discountPrice: 239000,
 stock: 60,
 weight: 90,
 catName: 'Fashion & Apparel',
 desc: 'RFID blocking lining, holds up to 10 cards, full-grain vegetable-tanned leather that develops a beautiful patina.',
 img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
 },

 // Home & Living (7 items)
 {
 sku: 'SKU-HOM-001',
 name: 'Ergonomic Mesh Executive Office Chair',
 price: 2899000,
 discountPrice: 2299000,
 stock: 15,
 weight: 14500,
 catName: 'Home & Living',
 desc: 'Adjustable 3D armrests, dynamic lumbar support, breathable Korean mesh back, and recline tilt lock up to 135 degrees.',
 img: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-HOM-002',
 name: 'Nordic Solid Oak Minimalist Desk',
 price: 3999000,
 discountPrice: 3499000,
 stock: 8,
 weight: 22000,
 catName: 'Home & Living',
 desc: '100% solid white oak timber, cable management channel, dual soft-close drawers, and eco-friendly natural oil finish.',
 img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-HOM-003',
 name: 'Smart Ultrasonic Aroma Diffuser Lamp',
 price: 349000,
 discountPrice: 279000,
 stock: 45,
 weight: 480,
 catName: 'Home & Living',
 desc: '500ml capacity, 7 warm ambient LED colors, quiet misting operation, and automatic safety shutoff.',
 img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-HOM-004',
 name: 'Cast Iron Dutch Oven Pot 4.5L',
 price: 999000,
 discountPrice: 799000,
 stock: 22,
 weight: 5200,
 catName: 'Home & Living',
 desc: 'Heavy-duty enameled cast iron, heat distribution up to 260°C, suitable for induction, oven, and gas cooktops.',
 img: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-HOM-005',
 name: 'Dimmable Warm Touch Desk Lamp',
 price: 289000,
 discountPrice: 219000,
 stock: 35,
 weight: 650,
 catName: 'Home & Living',
 desc: 'Flicker-free eye-caring LED, flexible 360-degree goose-neck, integrated USB charging port, and touch brightness slider.',
 img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-HOM-006',
 name: 'Ceramic Pour-Over Coffee Maker Set',
 price: 399000,
 discountPrice: null,
 stock: 30,
 weight: 750,
 catName: 'Home & Living',
 desc: 'V60 spiral groove dripper cone, heat-resistant borosilicate glass carafe 600ml, and 50 paper filter cones.',
 img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-HOM-007',
 name: 'Memory Foam Contour Orthopedic Pillow',
 price: 329000,
 discountPrice: 259000,
 stock: 50,
 weight: 1100,
 catName: 'Home & Living',
 desc: 'Ergonomic neck relief contour design, washable bamboo fiber cover, and slow-rebound high density foam core.',
 img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
 },

 // Books & Stationery (6 items)
 {
 sku: 'SKU-BOK-001',
 name: 'Designing Data-Intensive Applications (Hardcover)',
 price: 549000,
 discountPrice: 479000,
 stock: 40,
 weight: 890,
 catName: 'Books & Stationery',
 desc: 'The definitive guide to system architecture, distributed storage, consensus algorithms, and fault-tolerant software engineering.',
 img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-BOK-002',
 name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
 price: 449000,
 discountPrice: 389000,
 stock: 35,
 weight: 650,
 catName: 'Books & Stationery',
 desc: 'Master the principles, patterns, and practices of writing clean, maintainable, and refactorable enterprise code.',
 img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-BOK-003',
 name: 'Dot Grid Bullet Journal A5 Hardcover 160GSM',
 price: 189000,
 discountPrice: 149000,
 stock: 75,
 weight: 380,
 catName: 'Books & Stationery',
 desc: 'Zero ink bleed 160GSM bamboo paper, lay-flat thread binding, elastic closure band, dual ribbon bookmarks, and back pocket.',
 img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-BOK-004',
 name: 'Fountain Pen Fine Nib Brass Barrel',
 price: 299000,
 discountPrice: 239000,
 stock: 50,
 weight: 120,
 catName: 'Books & Stationery',
 desc: 'Precision stainless steel German nib, solid brass body with matte lacquer finish, includes ink converter and 5 cartridges.',
 img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-BOK-005',
 name: 'Atomic Habits by James Clear (Indonesian Translation)',
 price: 119000,
 discountPrice: 99000,
 stock: 100,
 weight: 320,
 catName: 'Books & Stationery',
 desc: 'An easy & proven way to build good habits & break bad ones with actionable behavioral engineering frameworks.',
 img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-BOK-006',
 name: 'Minimalist Wooden Desk Organizer Tray',
 price: 159000,
 discountPrice: null,
 stock: 25,
 weight: 420,
 catName: 'Books & Stationery',
 desc: 'Natural walnut wood finish with phone stand slot, pen grooves, and note holder compartments.',
 img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop&q=80',
 },

 // Sports & Outdoors (5 items)
 {
 sku: 'SKU-SPO-001',
 name: 'Non-Slip Eco Yoga Mat 6mm TPE',
 price: 279000,
 discountPrice: 219000,
 stock: 45,
 weight: 850,
 catName: 'Sports & Outdoors',
 desc: 'Double-sided textured grip, alignment position lines, eco-friendly non-toxic TPE material, includes shoulder carrying strap.',
 img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-SPO-002',
 name: 'Insulated Stainless Steel Water Bottle 1L',
 price: 249000,
 discountPrice: 189000,
 stock: 60,
 weight: 450,
 catName: 'Sports & Outdoors',
 desc: 'Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12 hours. Sweat-free powder coat finish.',
 img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-SPO-003',
 name: 'Adjustable Dumbbell Set 20KG Pair',
 price: 1499000,
 discountPrice: 1249000,
 stock: 12,
 weight: 20500,
 catName: 'Sports & Outdoors',
 desc: 'Cast iron weight plates with rubber coating, knurled non-slip chrome handles, and secure star lock collars.',
 img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-SPO-004',
 name: 'Lightweight Camping Tent 2-Person',
 price: 899000,
 discountPrice: 749000,
 stock: 15,
 weight: 2400,
 catName: 'Sports & Outdoors',
 desc: '210T waterproof PU3000mm rainfly, aviation aluminum poles, mesh ventilation windows, and 5-minute setup design.',
 img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-SPO-005',
 name: 'Speed Jump Rope Ball Bearing',
 price: 99000,
 discountPrice: 79000,
 stock: 80,
 weight: 180,
 catName: 'Sports & Outdoors',
 desc: '360-degree ball bearing pivot system, anti-tangle steel wire rope, aluminum alloy handles for double-unders.',
 img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
 },

 // Beauty & Wellness (5 items)
 {
 sku: 'SKU-BEA-001',
 name: 'Hyaluronic Acid Hydration Serum 50ml',
 price: 249000,
 discountPrice: 199000,
 stock: 55,
 weight: 150,
 catName: 'Beauty & Wellness',
 desc: 'Multi-molecular weight hyaluronic acid formula that penetrates deeply for plump, radiant, and smooth skin hydration.',
 img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-BEA-002',
 name: 'Gentle Botanical Cleansing Oil 200ml',
 price: 219000,
 discountPrice: 179000,
 stock: 40,
 weight: 260,
 catName: 'Beauty & Wellness',
 desc: 'Melt away stubborn waterproof makeup and impurities without stripping natural moisture barrier.',
 img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-BEA-003',
 name: 'Mineral SPF50+ Invisible Sunscreen 80ml',
 price: 189000,
 discountPrice: 149000,
 stock: 70,
 weight: 120,
 catName: 'Beauty & Wellness',
 desc: 'Broad spectrum UVA/UVB protection, zero white cast, non-comedogenic velvet finish suitable for sensitive skin.',
 img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-BEA-004',
 name: 'Natural Jade Facial Roller & Gua Sha Kit',
 price: 149000,
 discountPrice: 119000,
 stock: 50,
 weight: 210,
 catName: 'Beauty & Wellness',
 desc: '100% authentic Xiuyan Jade stone for lymphatic drainage, reducing facial puffiness, and enhancing serum absorption.',
 img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-BEA-005',
 name: 'Organic Lavender Essential Oil 30ml',
 price: 129000,
 discountPrice: null,
 stock: 65,
 weight: 95,
 catName: 'Beauty & Wellness',
 desc: '100% pure steam-distilled French lavender oil for aromatherapy relaxation, stress relief, and sleep enhancement.',
 img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
 },

 // Toys & Hobbies (5 items)
 {
 sku: 'SKU-TOY-001',
 name: 'Cyberpunk Mecha Model Kit 1/100 Scale',
 price: 599000,
 discountPrice: 499000,
 stock: 20,
 weight: 850,
 catName: 'Toys & Hobbies',
 desc: 'Snap-fit plastic injection model kit with pre-painted armor plates, LED unit eye module, and articulation joints.',
 img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-TOY-002',
 name: 'Strategy Board Game: Galactic Settlers',
 price: 449000,
 discountPrice: 379000,
 stock: 25,
 weight: 1450,
 catName: 'Toys & Hobbies',
 desc: 'Deep tactical resource management game for 2-4 players. Includes custom wooden resource tokens and modular hex tiles.',
 img: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-TOY-003',
 name: 'Wooden 3D Mechanical Gear Clock Puzzle',
 price: 299000,
 discountPrice: 239000,
 stock: 35,
 weight: 620,
 catName: 'Toys & Hobbies',
 desc: 'Laser-cut basswood pieces assemble into a fully functional spring-driven mechanical clock pendulum without glue.',
 img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-TOY-004',
 name: 'Speed Cube 3x3 Magnetic Flagship',
 price: 199000,
 discountPrice: 159000,
 stock: 60,
 weight: 90,
 catName: 'Toys & Hobbies',
 desc: 'Dual-adjustment tensioning system, core magnetic positioning, stickerless frosted surface for lightning-fast corner cutting.',
 img: 'https://images.unsplash.com/photo-1591994843349-f415893b3a6b?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-TOY-005',
 name: 'Collectible Vinyl Art Figure 10-inch',
 price: 699000,
 discountPrice: null,
 stock: 15,
 weight: 780,
 catName: 'Toys & Hobbies',
 desc: 'Limited production designer vinyl figure featuring metallic accents, individually numbered display box.',
 img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
 },

 // Food & Beverages (5 items)
 {
 sku: 'SKU-FOD-001',
 name: 'Single Origin Arabica Coffee Beans 500g',
 price: 149000,
 discountPrice: 119000,
 stock: 80,
 weight: 520,
 catName: 'Gourmet Food & Drinks',
 desc: 'Freshly medium-roasted specialty grade Arabica beans from Gayo highlands with chocolate and fruity notes.',
 img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-FOD-002',
 name: 'Organic Ceremonial Grade Matcha Powder 100g',
 price: 229000,
 discountPrice: 189000,
 stock: 45,
 weight: 140,
 catName: 'Gourmet Food & Drinks',
 desc: 'First harvest stone-ground Japanese Uji matcha with vibrant emerald color, rich umami taste, and zero bitterness.',
 img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-FOD-003',
 name: 'Artisanal Dark Chocolate Bar 72% Sea Salt',
 price: 65000,
 discountPrice: 49000,
 stock: 120,
 weight: 100,
 catName: 'Gourmet Food & Drinks',
 desc: 'Bean-to-bar dark chocolate crafted from organic cocoa beans sprinkled with hand-harvested sea salt flakes.',
 img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-FOD-004',
 name: 'Raw Wildflower Forest Honey 650g',
 price: 139000,
 discountPrice: 109000,
 stock: 50,
 weight: 780,
 catName: 'Gourmet Food & Drinks',
 desc: 'Unfiltered, unpasteurized pure honey rich in natural enzymes, antioxidants, and delicate floral aromas.',
 img: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&auto=format&fit=crop&q=80',
 },
 {
 sku: 'SKU-FOD-005',
 name: 'Cold Pressed Extra Virgin Olive Oil 750ml',
 price: 189000,
 discountPrice: null,
 stock: 35,
 weight: 1100,
 catName: 'Gourmet Food & Drinks',
 desc: 'First cold extraction from single-estate Koroneiki olives with low acidity (<0.3%) and peppery finish.',
 img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
 },
 ];

 for (const prod of rawProducts) {
 const slug = slugify(prod.name);
 const categoryId = categoryMap.get(prod.catName);
 if (!categoryId) continue;

 const existingProd = await prisma.product.findUnique({
 where: { sku: prod.sku },
 });

 if (existingProd) {
 await prisma.product.update({
 where: { sku: prod.sku },
 data: {
 name: prod.name,
 slug,
 price: prod.price,
 discountPrice: prod.discountPrice,
 stock: prod.stock,
 weight: prod.weight,
 description: prod.desc,
 categoryId,
 },
 });
 } else {
 await prisma.product.create({
 data: {
 sku: prod.sku,
 name: prod.name,
 slug,
 description: prod.desc,
 price: prod.price,
 discountPrice: prod.discountPrice,
 stock: prod.stock,
 weight: prod.weight,
 categoryId,
 images: {
 create: [
 { url: prod.img, isPrimary: true },
 { url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80', isPrimary: false },
 ],
 },
 },
 });
 }
 }

 console.log('[x] 50 Products seeded successfully with images, prices, and stock.');

 // 5. Seed Demo Promotions / Coupons
 const promosData = [
 {
 code: 'WELCOME10',
 name: 'Welcome 10% Discount',
 type: 'PERCENTAGE' as const,
 value: 10,
 minPurchase: 100000,
 maxDiscount: 50000,
 usageLimit: 500,
 startDate: new Date(),
 endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
 isActive: true,
 },
 {
 code: 'BIGSALE50',
 name: 'Big Sale Rp 50.000 Off',
 type: 'FIXED_AMOUNT' as const,
 value: 50000,
 minPurchase: 300000,
 maxDiscount: null,
 usageLimit: 200,
 startDate: new Date(),
 endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
 isActive: true,
 },
 {
 code: 'SUPERVIP',
 name: 'Super VIP 20% Discount',
 type: 'PERCENTAGE' as const,
 value: 20,
 minPurchase: 500000,
 maxDiscount: 150000,
 usageLimit: 100,
 startDate: new Date(),
 endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
 isActive: true,
 },
 ];

 for (const promo of promosData) {
 await prisma.promotion.upsert({
 where: { code: promo.code },
 update: {
 name: promo.name,
 type: promo.type,
 value: promo.value,
 minPurchase: promo.minPurchase,
 maxDiscount: promo.maxDiscount,
 isActive: promo.isActive,
 },
 create: promo,
 });
 }
 console.log('[x] Demo Promotions (WELCOME10, BIGSALE50, SUPERVIP) seeded successfully.');

 // 6. Seed Sample Product Reviews & Calculate Rating Averages
 const demoCustomer = await prisma.user.findUnique({ where: { email: 'customer@platform.com' } });
 const firstProducts = await prisma.product.findMany({ take: 5 });

 if (demoCustomer && firstProducts.length > 0) {
 // Create a dummy completed order for verified purchase link if needed
 const defaultAddr = await prisma.address.findFirst({ where: { userId: demoCustomer.id } });
 if (defaultAddr) {
 const dummyOrder = await prisma.order.upsert({
 where: { orderNumber: 'ORD-DEMO-SEED-001' },
 update: {},
 create: {
 orderNumber: 'ORD-DEMO-SEED-001',
 userId: demoCustomer.id,
 addressId: defaultAddr.id,
 subtotal: 1999000,
 shippingCost: 10000,
 grandTotal: 2009000,
 orderStatus: 'COMPLETED',
 paymentStatus: 'PAID',
 items: {
 create: [
 {
 productId: firstProducts[0].id,
 name: firstProducts[0].name,
 price: firstProducts[0].price,
 quantity: 1,
 subtotal: firstProducts[0].price,
 },
 ],
 },
 },
 });

 const sampleReviews = [
 {
 productId: firstProducts[0].id,
 userId: demoCustomer.id,
 orderId: dummyOrder.id,
 rating: 5,
 comment: 'Kualitas suara noise cancelling-nya luar biasa jernih! Sangat worth it untuk harga sekian.',
 },
 {
 productId: firstProducts[1].id,
 userId: demoCustomer.id,
 orderId: dummyOrder.id,
 rating: 4,
 comment: 'Keyboard meka yang sangat solid dan feel mengetiknya enak banget. Packaging aman.',
 },
 ];

 for (const rev of sampleReviews) {
 await prisma.review.upsert({
 where: {
 userId_orderId_productId: {
 userId: rev.userId,
 orderId: rev.orderId,
 productId: rev.productId,
 },
 },
 update: { rating: rev.rating, comment: rev.comment },
 create: rev,
 });

 // Recalculate ratingAvg & ratingCount for product
 const stats = await prisma.review.aggregate({
 where: { productId: rev.productId },
 _avg: { rating: true },
 _count: { rating: true },
 });

 await prisma.product.update({
 where: { id: rev.productId },
 data: {
 ratingAvg: stats._avg.rating || 0,
 ratingCount: stats._count.rating || 0,
 },
 });
 }
 console.log('[x] Demo Product Reviews & Rating Stats seeded successfully.');
 }
 }

 console.log(' Seeding pipeline completed successfully!');
}

main()
 .catch((e) => {
 console.error('[ ] Seeding failed:', e);
 process.exit(1);
 })
 .finally(async () => {
 await prisma.$disconnect();
 });
