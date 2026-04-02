import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ApiService } from '../../../core/services/api.service';
import { ProductResponse } from '../../../shared/models/product.model';
import { OrderResponse } from '../../../shared/models/order.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouponResponse } from '../../../shared/models/coupon.model';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl md:text-4xl font-sans font-medium text-gray-900">Admin Dashboard</h1>
        <button (click)="addProduct()" class="bg-dv-green text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm">
          <mat-icon class="text-[20px]">add</mat-icon> Add Product
        </button>
      </div>

      @if (showAddProduct()) {
        <section class="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-8">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-2xl font-semibold text-gray-900">Create New Product</h2>
            <button type="button" (click)="showAddProduct.set(false)" class="text-gray-500 hover:text-gray-700">Close</button>
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
              <label class="text-sm font-medium text-gray-600">Description</label>
              <textarea formControlName="description" placeholder="Describe the product" rows="4" class="w-full border border-gray-300 focus:border-dv-green focus:ring focus:ring-dv-green/30 rounded-lg px-3 py-2 resize-y"></textarea>
            </div>

            <div class="lg:col-span-2 grid gap-3">
              <label class="text-sm font-medium text-gray-600">Thumbnail image</label>
              <input type="file" accept="image/*" (change)="onThumbnailSelected($event)" class="w-full border border-gray-300 rounded-lg p-2" />
              <input formControlName="imageUrl" placeholder="Thumbnail URL fallback" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
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

              <input type="file" accept="video/*" multiple (change)="onProductVideosSelected($event)" class="w-full border border-gray-300 rounded-lg p-2" />
            </div>

            <div class="lg:col-span-2 flex flex-wrap gap-3 justify-end">
              <button type="submit" [disabled]="addProductForm.invalid || uploading()" class="bg-dv-green disabled:opacity-50 text-white px-5 py-2 rounded-lg shadow-sm hover:bg-green-700 transition">
                {{ uploading() ? 'Creating...' : 'Create Product' }}
              </button>
              <button type="button" (click)="showAddProduct.set(false)" class="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 transition">Cancel</button>
            </div>
          </form>
        </section>
      }

      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button (click)="activeTab.set('products')" [class.text-dv-green]="activeTab() === 'products'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Products</button>
          <button (click)="activeTab.set('orders')" [class.text-dv-green]="activeTab() === 'orders'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Orders</button>
          <button (click)="activeTab.set('coupons')" [class.text-dv-green]="activeTab() === 'coupons'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Coupons</button>
        </nav>
      </div>

      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        @if (activeTab() === 'products') {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs">Product</th><th class="px-6 py-3 text-left text-xs">Price</th><th class="px-6 py-3 text-left text-xs">Stock</th><th class="px-6 py-3 text-right text-xs">Actions</th></tr></thead>
              <tbody class="divide-y divide-gray-100">
                @for (p of products(); track p.id) {
                  <tr>
                    <td class="px-6 py-4"><div class="flex items-center gap-3"><img class="h-10 w-10 rounded-lg object-cover border" [src]="p.imageUrl" alt=""><div><div class="text-sm font-medium">{{ p.name }}</div><div class="text-xs text-gray-500">ID: {{ p.id }}</div></div></div></td>
                    <td class="px-6 py-4 text-sm">{{ p.price | currency:'INR':'symbol':'1.0-0' }}</td>
                    <td class="px-6 py-4 text-sm">{{ p.stock }}</td>
                    <td class="px-6 py-4 text-right text-sm flex justify-end gap-2">
                      <button (click)="editProduct(p)" class="text-blue-600 hover:text-blue-800">Edit</button>
                      <button (click)="deleteProduct(p.id)" class="text-red-500">Delete</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (activeTab() === 'orders') {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs">Order ID</th><th class="px-6 py-3 text-left text-xs">Customer</th><th class="px-6 py-3 text-left text-xs">Status</th></tr></thead>
              <tbody class="divide-y divide-gray-100">
                @for (order of orders(); track order.id) {
                <tr>
                  <td class="px-6 py-4 text-sm font-mono">{{ order.id }}</td>
                  <td class="px-6 py-4 text-sm">{{ order.razorpayOrderId || '-' }}</td>
                  <td class="px-6 py-4 text-sm">{{ order.orderStatus }}</td>
                </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="p-4">
            <form [formGroup]="couponForm" (ngSubmit)="createCoupon()" class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input formControlName="code" placeholder="Coupon code" class="border rounded-md px-3 py-2" />
              <select formControlName="type" class="border rounded-md px-3 py-2">
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed</option>
                <option value="BXGX">BXGX</option>
              </select>
              <input formControlName="discountValue" type="number" placeholder="Discount value" class="border rounded-md px-3 py-2" />
              <input formControlName="minimumCartValue" type="number" placeholder="Minimum cart value" class="border rounded-md px-3 py-2" />
              <input formControlName="buyQty" type="number" placeholder="Buy qty" class="border rounded-md px-3 py-2" />
              <input formControlName="getQty" type="number" placeholder="Get qty" class="border rounded-md px-3 py-2" />
              <button type="submit" class="bg-dv-green text-white rounded-md px-4 py-2">Create Coupon</button>
            </form>
            <div class="space-y-2">
              @for (c of coupons(); track c.id) {
                <div class="border rounded-md p-3 flex justify-between items-center">
                  <div>
                    <p class="font-medium">{{ c.code }} <span class="text-xs bg-gray-100 px-2 py-0.5 rounded">{{ c.type }}</span></p>
                    <p class="text-xs text-gray-500">Min: {{ c.minimumCartValue || 0 }} | Discount: {{ c.discountValue || 0 }}</p>
                  </div>
                  <button (click)="deleteCoupon(c.id)" class="text-red-600 text-sm">Delete</button>
                </div>
              } @empty {
                <p class="text-sm text-gray-500">No coupons yet.</p>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  private api = inject(ApiService);
  private snackbar = inject(SnackbarService);
  private fb = inject(FormBuilder);
  activeTab = signal<'products' | 'orders' | 'coupons'>('products');
  showAddProduct = signal(false);
  showAdvanced = signal(false);
  uploading = signal(false);
  products = signal<ProductResponse[]>([]);
  orders = signal<OrderResponse[]>([]);
  coupons = signal<CouponResponse[]>([]);

  addProductForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    originalPrice: [null as number | null],
    stock: [0, [Validators.required, Validators.min(0)]],
    imageUrl: ['']
  });

  editingProductId: string | null = null;
  thumbnailFile: File | null = null;
  thumbnailPreview: string | null = null;
  productImageFiles: Array<{ file: File; url: string }> = [];
  productVideoFiles: Array<{ file: File }> = [];
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
    expiresAt: ['']
  });

  constructor() {
    this.loadDashboardData();
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
    this.productVideoFiles = files.map((file) => ({ file }));
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
    this.api.get<OrderResponse[]>('/admin/orders').subscribe({ next: (orders) => this.orders.set(orders) });
    this.api.get<CouponResponse[]>('/admin/coupons').subscribe({ next: (coupons) => this.coupons.set(coupons) });
  }

  addProduct() { this.showAddProduct.set(true); }

  deleteProduct(id: string) {
    this.api.delete<void>(`/admin/products/${id}`).subscribe({ next: () => this.products.update(items => items.filter(p => p.id !== id)) });
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
      imageUrl: product.imageUrl || ''
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
          this.addProductForm.reset({ name: '', description: '', price: 0, originalPrice: null, stock: 0, imageUrl: '' });
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

  createCoupon() {
    if (this.couponForm.invalid) return;
    this.api.post<CouponResponse>('/admin/coupons', this.couponForm.value).subscribe({
      next: (coupon) => {
        this.coupons.update(list => [coupon, ...list]);
        this.couponForm.patchValue({ code: '', discountValue: 0, minimumCartValue: 0, buyQty: 1, getQty: 1, productId: '' });
      },
      error: () => this.snackbar.showError('Unable to create coupon.')
    });
  }

  deleteCoupon(id: string) {
    this.api.delete<void>(`/admin/coupons/${id}`).subscribe({
      next: () => this.coupons.update(list => list.filter(c => c.id !== id)),
      error: () => this.snackbar.showError('Unable to delete coupon.')
    });
  }
}
