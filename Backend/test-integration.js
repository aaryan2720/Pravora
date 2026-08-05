require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('./src/config/cloudinary');

// Import Models
const Restaurant = require('./src/models/Restaurant');
const MenuCategory = require('./src/models/MenuCategory');
const MenuItem = require('./src/models/MenuItem');
const User = require('./src/models/User');

const TEST_SLUG = 'test-integration-restaurant';

async function runTest() {
  console.log('🚀 Starting Backend Integration Test...');
  
  // 1. Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }
  
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB.');

  let testUser = null;
  let testRestaurant = null;
  let testCategory = null;
  let testItem = null;
  let cloudinaryPublicId = null;

  try {
    // Clean up any stale test data from previous runs just in case
    await cleanUpData(TEST_SLUG);

    // 2. Create a Test User (Owner)
    console.log('👤 Creating Test User...');
    testUser = await User.create({
      name: 'Test Owner',
      email: `test-owner-${Date.now()}@example.com`,
      passwordHash: 'testpassword123',
      role: 'owner'
    });
    console.log(`✅ Test User created: ${testUser.email}`);

    // 3. Create a Test Restaurant
    console.log('🏢 Creating Test Restaurant...');
    testRestaurant = await Restaurant.create({
      name: 'Test Spice Garden',
      slug: TEST_SLUG,
      type: 'casual_dining',
      serviceModel: 'hybrid',
      owner: testUser._id
    });
    console.log(`✅ Test Restaurant created: ${testRestaurant.name} (Slug: ${testRestaurant.slug})`);

    // Link user to restaurant
    testUser.restaurantId = testRestaurant._id;
    await testUser.save();

    // 4. Create a Menu Category
    console.log('📂 Creating Test Menu Category...');
    testCategory = await MenuCategory.create({
      restaurantId: testRestaurant._id,
      name: 'Specials Test',
      icon: '⭐'
    });
    console.log(`✅ Test Category created: ${testCategory.name}`);

    // 5. Create a Menu Item
    console.log('🍛 Creating Test Menu Item...');
    testItem = await MenuItem.create({
      restaurantId: testRestaurant._id,
      categoryId: testCategory._id,
      name: 'Paneer Butter Masala Test',
      price: 360,
      availability: 'available'
    });
    console.log(`✅ Test Menu Item created: ${testItem.name} (Price: ${testItem.price})`);

    // 6. Test Cloudinary Upload (using restaurant folder structure)
    console.log('☁️ Uploading Test Image to Cloudinary...');
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // We construct the folder name based on the restaurant's slug: pravora/test-spice-garden/menu
    const folderPath = `pravora/${testRestaurant.slug}/menu`;
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: folderPath,
      public_id: `test_item_${testItem._id}`,
      overwrite: true
    });
    
    cloudinaryPublicId = uploadResult.public_id;
    console.log(`✅ Image uploaded successfully to Cloudinary!`);
    console.log(`🔗 URL: ${uploadResult.secure_url}`);
    console.log(`📁 Folder/Public ID: ${cloudinaryPublicId}`);

    // Update item image url in database
    testItem.image = uploadResult.secure_url;
    await testItem.save();

    // 7. Verify Data is Fetchable
    console.log('🔍 Verifying database persistence...');
    const foundItem = await MenuItem.findById(testItem._id).lean();
    if (foundItem && foundItem.image === uploadResult.secure_url) {
      console.log('✅ Database verification complete: Item matches with Cloudinary image URL.');
    } else {
      throw new Error('Database verification failed: Item not found or image URL mismatch.');
    }

    console.log('\n⭐ INTEGRATION TEST SUCCESSFUL! All operations passed. ⭐\n');

  } catch (err) {
    console.error('❌ Integration Test Failed:', err);
  } finally {
    // 8. Clean up all created data (for this test only)
    console.log('🧹 Cleaning up test data from Cloudinary and MongoDB...');
    
    if (cloudinaryPublicId) {
      try {
        console.log(`🗑️ Deleting test image from Cloudinary: ${cloudinaryPublicId}`);
        await cloudinary.uploader.destroy(cloudinaryPublicId);
        console.log('✅ Cloudinary image deleted.');
        
        // Also delete folder namespace (delete folder command requires admin API or empty folder)
        // Root folders/subfolders don't cost storage if empty, but we deleted the resource.
      } catch (cloudErr) {
        console.error('⚠️ Failed to clean up Cloudinary image:', cloudErr.message);
      }
    }

    await cleanUpData(TEST_SLUG);
    
    console.log('🔌 Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('👋 Finished.');
  }
}

async function cleanUpData(slug) {
  const restaurant = await Restaurant.findOne({ slug });
  if (restaurant) {
    console.log(`🗑️ Deleting test database records for Restaurant ID: ${restaurant._id}`);
    
    // Delete menu items
    const itemsDeleted = await MenuItem.deleteMany({ restaurantId: restaurant._id });
    console.log(`   - Deleted ${itemsDeleted.deletedCount} menu items.`);

    // Delete categories
    const catsDeleted = await MenuCategory.deleteMany({ restaurantId: restaurant._id });
    console.log(`   - Deleted ${catsDeleted.deletedCount} categories.`);

    // Delete users associated with this restaurant
    const usersDeleted = await User.deleteMany({ restaurantId: restaurant._id });
    console.log(`   - Deleted ${usersDeleted.deletedCount} users.`);

    // Delete the restaurant itself
    await Restaurant.deleteOne({ _id: restaurant._id });
    console.log('   - Deleted restaurant record.');
  }
}

runTest();
