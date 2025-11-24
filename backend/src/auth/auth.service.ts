import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, OAuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin', // Default role for registration
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async oauthLogin(oauthDto: OAuthDto) {
    const { email, name, provider, providerId } = oauthDto;

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create one
    if (!user) {
      const randomPassword = Math.random().toString(36);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'user',
        },
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      shippingAddress: user.shippingAddress,
      billingAddress: user.billingAddress,
      paymentMethod: user.paymentMethod,
    };
  }

  async updateProfile(userId: string, updateData: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      shippingAddress: user.shippingAddress,
      billingAddress: user.billingAddress,
      paymentMethod: user.paymentMethod,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async getOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new UnauthorizedException('Order not found');
    }

    return order;
  }

  async updateOrder(userId: string, orderId: string, updateData: any) {
    // First check if the order belongs to the user
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new UnauthorizedException('Order not found');
    }

    // Update the order
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
      },
    });

    return updatedOrder;
  }

  // Cart methods
  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
    });
    return items;
  }

  async addToCart(userId: string, itemData: any) {
    const item = await this.prisma.cartItem.create({
      data: {
        userId,
        productId: itemData.productId || itemData.id,
        name: itemData.name,
        price: itemData.price,
        quantity: itemData.quantity || 1,
        image: itemData.image || itemData.firstImagePath || null,
      },
    });
    return item;
  }

  async updateCartItem(userId: string, itemId: string, updateData: any) {
    const existing = await this.prisma.cartItem.findFirst({ where: { id: itemId, userId } });
    if (!existing) throw new UnauthorizedException('Cart item not found');
    const updated = await this.prisma.cartItem.update({ where: { id: itemId }, data: updateData });
    return updated;
  }

  async removeCartItem(userId: string, itemId: string) {
    const existing = await this.prisma.cartItem.findFirst({ where: { id: itemId, userId } });
    if (!existing) throw new UnauthorizedException('Cart item not found');
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Removed' };
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return { message: 'Cart cleared' };
  }

  async createOrder(userId: string, orderData: any) {
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        userId,
        orderNumber,
        total: orderData.total,
        status: 'processing',
        items: {
          create: orderData.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  }

  // Wishlist methods
  async getWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({ where: { userId } });
    return items;
  }

  async addToWishlist(userId: string, itemData: any) {
    // Prevent duplicates by productId for the same user
    const productId = itemData.productId || itemData.id;
    const existing = await this.prisma.wishlistItem.findFirst({ where: { userId, productId } });
    if (existing) return existing;
    const item = await this.prisma.wishlistItem.create({
      data: {
        userId,
        productId,
        name: itemData.name,
        price: itemData.price,
        image: itemData.image || itemData.firstImagePath || null,
      },
    });
    return item;
  }

  async removeWishlistItem(userId: string, itemId: string) {
    const existing = await this.prisma.wishlistItem.findFirst({ where: { id: itemId, userId } });
    if (!existing) throw new UnauthorizedException('Wishlist item not found');
    await this.prisma.wishlistItem.delete({ where: { id: itemId } });
    return { message: 'Removed' };
  }
}
