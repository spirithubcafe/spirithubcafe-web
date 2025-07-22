import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

async function setup() {
  await pb.admins.authWithPassword('miladsoft@yahoo.com', '9dKQpNT2YRS.S3f')

  // مرحله 1: ساخت کالکشن بدون rules
  const categories = await pb.collections.create({
    name: 'categories',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'name_ar', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'description_ar', type: 'text' },
      { name: 'image', type: 'file' },
      { name: 'is_active', type: 'bool', options: { default: true } },
      { name: 'sort_order', type: 'number', options: { default: 0 } },
    ]
  })

  // مرحله 2: به‌روزرسانی collection با rules بعد از ساخت موفق
  await pb.collections.update(categories.id, {
    listRule: 'is_active = true || @request.auth.role = "admin"',
    viewRule: 'is_active = true || @request.auth.role = "admin"',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"'
  })

  console.log('✅ Collection categories created with rules!')
}

setup().catch(console.error)
