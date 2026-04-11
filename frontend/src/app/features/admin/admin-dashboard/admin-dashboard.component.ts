import { Component, inject, signal, afterNextRender, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ApiService } from '../../../core/services/api.service';
import { ProductResponse } from '../../../shared/models/product.model';
import { OrderResponse, PageResponse } from '../../../shared/models/order.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouponResponse } from '../../../shared/models/coupon.model';
import { lastValueFrom } from 'rxjs';
import { StoreConfigResponse } from '../../../shared/models/config.model';
import { AnalyticsResponse } from '../../../shared/models/analytics.model';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../shared/models/category.model';
import { Banner, BannerRequest } from '../../../shared/models/banner.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 class="text-3xl md:text-4xl font-sans font-medium text-gray-900">Admin Dashboard</h1>
        @if (!showAddProduct()) {
          <button (click)="addProduct()" class="bg-dv-green text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm">
            <mat-icon class="text-[20px]">add</mat-icon> Add Product
          </button>
        }
      </div>

      @if (showAddProduct()) {
        <section class="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-8">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-2xl font-semibold text-gray-900">{{ editingProductId ? 'Edit Product' : 'Create New Product' }}</h2>
            <button type="button" (click)="cancelEdit()" class="text-gray-500 hover:text-gray-700 p-2"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="addProductForm" (ngSubmit)="submitProduct()" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">Name</label>
              <input formControlName="name" placeholder="e.g. Acoustic Guitar" class="w-full border border-gray-300 focus:border-dv-green focus:ring focus:ring-dv-green/30 rounded-lg px-3 py-2" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">Price (Sale)</label>
              <input formControlName="price" type="number" placeholder="Price" class="w-full border border-gray-300 focus:border-dv-green focus:ring focus:ring-dv-green/30 rounded-lg px-3 py-2" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">Original Price</label>
              <input formControlName="originalPrice" type="number" placeholder="Original Price (optional)" class="w-full border border-gray-300 focus:border-dv-green focus:ring focus:ring-dv-green/30 rounded-lg px-3 py-2" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">Stock</label>
              <input formControlName="stock" type="number" placeholder="Stock" class="w-full border border-gray-300 focus:border-dv-green focus:ring focus:ring-dv-green/30 rounded-lg px-3 py-2" />
            </div>

            <div class="space-y-2">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="block text-xs font-bold text-brand-text mb-1 uppercase tracking-widest">Category</label>
                  <select formControlName="categoryId" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm border py-2 bg-white">
                    <option [value]="'CAT-UNCATEGORIZED'">Uncategorized (Default)</option>
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>

                <!-- Shipping Dimensions -->
                <div class="col-span-2 mt-2">
                   <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-1">Shipping Specs (Shiprocket)</h4>
                   <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Weight (Grams)</label>
                        <input formControlName="weight" type="number" class="block w-full rounded-md border-gray-300 sm:text-sm border p-2" placeholder="e.g. 500">
                      </div>
                      <div class="grid grid-cols-3 gap-2">
                        <div>
                          <label class="block text-[10px] font-bold text-gray-500 mb-1 uppercase">L (cm)</label>
                          <input formControlName="length" type="number" class="block w-full rounded-md border-gray-300 sm:text-sm border p-2">
                        </div>
                        <div>
                          <label class="block text-[10px] font-bold text-gray-500 mb-1 uppercase">B (cm)</label>
                          <input formControlName="breadth" type="number" class="block w-full rounded-md border-gray-300 sm:text-sm border p-2">
                        </div>
                        <div>
                          <label class="block text-[10px] font-bold text-gray-500 mb-1 uppercase">H (cm)</label>
                          <input formControlName="height" type="number" class="block w-full rounded-md border-gray-300 sm:text-sm border p-2">
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">Description</label>
              <textarea formControlName="description" placeholder="Describe the product" rows="4" class="w-full border border-gray-300 focus:border-dv-green focus:ring focus:ring-dv-green/30 rounded-lg px-3 py-2 resize-y"></textarea>
            </div>

            <div class="lg:col-span-2 grid gap-3">
              <label class="text-sm font-medium text-gray-600">Thumbnail image</label>
              
              @if (thumbnailPreview) {
                <div class="relative w-32 h-32 border rounded-lg overflow-hidden group mb-2">
                  <img [src]="thumbnailPreview" class="w-full h-full object-cover">
                  <button type="button" (click)="clearThumbnail()" class="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <mat-icon class="text-sm">delete</mat-icon>
                  </button>
                </div>
              } @else {
                <input type="file" accept="image/*" (change)="onThumbnailSelected($event)" class="w-full border border-gray-300 rounded-lg p-2" />
              }
            </div>

            <div class="lg:col-span-2 grid gap-3">
              <label class="text-sm font-medium text-gray-600">Additional images</label>
              
              <!-- Existing Image URLs preview -->
              @if (existingImageUrls.length > 0) {
                <div class="flex flex-wrap gap-2 mb-2">
                  @for (url of existingImageUrls; track url; let i = $index) {
                    <div class="relative w-24 h-24 border rounded-lg overflow-hidden group">
                      <img [src]="url" class="w-full h-full object-cover">
                      <button type="button" (click)="removeExistingImage(i)" class="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <mat-icon class="text-sm">delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }

              <!-- New Image Upload previews -->
              @if (productImageFiles.length > 0) {
                <div class="flex flex-wrap gap-2 mb-2 mt-2">
                  <p class="w-full text-xs text-gray-500 font-medium">New uploads:</p>
                  @for (img of productImageFiles; track img.url; let i = $index) {
                    <div class="relative w-24 h-24 border rounded-lg overflow-hidden group">
                      <img [src]="img.url" class="w-full h-full object-cover border-2 border-brand-green/30">
                      <button type="button" (click)="removeProductImage(i)" class="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <mat-icon class="text-sm">delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }

              <input type="file" accept="image/*" multiple (change)="onProductImagesSelected($event)" class="w-full border border-gray-300 rounded-lg p-2" />
            </div>

            <div class="lg:col-span-2 grid gap-3">
              <label class="text-sm font-medium text-gray-600">Videos</label>
              
              <!-- Existing Video URLs preview -->
              @if (existingVideoUrls.length > 0) {
                <div class="flex flex-wrap gap-2 mb-2">
                  @for (url of existingVideoUrls; track url; let i = $index) {
                    <div class="relative w-32 h-20 border rounded-lg bg-gray-100 flex items-center justify-center group overflow-hidden">
                      <video [src]="url" class="w-full h-full object-cover"></video>
                      <button type="button" (click)="removeExistingVideo(i)" class="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <mat-icon class="text-sm">delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }

              <!-- New Video Upload previews -->
              @if (productVideoFiles.length > 0) {
                <div class="flex flex-wrap gap-2 mb-2 mt-2">
                  <p class="w-full text-xs text-gray-500 font-medium">New uploads:</p>
                  @for (vid of productVideoFiles; track vid.url; let i = $index) {
                    <div class="relative w-32 h-20 border rounded-lg bg-gray-100 flex items-center justify-center group overflow-hidden border-2 border-brand-green/30">
                      <video [src]="vid.url" class="w-full h-full object-cover"></video>
                      <button type="button" (click)="removeProductVideo(i)" class="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <mat-icon class="text-sm">delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }

              <input type="file" accept="video/*" multiple (change)="onProductVideosSelected($event)" class="w-full border border-gray-300 rounded-lg p-2" />
            </div>

            <div class="lg:col-span-2 flex flex-wrap gap-3 justify-end items-center mt-4">
              <button type="button" (click)="cancelEdit()" class="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium">Cancel</button>
              <button type="submit" [disabled]="addProductForm.invalid || uploading()" class="bg-dv-green disabled:opacity-50 text-white px-8 py-2 rounded-lg shadow-sm hover:bg-green-700 transition font-medium">
                @if (uploading()) {
                  {{ editingProductId ? 'Updating...' : 'Creating...' }}
                } @else {
                  {{ editingProductId ? 'Update Product' : 'Create Product' }}
                }
              </button>
            </div>
          </form>
        </section>
      }

      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8 overflow-x-auto">
          <button (click)="activeTab.set('analytics')" [class.text-dv-green]="activeTab() === 'analytics'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent focus:outline-none">Analytics</button>
          <button (click)="activeTab.set('products')" [class.text-dv-green]="activeTab() === 'products'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent focus:outline-none">Products</button>
          <button (click)="activeTab.set('orders')" [class.text-dv-green]="activeTab() === 'orders'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent focus:outline-none">Orders</button>
          <button (click)="activeTab.set('coupons')" [class.text-dv-green]="activeTab() === 'coupons'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent focus:outline-none">Coupons</button>
          <button (click)="activeTab.set('categories')" [class.text-dv-green]="activeTab() === 'categories'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent focus:outline-none">Categories</button>
          <button (click)="activeTab.set('banners')" [class.text-dv-green]="activeTab() === 'banners'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent focus:outline-none">Banners</button>
          <button (click)="activeTab.set('settings')" [class.text-dv-green]="activeTab() === 'settings'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent focus:outline-none">Store Settings</button>
        </nav>
      </div>

      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        @if (activeTab() === 'analytics') {
          <div class="p-6 space-y-8">
            @if (analytics(); as data) {
              <!-- KPI Cards -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                  <p class="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                  <p class="text-2xl font-bold text-gray-900">{{ data.totalRevenue | currency:'INR':'symbol':'1.0-0' }}</p>
                </div>
                <div class="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                  <p class="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                  <p class="text-2xl font-bold text-gray-900">{{ data.totalOrders }}</p>
                </div>
                <div class="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                  <p class="text-sm font-medium text-gray-500 mb-1">Prepaid Revenue</p>
                  <p class="text-2xl font-bold text-green-700">{{ data.prepaidRevenue | currency:'INR':'symbol':'1.0-0' }}</p>
                  <p class="text-xs text-gray-400 mt-1">From {{ data.prepaidOrders }} orders</p>
                </div>
                <div class="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                  <p class="text-sm font-medium text-gray-500 mb-1">COD Revenue / Expected</p>
                  <p class="text-2xl font-bold text-yellow-600">{{ data.codRevenue | currency:'INR':'symbol':'1.0-0' }}</p>
                  <p class="text-xs text-gray-400 mt-1">From {{ data.codOrders }} orders</p>
                </div>
              </div>

              <!-- Top Selling Products -->
              <div class="mt-8 border border-gray-100 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Top 5 Best Selling Products</h3>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr>
                        <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Product</th>
                        <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Units Sold</th>
                        <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Revenue Gen.</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      @for (metric of data.topSellingProducts; track metric.productId) {
                        <tr class="hover:bg-gray-50 transition-colors">
                          <td class="py-3">
                            <div class="flex items-center gap-3">
                              <img [src]="metric.imageUrl || 'assets/images/placeholder-product.webp'" class="w-10 h-10 object-cover rounded-lg border">
                              <p class="text-sm font-medium text-gray-900 truncate">{{ metric.productName }}</p>
                            </div>
                          </td>
                          <td class="py-3 text-right text-sm font-semibold text-gray-700">{{ metric.totalQuantitySold }}</td>
                          <td class="py-3 text-right text-sm font-bold text-dv-green">{{ metric.totalRevenueGenerated | currency:'INR':'symbol':'1.0-0' }}</td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="3" class="py-8 text-center text-sm text-gray-500">No sales data available yet.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            } @else {
                      <div class="flex items-center justify-center py-20 text-gray-400">
                <mat-icon class="animate-spin mr-2">refresh</mat-icon> Loading analytics...
              </div>
            }
          </div>
        } @else if (activeTab() === 'products') {
          <div class="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row gap-4">
            <div class="relative flex-1">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 scale-90">search</mat-icon>
              <input 
                type="text" 
                [value]="productSearch()"
                (input)="productSearch.set($any($event.target).value)"
                placeholder="Search by name or code..." 
                class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-dv-green/20 focus:border-dv-green outline-none transition-all"
              />
            </div>
            <select 
              [value]="productCategoryFilter() || 'ALL'"
              (change)="productCategoryFilter.set($any($event.target).value)"
              class="md:w-48 pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-dv-green/20 focus:border-dv-green outline-none transition-all bg-white"
            >
              <option value="ALL">All Categories</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
            <select 
              [value]="productSortBy()"
              (change)="productSortBy.set($any($event.target).value)"
              class="md:w-48 pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-dv-green/20 focus:border-dv-green outline-none transition-all bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs">Product</th><th class="px-6 py-3 text-left text-xs">Price</th><th class="px-6 py-3 text-left text-xs">Stock</th><th class="px-6 py-3 text-right text-xs">Actions</th></tr></thead>
              <tbody class="divide-y divide-gray-100">
                @for (p of filteredProducts(); track p.id) {
                  <tr>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <img class="h-10 w-10 rounded-lg object-cover border flex-shrink-0" [src]="p.imageUrl" alt="">
                        <div class="min-w-0">
                          <a [href]="'/products/' + p.id" target="_blank" class="text-sm font-medium text-gray-900 truncate hover:text-dv-green transition-colors">{{ p.name }}</a>
                          <div class="text-xs text-gray-500 truncate w-24 sm:w-full">{{ p.productCode }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm">{{ p.price | currency:'INR':'symbol':'1.0-0' }}</td>
                    <td class="px-6 py-4 text-sm">{{ p.stock }}</td>
                    <td class="px-6 py-4 text-right text-sm flex justify-end gap-2">
                      <button (click)="editProduct(p)" class="text-blue-600 hover:text-blue-800">Edit</button>
                      <button (click)="confirmDelete('product', p.id, p.name)" class="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-12 text-center text-gray-400">
                      <mat-icon class="text-4xl mb-2 opacity-20">search_off</mat-icon>
                      <p>No products match your filters</p>
                      <button (click)="productSearch.set(''); productCategoryFilter.set('ALL')" class="text-dv-green text-sm mt-2 font-medium hover:underline">Clear all filters</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (activeTab() === 'orders') {
          <div class="p-4 md:p-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 class="text-xl font-bold text-gray-800">Order Management</h2>
              <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div class="relative w-full sm:w-auto sm:min-w-[280px]">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 scale-90">search</mat-icon>
                  <input 
                    type="text" 
                    [value]="ordersSearch()"
                    (input)="onSearch($any($event.target).value)"
                    placeholder="Search name, email, phone..." 
                    class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-dv-green/20 focus:border-dv-green outline-none transition-all"
                  />
                </div>
                <!-- Custom Status Dropdown -->
                <div class="relative w-full sm:w-auto" style="min-width:0">
                  <button
                    type="button"
                    (click)="showStatusDropdown.set(!showStatusDropdown())"
                    (blur)="closeStatusDropdownDelayed()"
                    class="w-full sm:min-w-[160px] flex items-center justify-between gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white shadow-sm cursor-pointer hover:border-dv-green transition-colors outline-none focus:ring-2 focus:ring-dv-green/20"
                  >
                    <span class="truncate text-gray-700">{{ statusLabel() }}</span>
                    <mat-icon class="shrink-0 text-gray-400 transition-transform" [class.rotate-180]="showStatusDropdown()">expand_more</mat-icon>
                  </button>
                  @if (showStatusDropdown()) {
                    <div class="absolute left-0 top-full mt-1 w-full sm:min-w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-y-auto max-h-52">
                      @for (opt of statusOptions; track opt.value) {
                        <button
                          type="button"
                          (mousedown)="onFilter(opt.value); showStatusDropdown.set(false)"
                          class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          [class.text-dv-green]="(ordersStatus() || 'ALL') === opt.value"
                          [class.font-semibold]="(ordersStatus() || 'ALL') === opt.value"
                        >
                          {{ opt.label }}
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            @if (!ordersPage()?.content?.length) {
              <div class="flex flex-col items-center justify-center py-24 bg-gradient-to-b from-gray-50 to-white rounded-3xl border border-dashed border-gray-200 shadow-inner">
                <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-gray-100/50">
                  <mat-icon class="text-gray-300 text-3xl h-8 w-8">search_off</mat-icon>
                </div>
                <p class="text-gray-500 font-bold text-lg">No orders matches your search</p>
                <p class="text-gray-400 text-sm mt-1 mb-6 text-center max-w-xs">Adjust your filters or search term to find what you're looking for.</p>
                <button (click)="onSearch(''); onFilter('ALL')" class="flex items-center gap-2 bg-white text-dv-green text-sm font-bold px-6 py-2.5 rounded-xl border border-dv-green shadow-sm hover:bg-green-50 transition-all active:scale-95">
                  <mat-icon class="text-[18px]">filter_list_off</mat-icon> Reset All Filters
                </button>
              </div>
            } @else {
              <div class="space-y-4">
                @for (order of ordersPage()?.content; track order.id) {
                  <div class="group relative bg-white border border-gray-100 rounded-[2rem] p-1 hover:border-dv-green/30 hover:shadow-2xl hover:shadow-dv-green/5 transition-all duration-500 cursor-pointer overflow-hidden" (click)="toggleOrder(order.id)">
                    
                    <div class="p-5 md:p-6 transition-all duration-300" [class.bg-gray-50/50]="expandedOrderId() === order.id">
                      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        
                        <div class="flex-1 min-w-0">
                          <!-- Status Bar -->
                          <div class="flex flex-wrap items-center gap-3 mb-4">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white shadow-sm ring-1 ring-white/10">
                              {{ order.orderNumber }}
                            </span>
                            
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                  [class.bg-amber-100]="order.orderStatus === 'PENDING'"
                                  [class.text-amber-700]="order.orderStatus === 'PENDING'"
                                  [class.bg-sky-100]="order.orderStatus === 'PAYMENT_SUCCESS'"
                                  [class.text-sky-700]="order.orderStatus === 'PAYMENT_SUCCESS'"
                                  [class.bg-indigo-100]="order.orderStatus === 'SHIPPED'"
                                  [class.text-indigo-700]="order.orderStatus === 'SHIPPED'"
                                  [class.bg-emerald-100]="order.orderStatus === 'DELIVERED'"
                                  [class.text-emerald-700]="order.orderStatus === 'DELIVERED'"
                                  [class.bg-rose-100]="order.orderStatus === 'CANCELLED'"
                                  [class.text-rose-700]="order.orderStatus === 'CANCELLED'">
                              <span class="w-1.5 h-1.5 rounded-full mr-2" 
                                    [class.bg-amber-500]="order.orderStatus === 'PENDING'"
                                    [class.bg-sky-500]="order.orderStatus === 'PAYMENT_SUCCESS'"
                                    [class.bg-indigo-500]="order.orderStatus === 'SHIPPED'"
                                    [class.bg-emerald-500]="order.orderStatus === 'DELIVERED'"
                                    [class.bg-rose-500]="order.orderStatus === 'CANCELLED'"></span>
                              {{ order.orderStatus === 'PAYMENT_SUCCESS' ? (order.paymentMethod === 'COD' ? 'ORDER CONFIRMED' : 'PAYMENT SUCCESS') : order.orderStatus.replace('_', ' ') }}
                            </span>

                            <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors shadow-sm"
                                  [class.bg-green-50]="order.paymentStatus === 'SUCCESS'"
                                  [class.text-green-700]="order.paymentStatus === 'SUCCESS'"
                                  [class.border-green-100]="order.paymentStatus === 'SUCCESS'"
                                  [class.bg-amber-50]="order.paymentStatus === 'PENDING' && order.orderStatus !== 'CANCELLED'"
                                  [class.text-amber-700]="order.paymentStatus === 'PENDING' && order.orderStatus !== 'CANCELLED'"
                                  [class.border-amber-100]="order.paymentStatus === 'PENDING' && order.orderStatus !== 'CANCELLED'"
                                  [class.bg-red-50]="order.paymentStatus === 'FAILED' || order.orderStatus === 'CANCELLED'"
                                  [class.text-red-700]="order.paymentStatus === 'FAILED' || order.orderStatus === 'CANCELLED'"
                                  [class.border-red-100]="order.paymentStatus === 'FAILED' || order.orderStatus === 'CANCELLED'">
                              <mat-icon class="text-[12px] w-3 h-3 mr-1">{{ order.paymentStatus === 'SUCCESS' ? 'verified' : ((order.paymentStatus === 'FAILED' || order.orderStatus === 'CANCELLED') ? 'error_outline' : 'schedule') }}</mat-icon>
                              {{ order.orderStatus === 'CANCELLED' ? 'FAILED' : (order.paymentStatus === 'SUCCESS' ? 'PAID' : (order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING' ? 'COD' : order.paymentStatus)) }}
                            </span>
                          </div>

                          <!-- Core Info -->
                          <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                            <div class="flex items-baseline gap-1">
                               <span class="text-gray-400 text-xs font-medium">₹</span>
                               <span class="text-2xl font-black text-gray-900 tracking-tight">{{ order.totalAmount }}</span>
                            </div>
                            
                            <div class="hidden sm:block h-8 w-px bg-gray-200/60 shadow-inner"></div>
                            
                            <div class="min-w-0">
                              <p class="text-sm font-bold text-gray-800 truncate group-hover:text-dv-green transition-colors">{{ order.customerName || 'Guest User' }}</p>
                              <p class="text-xs text-gray-400 font-medium truncate flex items-center gap-1.5">
                                <mat-icon class="text-[14px] w-3.5 h-3.5">mail</mat-icon>
                                {{ order.customerEmail || 'no-email provided' }}
                              </p>
                            </div>
                          </div>

                          <!-- Delivery Tag (Animated on Hover) -->
                          @if (order.trackingId) {
                            <div class="flex items-center gap-2 mt-4 bg-gray-900/5 text-gray-600 w-fit px-3 py-1.5 rounded-xl border border-black/5 hover:bg-gray-900 hover:text-white transition-all duration-300">
                               <mat-icon class="text-[14px] w-3.5 h-3.5">local_shipping</mat-icon>
                               <span class="text-[10px] font-black uppercase tracking-widest">Tracking Info</span>
                               <span class="text-[10px] font-mono opacity-60">#{{ order.trackingId }}</span>
                            </div>
                          }
                        </div>

                        <!-- Date & Expand -->
                        <div class="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100/60">
                          <div class="flex flex-col items-end">
                            <span class="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Created At</span>
                            <span class="text-xs font-bold text-gray-600 bg-white shadow-sm ring-1 ring-black/5 px-3 py-1.5 rounded-xl whitespace-nowrap">
                              {{ order.createdAt ? (order.createdAt | date:'MMM d, yyyy') : 'N/A' }}
                              <span class="text-[10px] font-medium text-gray-400 ml-1">{{ order.createdAt | date:'h:mm a' }}</span>
                            </span>
                          </div>
                          
                          <div class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-dv-green group-hover:text-white transition-all shadow-sm ring-1 ring-black/5 hover:shadow-dv-green/20" [class.rotate-180]="expandedOrderId() === order.id">
                            <mat-icon class="text-[20px]">expand_more</mat-icon>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Expanded Details Panel -->
                    @if (expandedOrderId() === order.id) {
                      <div class="px-6 pb-8 pt-2 animate-fadeIn" (click)="$event.stopPropagation()">
                        <div class="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8"></div>
                        
                        <div class="grid lg:grid-cols-5 gap-8">
                          <!-- Left: Delivery Info -->
                          <div class="lg:col-span-2 space-y-6">
                            <div>
                              <div class="flex items-center gap-3 mb-4">
                                <div class="w-8 h-8 rounded-lg bg-dv-green/10 flex items-center justify-center">
                                  <mat-icon class="text-dv-green text-[18px]">location_on</mat-icon>
                                </div>
                                <h4 class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Shipping Details</h4>
                              </div>
                              
                              <div class="bg-gray-50/80 rounded-[1.5rem] p-5 border border-white shadow-sm ring-1 ring-black/5">
                                 <p class="text-sm font-black text-gray-900 mb-1 flex items-center gap-2">
                                   {{ order.shippingFirstName || order.customerName }} {{ order.shippingLastName || '' }}
                                   <span class="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-black/5 shadow-sm">RECIPIENT</span>
                                 </p>
                                 <p class="text-sm text-gray-600 mt-2 leading-relaxed font-medium">
                                   {{ order.shippingAddress || 'No address provided' }}<br>
                                   <span class="text-gray-400">{{ order.shippingCity || '' }}{{ order.shippingCity && order.shippingState ? ',' : '' }} {{ order.shippingState || '' }} {{ order.shippingPostalCode || '' }}</span>
                                 </p>
                                 
                                 <div class="mt-4 pt-4 border-t border-gray-200/40 flex items-center gap-3">
                                    <div class="p-2 rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                                      <mat-icon class="text-[16px] w-4 h-4 text-dv-green">phone_in_talk</mat-icon>
                                    </div>
                                    <div>
                                      <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Support Contact</p>
                                      <span class="text-xs font-black text-gray-900 tracking-wider">{{ order.shippingPhone || 'N/A' }}</span>
                                    </div>
                                 </div>
                              </div>
                            </div>
                          </div>

                          <!-- Right: Item Breakdown -->
                          <div class="lg:col-span-3">
                            <div class="flex items-center justify-between mb-4">
                              <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                  <mat-icon class="text-amber-500 text-[18px]">shopping_basket</mat-icon>
                                </div>
                                <h4 class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Breakdown</h4>
                              </div>
                              <span class="text-[10px] font-bold bg-gray-50 px-3 py-1 rounded-full border border-black/5">{{ order.items?.length || 0 }} Items</span>
                            </div>
                            
                            <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              @for (item of (order.items || []); track item.productId) {
                                <div class="group/item flex items-center gap-4 bg-white hover:bg-gray-50 border border-gray-100 p-2.5 rounded-[1.25rem] transition-all duration-300 shadow-sm hover:shadow-md ring-1 ring-transparent hover:ring-dv-green/10">
                                  <div class="relative w-14 h-14 rounded-xl border border-gray-100 overflow-hidden shadow-inner flex-shrink-0">
                                    <img [src]="item.imageUrl || 'assets/images/placeholder-product.webp'" class="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500">
                                    <div class="absolute top-1 right-1 w-5 h-5 bg-gray-900 border border-white/20 rounded-lg flex items-center justify-center shadow-lg">
                                       <span class="text-[9px] font-black text-white">{{ item.quantity }}</span>
                                    </div>
                                  </div>
                                  
                                  <div class="min-w-0 flex-1">
                                    <p class="text-xs font-black text-gray-900 truncate tracking-tight mb-0.5">{{ item.productName }}</p>
                                    <div class="flex items-center gap-2">
                                       <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{{ item.unitPrice | currency:'INR':'symbol':'1.0-0' }} per unit</span>
                                       <span class="w-1 h-1 rounded-full bg-gray-200"></span>
                                       <span class="text-[10px] font-bold text-dv-green/80 uppercase tracking-tighter">In Stock Order</span>
                                    </div>
                                  </div>
                                  
                                  <div class="px-4 py-2 bg-gray-50/50 group-hover/item:bg-white rounded-xl text-right transition-colors border border-transparent group-hover/item:border-gray-100">
                                    <p class="text-sm font-black text-gray-900 tracking-tight">{{ (item.quantity * item.unitPrice) | currency:'INR':'symbol':'1.0-0' }}</p>
                                  </div>
                                </div>
                              }
                            </div>
                            
                            <!-- Total Summary -->
                            <div class="mt-6 p-5 bg-gray-900 rounded-[1.5rem] shadow-2xl shadow-gray-900/10">
                              <div class="flex items-center justify-between text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                <span>Grand Billing Total</span>
                                <mat-icon class="text-[16px] w-4 h-4">payments</mat-icon>
                              </div>
                              <div class="flex items-baseline justify-between">
                                <span class="text-white/40 text-xs font-medium">Inclusive of all taxes & shipping</span>
                                <span class="text-2xl font-black text-white tracking-tighter">{{ order.totalAmount | currency:'INR':'symbol':'1.0-0' }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Modern Pagination Footer -->
              @if (ordersPage(); as page) {
                <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p class="text-xs font-medium text-gray-500">
                    Showing <span class="text-gray-900 font-bold">{{ page.content.length }}</span> of <span class="text-gray-900 font-bold">{{ page.totalElements }}</span> total orders
                  </p>
                  <div class="flex items-center gap-2">
                    <button 
                      [disabled]="page.pageNumber === 0"
                      (click)="onPageChange(page.pageNumber - 1)"
                      class="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-white hover:border-dv-green hover:text-dv-green disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-all cursor-pointer"
                    >
                      <mat-icon class="text-[20px]">chevron_left</mat-icon>
                    </button>
                    
                    <div class="flex items-center px-4 h-10 text-xs font-black text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm">
                      PAGE {{ page.pageNumber + 1 }} / {{ page.totalPages || 1 }}
                    </div>

                    <button 
                      [disabled]="page.last || page.totalPages <= 1"
                      (click)="onPageChange(page.pageNumber + 1)"
                      class="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-white hover:border-dv-green hover:text-dv-green disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-all cursor-pointer"
                    >
                      <mat-icon class="text-[20px]">chevron_right</mat-icon>
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        } @else if (activeTab() === 'coupons') {
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-gray-800">Coupon Management</h2>
                <p class="text-sm text-gray-500 mt-0.5">Create and manage active coupon campaigns.</p>
              </div>
              @if (!showCouponForm()) {
                <button (click)="openAddCoupon()" class="flex items-center gap-2 bg-dv-green text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:bg-green-700 transition-colors">
                  <mat-icon class="text-[18px]">add</mat-icon> Add Coupon
                </button>
              }
            </div>

            <!-- Add / Edit Form Panel -->
            @if (showCouponForm()) {
              <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 relative">
                <div class="flex items-center justify-between mb-5">
                  <h3 class="text-md font-semibold text-gray-700">{{ editingCouponId() ? 'Edit Coupon' : 'Issue New Coupon' }}</h3>
                  <button type="button" (click)="closeCouponForm()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                <form [formGroup]="couponForm" (ngSubmit)="saveCoupon()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Coupon Code</label>
                    <input formControlName="code" placeholder="e.g. SUMMER50" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20 font-mono uppercase" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Discount Type</label>
                    <select formControlName="type" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20 bg-white">
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Flat Fixed Amount (₹)</option>
                      <option value="BXGX">Buy X Get Y (BXGX)</option>
                    </select>
                  </div>

                  @if (couponForm.get('type')?.value !== 'BXGX') {
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Discount Amount</label>
                      <input formControlName="discountValue" type="number" placeholder="Percentage or Flat amount" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20" />
                    </div>
                  }

                  @if (couponForm.get('type')?.value === 'BXGX') {
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">BXGX: Buy Qty</label>
                      <input formControlName="buyQty" type="number" placeholder="E.g 1" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">BXGX: Get Qty</label>
                      <input formControlName="getQty" type="number" placeholder="E.g 1" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20" />
                    </div>
                  }

                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Minimum Cart (₹)</label>
                    <input formControlName="minimumCartValue" type="number" placeholder="0 for no minimum" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20" />
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Applicable Product</label>
                    <select formControlName="productId" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20 bg-white">
                      <option value="">Entire Store (All Products)</option>
                      @for (p of products(); track p.id) {
                        <option [value]="p.id">{{ p.name }}</option>
                      }
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Total Store Limits (Empty = ∞)</label>
                    <input formControlName="maxUses" type="number" placeholder="Max uses e.g. 50" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20" />
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Max Per User (Empty = ∞)</label>
                    <input formControlName="maxUsesPerUser" type="number" placeholder="Max per user e.g. 1" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20" />
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Expiration Date</label>
                    <input formControlName="expiresAt" type="datetime-local" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20 text-gray-700" />
                  </div>

                  <div class="flex items-end gap-3 md:col-span-2 lg:col-span-3">
                    <button type="button" (click)="closeCouponForm()" class="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition">Cancel</button>
                    <button type="submit" [disabled]="couponForm.invalid" class="flex-1 bg-dv-green text-white font-medium rounded-lg px-4 py-2.5 shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50">
                      {{ editingCouponId() ? 'Update Coupon' : 'Create Coupon' }}
                    </button>
                  </div>
                </form>
              </div>
            }

            <!-- Coupon List -->
            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Active &amp; Scheduled</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              @for (c of coupons(); track c.id) {
                <div class="border border-gray-100 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1.5">
                        <p class="font-bold text-gray-900 text-lg uppercase tracking-wide truncate">{{ c.code }}</p>
                        <span class="shrink-0 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full">{{ c.type === 'PERCENTAGE' ? '% OFF' : (c.type === 'FIXED' ? 'FLAT OFF' : 'BOGO') }}</span>
                      </div>
                      @if (c.type === 'BXGX') {
                        <p class="text-sm text-gray-500">Buy <span class="font-semibold text-gray-700">{{ c.buyQty }}</span> Get <span class="font-semibold text-gray-700">{{ c.getQty }}</span> free</p>
                      } @else {
                        <p class="text-sm text-gray-500">Discount: <span class="font-semibold text-gray-700">{{ c.type === 'PERCENTAGE' ? (c.discountValue + '%') : (c.discountValue | currency:'INR':'symbol':'1.0-0') }}</span></p>
                      }
                      @if (c.productId) {
                        <p class="text-xs font-semibold text-dv-green mt-1">Specific Product Target</p>
                      } @else {
                        <p class="text-xs text-gray-400 mt-1">Min Cart: <span class="font-semibold">{{ c.minimumCartValue || 0 | currency:'INR':'symbol':'1.0-0' }}</span></p>
                      }
                      <div class="flex gap-3 mt-2">
                        <p class="text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded">Used: <span class="text-gray-900 font-bold">{{ c.usageCount || 0 }}</span> / {{ c.maxUses || '∞' }}</p>
                        <p class="text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded">Limit/User: <span class="text-gray-900 font-bold">{{ c.maxUsesPerUser || '∞' }}</span></p>
                      </div>
                      @if (c.expiresAt) {
                        <div class="flex items-center gap-1 mt-2.5 bg-red-50 text-red-600 w-fit px-2 py-0.5 rounded text-xs font-semibold border border-red-100">
                          <mat-icon class="text-[12px] w-[12px] h-[12px]">timer</mat-icon> Expires {{ c.expiresAt | date:'medium' }}
                        </div>
                      }
                    </div>
                    <!-- Actions -->
                    <div class="flex flex-col gap-1 shrink-0">
                      <button (click)="editCoupon(c)" class="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition flex items-center justify-center" title="Edit">
                        <mat-icon class="text-[20px]">edit</mat-icon>
                      </button>
                      <button (click)="confirmDelete('coupon', c.id, c.code)" class="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 flex items-center justify-center" title="Delete">
                        <mat-icon class="text-[20px]">delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center">
                  <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <mat-icon class="text-gray-400">local_offer</mat-icon>
                  </div>
                  <p class="text-sm font-medium text-gray-900">No promotional coupons yet</p>
                  <p class="text-xs text-gray-500 mt-1">Click <strong>Add Coupon</strong> above to create one.</p>
                </div>
              }
            </div>
          </div>
        } @else if (activeTab() === 'settings') {
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-gray-800">Global Store Configuration</h2>
              @if (!editConfigMode()) {
                 <button type="button" (click)="enableConfigEdit()" class="text-sm font-medium text-dv-green border border-dv-green rounded-lg px-4 py-1.5 hover:bg-green-50 transition-colors">Edit Settings</button>
              } @else {
                 <button type="button" (click)="cancelConfigEdit()" class="text-sm font-medium text-gray-500 hover:text-gray-700 underline text-right">Cancel Edit</button>
              }
            </div>

            <form [formGroup]="configForm" (ngSubmit)="saveConfig()" class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl" [class.opacity-60]="!editConfigMode()">
              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Free Shipping Threshold</label>
                <p class="text-xs text-gray-500 mb-3">Orders above this amount will qualify for completely free shipping.</p>
                <div class="relative rounded-md shadow-sm">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span class="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input formControlName="freeShippingThreshold" type="number" class="block w-full rounded-md border-gray-300 pl-7 focus:border-dv-green focus:ring-dv-green sm:text-sm border py-2 disabled:bg-gray-100" placeholder="e.g. 5000">
                </div>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Standard Shipping Cost</label>
                <p class="text-xs text-gray-500 mb-3">The flat shipping fee explicitly applied to all standard orders.</p>
                <div class="relative rounded-md shadow-sm">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span class="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input formControlName="standardShippingCost" type="number" class="block w-full rounded-md border-gray-300 pl-7 focus:border-dv-green focus:ring-dv-green sm:text-sm border py-2 disabled:bg-gray-100" placeholder="e.g. 150">
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Cash on Delivery (COD) Fee</label>
                <p class="text-xs text-gray-500 mb-3">The extra handling charge applied if the buyer chooses COD.</p>
                <div class="relative rounded-md shadow-sm">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span class="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input formControlName="codFee" type="number" class="block w-full rounded-md border-gray-300 pl-7 focus:border-dv-green focus:ring-dv-green sm:text-sm border py-2 disabled:bg-gray-100" placeholder="e.g. 50">
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Cancellation Window (Hours)</label>
                <p class="text-xs text-gray-500 mb-3">Orders pending payment will be automatically cancelled after this many hours.</p>
                <div class="relative rounded-md shadow-sm">
                  <input formControlName="cancellationWindowHours" type="number" class="block w-full rounded-md border-gray-300 focus:border-dv-green focus:ring-dv-green sm:text-sm border py-2 px-3 disabled:bg-gray-100" placeholder="e.g. 2">
                </div>
              </div>
              
              @if (editConfigMode()) {
                <div class="md:col-span-2 pt-4 flex justify-end">
                  <button type="submit" [disabled]="configForm.invalid || !configForm.dirty" class="bg-dv-green text-white rounded-lg px-6 py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">Save Configuration</button>
                </div>
              }
            </form>
          </div>
        } @else if (activeTab() === 'banners') {
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-gray-800">Banner Management</h2>
                <p class="text-sm text-gray-500">Create global announcement banners for marketing.</p>
              </div>
              @if (!showBannerForm()) {
                <button (click)="openAddBanner()" class="bg-dv-green text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm">
                  <mat-icon class="text-[18px]">add</mat-icon> Add Banner
                </button>
              }
            </div>

            @if (showBannerForm()) {
              <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
                <h3 class="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">{{ editingBannerId() ? 'Edit Banner' : 'Create Banner' }}</h3>
                <form [formGroup]="bannerForm" (ngSubmit)="saveBanner()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="col-span-2 space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Banner Content (HTML supported)</label>
                    <textarea formControlName="content" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. <b>50% OFF</b> on all guitars!"></textarea>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Type</label>
                    <select formControlName="type" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="INFO">Info (Green)</option>
                      <option value="SALE">Sale (Gold)</option>
                      <option value="ALERT">Alert (Red)</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Priority (Higher shows first)</label>
                    <input formControlName="priority" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Redirect Link (e.g. /products)</label>
                    <input formControlName="link" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Expiry Date (for Countdown)</label>
                    <input formControlName="expiryDate" type="datetime-local" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div class="flex items-center gap-6 py-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" formControlName="active" class="w-4 h-4 text-dv-green rounded focus:ring-dv-green/30" />
                      <span class="text-sm font-medium text-gray-700">Published</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" formControlName="canDismiss" class="w-4 h-4 text-dv-green rounded focus:ring-dv-green/30" />
                      <span class="text-sm font-medium text-gray-700">User can dismiss</span>
                    </label>
                  </div>
                  <div class="col-span-2 flex items-center gap-3 pt-2">
                    <button type="button" (click)="closeBannerForm()" class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 transition">Cancel</button>
                    <button type="submit" [disabled]="bannerForm.invalid" class="bg-dv-green text-white px-6 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-green-700 transition">Save Banner</button>
                  </div>
                </form>
              </div>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (b of banners(); track b.id) {
                <div class="border border-gray-100 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div class="absolute top-0 right-0 p-2 flex gap-1">
                    <button (click)="editBanner(b)" class="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"><mat-icon class="text-[18px]">edit</mat-icon></button>
                    <button (click)="confirmDelete('banner', b.id, 'Banner ' + b.priority)" class="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"><mat-icon class="text-[18px]">delete</mat-icon></button>
                  </div>
                  <div class="flex items-center gap-3 mb-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase border"
                          [class.bg-green-50]="b.type === 'INFO'" [class.text-green-700]="b.type === 'INFO'"
                          [class.bg-amber-50]="b.type === 'SALE'" [class.text-amber-700]="b.type === 'SALE'"
                          [class.bg-red-50]="b.type === 'ALERT'" [class.text-red-700]="b.type === 'ALERT'">
                      {{ b.type }}
                    </span>
                    <span class="text-[10px] font-bold text-gray-400">PRIORITY: {{ b.priority }}</span>
                    @if (!b.active) {
                      <span class="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Draft</span>
                    }
                  </div>
                  <p class="text-sm font-medium text-gray-900 mb-2 truncate">{{ b.content }}</p>
                  <div class="flex flex-wrap gap-2 items-center text-[10px] font-bold text-gray-400">
                    <span class="flex items-center gap-1"><mat-icon class="text-[12px] w-3 h-3">link</mat-icon> {{ b.link || 'No link' }}</span>
                    @if (b.expiryDate) {
                      <span class="flex items-center gap-1 text-amber-600"><mat-icon class="text-[12px] w-3 h-3">timer</mat-icon> {{ b.expiryDate | date:'short' }}</span>
                    }
                    @if (b.canDismiss) {
                      <span class="flex items-center gap-1 text-dv-green"><mat-icon class="text-[12px] w-3 h-3">check_circle_outline</mat-icon> Dismissible</span>
                    }
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                  <mat-icon class="text-4xl mb-2">campaign</mat-icon>
                  <p>No banners created yet.</p>
                </div>
              }
            </div>
          </div>
        } @else if (activeTab() === 'categories') {
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-gray-800">Category Management</h2>
                <p class="text-sm text-gray-500">Organize your products into meaningful groups.</p>
              </div>
              @if (!showCategoryForm()) {
                <button (click)="openAddCategory()" class="bg-dv-green text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm">
                  <mat-icon class="text-[18px]">add</mat-icon> Add Category
                </button>
              }
            </div>

            @if (showCategoryForm()) {
              <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
                <h3 class="text-md font-semibold text-gray-700 mb-4">{{ editingCategoryId() ? 'Edit Category' : 'Create Category' }}</h3>
                <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()" class="space-y-4 max-w-2xl">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-gray-500 uppercase">Name</label>
                      <input formControlName="name" placeholder="e.g. Incense Sticks" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-gray-500 uppercase">Slug</label>
                      <input formControlName="slug" placeholder="e.g. incense-sticks" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20" />
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Description (optional)</label>
                    <textarea formControlName="description" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-dv-green focus:ring focus:ring-dv-green/20"></textarea>
                  </div>

                  <div class="space-y-1 md:col-span-2 mt-4">
                    <label class="text-xs font-bold text-gray-500 uppercase">Category Image</label>
                    @if (categoryImagePreview) {
                      <div class="relative w-40 h-40 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        <img [src]="categoryImagePreview" class="w-full h-full object-cover">
                        <button type="button" (click)="clearCategoryImage()" class="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition">
                          <mat-icon class="text-[18px]">close</mat-icon>
                        </button>
                      </div>
                    } @else {
                      <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-dv-green/50 transition cursor-pointer w-full" (click)="catImageInput.click()">
                        <mat-icon class="text-gray-400 text-3xl mb-2">image</mat-icon>
                        <p class="text-sm text-gray-600 font-medium">Upload Image</p>
                      </div>
                    }
                    <input #catImageInput type="file" accept="image/*" class="hidden" (change)="onCategoryImageSelected($event)">
                  </div>

                  <div class="flex items-center gap-3 pt-4">
                    <button type="button" (click)="closeCategoryForm()" class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 transition">Cancel</button>
                    <button type="submit" [disabled]="categoryForm.invalid || uploading()" class="bg-dv-green text-white px-6 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-green-700 transition disabled:opacity-50">
                      @if(uploading()) {
                        <mat-icon class="animate-spin text-[18px]">refresh</mat-icon>
                      } @else {
                        Save Category
                      }
                    </button>
                  </div>
                </form>
              </div>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (cat of categories(); track cat.id) {
                <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex justify-between items-start">
                  <div>
                    <p class="font-bold text-gray-900">{{ cat.name }}</p>
                    <p class="text-xs text-gray-500 font-mono">{{ cat.slug }}</p>
                    @if (cat.description) {
                      <p class="text-xs text-gray-400 mt-2 line-clamp-2">{{ cat.description }}</p>
                    }
                  </div>
                  <div class="flex gap-1">
                    <button (click)="editCategory(cat)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><mat-icon class="text-[20px]">edit</mat-icon></button>
                    <button (click)="confirmDelete('category', cat.id, cat.name)" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><mat-icon class="text-[20px]">delete</mat-icon></button>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                  <mat-icon class="text-4xl mb-2">category</mat-icon>
                  <p>No categories defined yet.</p>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {
  private api = inject(ApiService);
  private snackbar = inject(SnackbarService);
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private confirmService = inject(ConfirmService);

  activeTab = signal<'products' | 'orders' | 'coupons' | 'settings' | 'analytics' | 'categories' | 'banners'>('analytics');
  expandedOrderId = signal<string | null>(null);
  showAddProduct = signal(false);
  showAdvanced = signal(false);
  uploading = signal(false);
  showCouponForm = signal(false);
  editingCouponId = signal<string | null>(null);
  showStatusDropdown = signal(false);

  // Categories
  categories = signal<Category[]>([]);
  showCategoryForm = signal(false);
  editingCategoryId = signal<string | null>(null);
  categoryForm = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    description: [''],
    imageUrl: [''],
    active: [true]
  });

  categoryImageFile: File | null = null;
  categoryImagePreview: string | null = null;

  onCategoryImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) || null;
    this.categoryImageFile = file;
    this.categoryImagePreview = file ? URL.createObjectURL(file) : null;
  }

  clearCategoryImage() {
    this.categoryImageFile = null;
    this.categoryImagePreview = null;
    this.categoryForm.patchValue({ imageUrl: '' });
  }

  // Banners
  banners = signal<Banner[]>([]);
  showBannerForm = signal(false);
  editingBannerId = signal<string | null>(null);
  bannerForm = this.fb.group({
    content: ['', Validators.required],
    type: ['INFO', Validators.required],
    link: [''],
    priority: [0],
    active: [true],
    canDismiss: [true],
    expiryDate: [null as string | null]
  });

  products = signal<ProductResponse[]>([]);
  ordersPage = signal<PageResponse<OrderResponse> | null>(null);
  ordersSearch = signal<string>('');
  ordersStatus = signal<string | null>(null);
  ordersCurrentPage = signal<number>(0);
  coupons = signal<CouponResponse[]>([]);
  analytics = signal<AnalyticsResponse | null>(null);

  productSearch = signal<string>('');
  productCategoryFilter = signal<string | null>(null);
  productSortBy = signal<string>('newest');

  filteredProducts = computed(() => {
    let list = [...this.products()];

    // Filter by search
    const search = this.productSearch().toLowerCase().trim();
    if (search) {
      list = list.filter(p => 
        (p.name?.toLowerCase() || '').includes(search) || 
        (p.productCode?.toLowerCase() || '').includes(search)
      );
    }

    // Filter by category
    const cat = this.productCategoryFilter();
    if (cat && cat !== 'ALL') {
      list = list.filter(p => p.categoryId === cat);
    }

    // Sort
    const sort = this.productSortBy();
    list.sort((a, b) => {
      switch (sort) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'stock_asc': return a.stock - b.stock;
        case 'stock_desc': return b.stock - a.stock;
        case 'name': return a.name.localeCompare(b.name);
        case 'newest':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        case 'popularity':
          return (b.salesCount || 0) - (a.salesCount || 0);
        default:
          return 0;
      }
    });

    return list;
  });

  readonly statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending Payment' },
    { value: 'PAYMENT_SUCCESS', label: 'Order Confirmed' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  statusLabel() {
    return this.statusOptions.find(o => o.value === (this.ordersStatus() || 'ALL'))?.label ?? 'All Statuses';
  }

  closeStatusDropdownDelayed() {
    setTimeout(() => this.showStatusDropdown.set(false), 150);
  }

  toggleOrder(id: string) {
    if (this.expandedOrderId() === id) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(id);
    }
  }

  addProductForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    originalPrice: [null as number | null],
    stock: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    categoryId: ['CAT-UNCATEGORIZED'],
    weight: [null as number | null],
    length: [null as number | null],
    breadth: [null as number | null],
    height: [null as number | null]
  });

  editingProductId: string | null = null;
  thumbnailFile: File | null = null;
  thumbnailPreview: string | null = null;
  productImageFiles: Array<{ file: File; url: string }> = [];
  productVideoFiles: Array<{ file: File; url: string }> = [];
  existingImageUrls: string[] = [];
  existingVideoUrls: string[] = [];

  removeExistingImage(index: number) {
    this.existingImageUrls.splice(index, 1);
  }

  removeExistingVideo(index: number) {
    this.existingVideoUrls.splice(index, 1);
  }

  couponForm = this.fb.group({
    code: ['', Validators.required],
    type: ['PERCENTAGE', Validators.required],
    discountValue: [0],
    minimumCartValue: [0],
    buyQty: [1],
    getQty: [1],
    productId: [''],
    active: [true],
    expiresAt: [''],
    maxUses: [null as number | null],
    maxUsesPerUser: [null as number | null]
  });

  configForm = this.fb.group({
    freeShippingThreshold: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    standardShippingCost: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    codFee: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    cancellationWindowHours: [{ value: 2, disabled: true }, [Validators.required, Validators.min(1)]]
  });

  editConfigMode = signal(false);

  enableConfigEdit() {
    this.editConfigMode.set(true);
    this.configForm.enable();
  }

  cancelConfigEdit() {
    this.editConfigMode.set(false);
    this.configForm.disable();
    // reload to original state if needed
    this.loadDashboardData();
  }

  constructor() {
    afterNextRender(() => {
      this.loadDashboardData();
    });
  }

  onThumbnailSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) || null;
    this.thumbnailFile = file;
    this.thumbnailPreview = file ? URL.createObjectURL(file) : null;
  }

  clearThumbnail() {
    this.thumbnailFile = null;
    this.thumbnailPreview = null;
    this.addProductForm.patchValue({ imageUrl: '' });
  }

  onProductImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.productImageFiles = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
  }

  removeProductImage(index: number) {
    this.productImageFiles.splice(index, 1);
  }

  onProductVideosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.productVideoFiles = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
  }

  removeProductVideo(index: number) {
    this.productVideoFiles.splice(index, 1);
  }

  private async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await lastValueFrom(this.api.post<{ url: string }>('/admin/upload', formData));
    return response.url;
  }

  private async uploadProductMedia(): Promise<{ thumbnail?: string; images: string[]; videos: string[] }> {
    this.uploading.set(true);
    const uploadedImages: string[] = [];
    const uploadedVideos: string[] = [];
    let thumbnail: string | undefined;

    if (this.thumbnailFile) {
      thumbnail = await this.uploadFile(this.thumbnailFile);
    }

    if (this.productImageFiles?.length) {
      const results = await Promise.all(this.productImageFiles.map((entry) => this.uploadFile(entry.file)));
      uploadedImages.push(...results);
    }

    if (this.productVideoFiles?.length) {
      const results = await Promise.all(this.productVideoFiles.map((entry) => this.uploadFile(entry.file)));
      uploadedVideos.push(...results);
    }

    this.uploading.set(false);
    return { thumbnail, images: uploadedImages, videos: uploadedVideos };
  }

  loadDashboardData() {
    this.api.get<ProductResponse[]>('/products').subscribe({ next: (products) => this.products.set(products) });
    this.fetchOrders();
    this.api.get<CouponResponse[]>('/admin/coupons').subscribe({ next: (coupons) => this.coupons.set(coupons) });
    this.api.get<StoreConfigResponse>('/config').subscribe({ next: (config) => this.configForm.patchValue(config) });
    this.api.get<AnalyticsResponse>('/admin/analytics').subscribe({ next: (analytics) => this.analytics.set(analytics) });
    this.categoryService.getAdminCategories().subscribe({ next: (cats) => this.categories.set(cats.filter(c => c.id !== 'CAT-UNCATEGORIZED')) });
    this.api.get<Banner[]>('/admin/banners').subscribe({ next: (banners) => this.banners.set(banners) });
  }

  onSearch(query: string) {
    this.ordersSearch.set(query);
    this.ordersCurrentPage.set(0);
    this.fetchOrders();
  }

  onFilter(status: string | null) {
    this.ordersStatus.set(status === 'ALL' ? null : status);
    this.ordersCurrentPage.set(0);
    this.fetchOrders();
  }

  onPageChange(page: number) {
    this.ordersCurrentPage.set(page);
    this.fetchOrders();
  }

  fetchOrders() {
    const params: any = {
      page: this.ordersCurrentPage(),
      size: 10
    };
    if (this.ordersSearch()) params.search = this.ordersSearch();
    if (this.ordersStatus()) params.status = this.ordersStatus();

    this.api.get<PageResponse<OrderResponse>>('/admin/orders', params).subscribe({
      next: (page) => this.ordersPage.set(page),
      error: () => this.snackbar.showError('Failed to load orders')
    });
  }

  addProduct() { 
    this.editingProductId = null;
    this.showAddProduct.set(true); 
    this.addProductForm.reset({ name: '', description: '', price: 0, originalPrice: null, stock: 0, imageUrl: '', categoryId: 'CAT-UNCATEGORIZED' });
    this.clearThumbnail();
    this.productImageFiles = [];
    this.productVideoFiles = [];
    this.existingImageUrls = [];
    this.existingVideoUrls = [];
  }

  cancelEdit() {
    this.showAddProduct.set(false);
    this.editingProductId = null;
    this.addProductForm.reset();
  }

  confirmDelete(type: 'product' | 'coupon' | 'category' | 'banner', id: string, name: string) {
    const message = `Are you sure you want to delete "${name}"?`;
    let warning = '';
    
    if (type === 'category') {
      const count = this.products().filter(p => p.categoryId === id).length;
      if (count > 0) {
        warning = `This category has ${count} products. They will be reassigned to "Uncategorized".`;
      }
    }

    this.confirmService.confirm({
      title: `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}?`,
      message: message,
      warning: warning,
      confirmText: 'Delete',
      isDestructive: true
    }).subscribe(confirmed => {
      if (confirmed) {
        this.executeDelete(type, id);
      }
    });
  }

  private executeDelete(type: string, id: string) {
    if (type === 'product') {
      this.api.delete<void>(`/admin/products/${id}`).subscribe({ 
        next: () => {
          this.products.update(items => items.filter(p => p.id !== id));
          this.snackbar.showSuccess('Product deleted successfully');
        },
        error: () => this.snackbar.showError('Unable to delete product')
      });
    } else if (type === 'coupon') {
      this.api.delete<void>(`/admin/coupons/${id}`).subscribe({
        next: () => {
          this.coupons.update(list => list.filter(c => c.id !== id));
          this.snackbar.showSuccess('Coupon deleted successfully');
        },
        error: () => this.snackbar.showError('Unable to delete coupon')
      });
    } else if (type === 'category') {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categories.update(list => list.filter(c => c.id !== id));
          this.snackbar.showSuccess('Category deleted successfully');
          // Update local product collection since their category ID changed to UNCATEGORIZED on backend
          this.loadDashboardData(); 
        },
        error: () => this.snackbar.showError('Unable to delete category. Ensure it has no products.')
      });
    } else if (type === 'banner') {
      this.api.delete<void>(`/admin/banners/${id}`).subscribe({
        next: () => {
          this.banners.update(list => list.filter(b => b.id !== id));
          this.snackbar.showSuccess('Banner deleted');
        },
        error: () => this.snackbar.showError('Failed to delete banner')
      });
    }
  }

  saveConfig() {
    if (this.configForm.valid) {
      this.api.put<StoreConfigResponse>('/admin/config', this.configForm.value).subscribe({
        next: (config) => {
          this.configForm.patchValue(config);
          this.configForm.markAsPristine();
          this.editConfigMode.set(false);
          this.configForm.disable();
          this.snackbar.showSuccess('Store configuration updated successfully');
        },
        error: () => this.snackbar.showError('Failed to update store configuration')
      });
    }
  }

  editProduct(product: ProductResponse) {
    this.editingProductId = product.id;
    this.showAddProduct.set(true);
    this.addProductForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId || 'CAT-UNCATEGORIZED',
      weight: product.weight || null,
      length: product.length || null,
      breadth: product.breadth || null,
      height: product.height || null
    });
    this.thumbnailPreview = product.imageUrl || null;
    this.existingImageUrls = product.imageUrls ? [...product.imageUrls] : [];
    this.existingVideoUrls = product.videoUrls ? [...product.videoUrls] : [];
  }

  async submitProduct() {
    if (this.addProductForm.invalid) return;

    try {
      const media = await this.uploadProductMedia();

      const payload = {
        ...this.addProductForm.value,
        imageUrl: media.thumbnail || this.addProductForm.value.imageUrl || '',
        imageUrls: [...(media.images || []), ...this.existingImageUrls],
        videoUrls: [...(media.videos || []), ...this.existingVideoUrls]
      };

      const request$ = this.editingProductId
        ? this.api.put<ProductResponse>(`/admin/products/${this.editingProductId}`, payload)
        : this.api.post<ProductResponse>('/admin/products', payload);

      request$.subscribe({
        next: (product) => {
          if (this.editingProductId) {
            this.products.update(items => items.map(item => item.id === product.id ? product : item));
          } else {
            this.products.update(items => [product, ...items]);
          }
          this.editingProductId = null;
          this.showAddProduct.set(false);
          this.addProductForm.reset({ name: '', description: '', price: 0, originalPrice: null, stock: 0, imageUrl: '', categoryId: 'CAT-UNCATEGORIZED', weight: null, length: null, breadth: null, height: null });
          this.thumbnailFile = null;
          this.thumbnailPreview = null;
          this.productImageFiles = [];
          this.productVideoFiles = [];
          this.existingImageUrls = [];
          this.existingVideoUrls = [];
          this.showAdvanced.set(false);
        },
        error: () => this.snackbar.showError('Unable to create product.')
      });
    } catch (err) {
      this.snackbar.showError('File upload failed. Please check file type and try again.');
    }
  }

  openAddCoupon() {
    this.editingCouponId.set(null);
    this.couponForm.reset({ code: '', type: 'PERCENTAGE', discountValue: 0, minimumCartValue: 0, buyQty: 1, getQty: 1, productId: '', active: true, expiresAt: '', maxUses: null, maxUsesPerUser: null });
    this.showCouponForm.set(true);
  }

  closeCouponForm() {
    this.showCouponForm.set(false);
    this.editingCouponId.set(null);
    this.couponForm.reset({ code: '', type: 'PERCENTAGE', discountValue: 0, minimumCartValue: 0, buyQty: 1, getQty: 1, productId: '', active: true, expiresAt: '', maxUses: null, maxUsesPerUser: null });
  }

  editCoupon(c: CouponResponse) {
    this.editingCouponId.set(c.id);
    const expiresAtLocal = c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : '';
    this.couponForm.patchValue({
      code: c.code,
      type: c.type,
      discountValue: c.discountValue,
      minimumCartValue: c.minimumCartValue,
      buyQty: c.buyQty,
      getQty: c.getQty,
      productId: c.productId || '',
      active: c.active,
      expiresAt: expiresAtLocal,
      maxUses: c.maxUses ?? null,
      maxUsesPerUser: c.maxUsesPerUser ?? null
    });
    this.showCouponForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveCoupon() {
    if (this.couponForm.invalid) return;

    const payload: any = { ...this.couponForm.value };
    payload.expiresAt = payload.expiresAt ? new Date(payload.expiresAt).toISOString() : null;
    if (!payload.productId) payload.productId = null;

    const id = this.editingCouponId();
    const request$ = id
      ? this.api.put<CouponResponse>(`/admin/coupons/${id}`, payload)
      : this.api.post<CouponResponse>('/admin/coupons', payload);

    request$.subscribe({
      next: (coupon) => {
        if (id) {
          this.coupons.update(list => list.map(c => c.id === coupon.id ? coupon : c));
          this.snackbar.showSuccess('Coupon updated successfully');
        } else {
          this.coupons.update(list => [coupon, ...list]);
          this.snackbar.showSuccess('Coupon created successfully');
        }
        this.closeCouponForm();
      },
      error: () => this.snackbar.showError(id ? 'Unable to update coupon.' : 'Unable to create coupon.')
    });
  }

  createCoupon() { this.saveCoupon(); }

  // Category Methods
  openAddCategory() {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({ active: true, imageUrl: '' });
    this.clearCategoryImage();
    this.showCategoryForm.set(true);
  }

  editCategory(cat: Category) {
    this.editingCategoryId.set(cat.id);
    this.categoryForm.patchValue({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl || '',
      active: cat.active
    });
    this.categoryImagePreview = cat.imageUrl || null;
    this.categoryImageFile = null;
    this.showCategoryForm.set(true);
  }

  closeCategoryForm() {
    this.showCategoryForm.set(false);
    this.editingCategoryId.set(null);
    this.categoryForm.reset({ active: true, imageUrl: '' });
    this.clearCategoryImage();
  }

  async saveCategory() {
    if (this.categoryForm.invalid) return;
    this.uploading.set(true);

    try {
      let finalImageUrl = this.categoryForm.value.imageUrl || '';
      if (this.categoryImageFile) {
        finalImageUrl = await this.uploadFile(this.categoryImageFile);
      }

      const payload = { ...this.categoryForm.value, imageUrl: finalImageUrl } as Partial<Category>;
      const id = this.editingCategoryId();
      
      const request$ = id 
        ? this.categoryService.updateCategory(id, payload)
        : this.categoryService.createCategory(payload);

      request$.subscribe({
        next: (cat) => {
          if (id) {
            this.categories.update(list => list.map(c => c.id === cat.id ? cat : c));
            this.snackbar.showSuccess('Category updated');
          } else {
            this.categories.update(list => [...list, cat]);
            this.snackbar.showSuccess('Category created');
          }
          this.closeCategoryForm();
          this.uploading.set(false);
        },
        error: () => {
          this.snackbar.showError('Failed to save category');
          this.uploading.set(false);
        }
      });
    } catch (err) {
      this.snackbar.showError('Image upload failed');
      this.uploading.set(false);
    }
  }

  // Banner Methods
  openAddBanner() {
    this.editingBannerId.set(null);
    this.bannerForm.reset({ active: true, type: 'INFO', priority: 0, canDismiss: true });
    this.showBannerForm.set(true);
  }

  editBanner(banner: Banner) {
    this.editingBannerId.set(banner.id);
    this.bannerForm.patchValue({
      content: banner.content,
      type: banner.type,
      link: banner.link,
      priority: banner.priority,
      active: banner.active,
      canDismiss: banner.canDismiss,
      expiryDate: banner.expiryDate ? new Date(banner.expiryDate).toISOString().slice(0, 16) : null
    });
    this.showBannerForm.set(true);
  }

  closeBannerForm() {
    this.showBannerForm.set(false);
    this.editingBannerId.set(null);
    this.bannerForm.reset();
  }

  saveBanner() {
    if (this.bannerForm.invalid) return;
    const payload = this.bannerForm.getRawValue() as BannerRequest;
    if (payload.expiryDate) {
      payload.expiryDate = new Date(payload.expiryDate).toISOString();
    }
    
    const id = this.editingBannerId();
    const request$ = id 
      ? this.api.put<Banner>(`/admin/banners/${id}`, payload)
      : this.api.post<Banner>('/admin/banners', payload);

    request$.subscribe({
      next: (res) => {
        if (id) {
          this.banners.update(list => list.map(b => b.id === res.id ? res : b));
          this.snackbar.showSuccess('Banner updated');
        } else {
          this.banners.update(list => [res, ...list]);
          this.snackbar.showSuccess('Banner created');
        }
        this.closeBannerForm();
      },
      error: () => this.snackbar.showError('Failed to save banner')
    });
  }
}
