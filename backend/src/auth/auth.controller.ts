import { Controller, Post, Body, Get, Patch, UseGuards, Request, Param, Delete, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, OAuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('oauth')
  async oauth(@Body() oauthDto: OAuthDto) {
    return this.authService.oauthLogin(oauthDto);
  }

  // OAuth2 routes - Uncomment after adding credentials to .env and enabling strategies in auth.module.ts
  /*
  // Google OAuth2
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const result = await this.authService.oauthLogin({
      email: req.user.email,
      name: req.user.firstName + (req.user.lastName ? ' ' + req.user.lastName : ''),
      provider: 'google',
      providerId: req.user.providerId,
    });
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
  }

  // GitHub OAuth2
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Guard redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    const result = await this.authService.oauthLogin({
      email: req.user.email,
      name: req.user.firstName + (req.user.lastName ? ' ' + req.user.lastName : ''),
      provider: 'github',
      providerId: req.user.providerId,
    });
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
  }
  */

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    return this.authService.updateProfile(req.user.id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getOrders(@Request() req) {
    return this.authService.getOrders(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  async getOrder(@Request() req, @Param('id') orderId: string) {
    return this.authService.getOrder(req.user.id, orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orders/:id')
  async updateOrder(@Request() req, @Param('id') orderId: string, @Body() updateData: any) {
    return this.authService.updateOrder(req.user.id, orderId, updateData);
  }

  // Cart endpoints
  @UseGuards(JwtAuthGuard)
  @Get('cart')
  async getCart(@Request() req) {
    return this.authService.getCart(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cart')
  async addToCart(@Request() req, @Body() itemData: any) {
    return this.authService.addToCart(req.user.id, itemData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cart/:id')
  async updateCartItem(@Request() req, @Param('id') itemId: string, @Body() updateData: any) {
    return this.authService.updateCartItem(req.user.id, itemId, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cart/:id')
  async removeCartItem(@Request() req, @Param('id') itemId: string) {
    return this.authService.removeCartItem(req.user.id, itemId);
  }

  // Wishlist endpoints
  @UseGuards(JwtAuthGuard)
  @Get('wishlist')
  async getWishlist(@Request() req) {
    return this.authService.getWishlist(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('wishlist')
  async addToWishlist(@Request() req, @Body() itemData: any) {
    return this.authService.addToWishlist(req.user.id, itemData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('wishlist/:id')
  async removeWishlistItem(@Request() req, @Param('id') itemId: string) {
    return this.authService.removeWishlistItem(req.user.id, itemId);
  }
}
