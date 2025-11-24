import { PrismaClient } from '@prisma/client';
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Read the backend-local products.json by default
  const filePath = path.resolve(__dirname, '../../frontend/public/products.json');
  if (!fs.existsSync(filePath)) {
    console.error('products.json not found at', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(raw);

  for (const p of products) {
    // Map incoming product shape to Prisma Product model fields
    const imagesObj = p.images ?? {};
    const firstImage = imagesObj[Object.keys(imagesObj || {})[0]]?.[0] || p.image || null;
    let descriptionText = "";
    if (Array.isArray(p.description)) {
      descriptionText = p.description
        .map((d: any) => (d && d.title && d.description ? `${d.title}: ${d.description}` : JSON.stringify(d)))
        .join("\n");
    } else if (typeof p.description === "string") {
      descriptionText = p.description;
    }

    const data: any = {
      jsonId: String(p.id ?? ""),
      name: p.name ?? "",
      description: descriptionText || null,
      price: p.price != null ? Number(p.price) : 0,
      image: firstImage,
      images: p.images || null,
      colors: p.colors || [],
      category: p.category ?? null,
      brand: p.brand ?? null,
      stock: p.stock != null ? Number(p.stock) : 0,
      rating: p.rating != null ? Number(p.rating) : null,
      reviews: p.reviews != null ? Number(p.reviews) : null,
      discount: p.discount != null ? Number(p.discount) : null,
      isActive: p.isActive != null ? !!p.isActive : true,
    };

    await prisma.product.upsert({
      where: { jsonId: data.jsonId },
      update: data,
      create: data,
    });
    console.log(`Upserted product ${data.jsonId} - ${data.name}`);
  }

  // Seed dummy users
  const users = [
    {
      name: 'Admin User',
      email: 'admin@jahezmart.com',
      password: 'admin123',
      role: 'admin',
    },
    {
      name: 'Abdullah',
      email: 'abdullah@example.com',
      password: '1',
      role: 'user',
      firstName: 'Abdullah',
      lastName: 'Khan',
      birthday: new Date('1990-01-01'),
      gender: 'male',
      phoneNumber: '1738844893',
      shippingAddress: 'Khulana, Shatgumbuj Mosque',
      billingAddress: 'Khulana, Shatgumbuj Mosque',
    },
    {
      name: 'Imadullah',
      email: 'imadullah@example.com',
      password: '1',
      role: 'user',
      firstName: 'Imadullah',
      lastName: 'Ahmed',
      birthday: new Date('1985-05-15'),
      gender: 'male',
      phoneNumber: '1234567890',
      shippingAddress: 'Dhaka, Bangladesh',
      billingAddress: 'Dhaka, Bangladesh',
    },
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        password: hashedPassword,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        birthday: u.birthday,
        gender: u.gender,
        phoneNumber: u.phoneNumber,
        shippingAddress: u.shippingAddress,
        billingAddress: u.billingAddress,
      },
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        birthday: u.birthday,
        gender: u.gender,
        phoneNumber: u.phoneNumber,
        shippingAddress: u.shippingAddress,
        billingAddress: u.billingAddress,
      },
    });

    // Create dummy orders for users
    if (u.role === 'user') {
      const orderNumber1 = `ORD-${user.id.slice(-6).toUpperCase()}-001`;
      const order1 = await prisma.order.upsert({
        where: { orderNumber: orderNumber1 },
        update: {
          userId: user.id,
          total: 120,
          status: 'delivered',
        },
        create: {
          userId: user.id,
          orderNumber: orderNumber1,
          total: 120,
          status: 'delivered',
          items: {
            create: [
              {
                productId: '1',
                name: '3 Seater Sofa',
                price: 120,
                quantity: 1,
                image: '/images/products/product1.1.jpg',
              },
            ],
          },
        },
      });

      const orderNumber2 = `ORD-${user.id.slice(-6).toUpperCase()}-002`;
      const order2 = await prisma.order.upsert({
        where: { orderNumber: orderNumber2 },
        update: {
          userId: user.id,
          total: 200,
          status: 'cancelled',
        },
        create: {
          userId: user.id,
          orderNumber: orderNumber2,
          total: 200,
          status: 'cancelled',
          items: {
            create: [
              {
                productId: '2',
                name: 'Single Bed',
                price: 200,
                quantity: 1,
                image: '/images/products/product2.1.jpg',
              },
            ],
          },
        },
      });

      console.log(`Created orders for user ${u.email}`);
    }

    // Create dummy cart and wishlist items for users
    if (u.role === 'user') {
      // pick first two products from products list if available
      const prod1 = products[0];
      const prod2 = products[1] || products[0];

      if (prod1) {
        const existingCart = await prisma.cartItem.findFirst({ where: { userId: user.id, productId: String(prod1.id) } });
        if (!existingCart) {
          await prisma.cartItem.create({
            data: {
              userId: user.id,
              productId: String(prod1.id),
              name: prod1.name || 'Sample Product',
              price: Number(prod1.price || 0),
              quantity: 1,
              image: prod1.images?.[Object.keys(prod1.images || {})?.[0]]?.[0] || null,
            },
          });
        }

        const existingWishlist = await prisma.wishlistItem.findFirst({ where: { userId: user.id, productId: String(prod2.id) } });
        if (!existingWishlist) {
          await prisma.wishlistItem.create({
            data: {
              userId: user.id,
              productId: String(prod2.id),
              name: prod2.name || 'Sample Product',
              price: Number(prod2.price || 0),
              image: prod2.images?.[Object.keys(prod2.images || {})?.[0]]?.[0] || null,
            },
          });
        }
      }
      // Additional seeding for Abdullah specifically
      if (u.email === 'abdullah@example.com') {
        // create a couple more cart items
        const extraProds = products.slice(2, 5);
        for (const p of extraProds) {
          const pid = String(p.id);
          const exists = await prisma.cartItem.findFirst({ where: { userId: user.id, productId: pid } });
          if (!exists) {
            await prisma.cartItem.create({
              data: {
                userId: user.id,
                productId: pid,
                name: p.name || 'Sample Product',
                price: Number(p.price || 0),
                quantity: 1,
                image: p.images?.[Object.keys(p.images || {})?.[0]]?.[0] || null,
              },
            });
          }
        }

        // create a couple more wishlist items
        const wishProds = products.slice(5, 8);
        for (const p of wishProds) {
          const pid = String(p.id);
          const existsW = await prisma.wishlistItem.findFirst({ where: { userId: user.id, productId: pid } });
          if (!existsW) {
            await prisma.wishlistItem.create({
              data: {
                userId: user.id,
                productId: pid,
                name: p.name || 'Sample Product',
                price: Number(p.price || 0),
                image: p.images?.[Object.keys(p.images || {})?.[0]]?.[0] || null,
              },
            });
          }
        }

        // create an additional delivered order (returnable) and a returned order
        const orderNumber3 = `ORD-${user.id.slice(-6).toUpperCase()}-003`;
        const deliveredOrder = await prisma.order.upsert({
          where: { orderNumber: orderNumber3 },
          update: {
            userId: user.id,
            total: 350,
            status: 'delivered',
          },
          create: {
            userId: user.id,
            orderNumber: orderNumber3,
            total: 350,
            status: 'delivered',
            items: {
              create: [
                {
                  productId: String(products[2]?.id || ''),
                  name: products[2]?.name || 'Delivered Item',
                  price: Number(products[2]?.price || 0),
                  quantity: 1,
                  image: products[2]?.images?.[Object.keys(products[2].images || {})?.[0]]?.[0] || null,
                },
              ],
            },
          },
        });

        const orderNumber4 = `ORD-${user.id.slice(-6).toUpperCase()}-004`;
        const returnedOrder = await prisma.order.upsert({
          where: { orderNumber: orderNumber4 },
          update: {
            userId: user.id,
            total: 150,
            status: 'returned',
          },
          create: {
            userId: user.id,
            orderNumber: orderNumber4,
            total: 150,
            status: 'returned',
            items: {
              create: [
                {
                  productId: String(products[3]?.id || ''),
                  name: products[3]?.name || 'Returned Item',
                  price: Number(products[3]?.price || 0),
                  quantity: 1,
                  image: products[3]?.images?.[Object.keys(products[3].images || {})?.[0]]?.[0] || null,
                },
              ],
            },
          },
        });
      }

      console.log(`Created cart/wishlist items for user ${u.email}`);
    }

    console.log(`Upserted user ${u.email} - ${u.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
