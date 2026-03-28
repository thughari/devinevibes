# DevineVibes E-commerce Backend (Modular Monolith)

Production-oriented Spring Boot backend with modular packages (`auth`, `user`, `product`, `cart`, `order`, `payment`, `notification`) using PostgreSQL + Redis + JWT.

## Tech
- Java 21, Spring Boot 3.3+
- Spring Security + JWT (access + refresh)
- Spring Data JPA (Hibernate), PostgreSQL
- Redis (OTP + caching)
- Maven, Lombok

## High-level structure

```
com.devinevibes
├── auth
├── user
├── product
├── cart
├── order
├── payment
├── notification
├── security
├── config
└── common (exception, enums, base entity)
```

## Implemented authentication flows
1. **Google login** (`POST /api/v1/auth/google`)
   - Accepts frontend ID token
   - Validates token with Google verifier on backend
   - Auto-registers if user missing
   - Returns access + refresh tokens

2. **OTP login** (`POST /api/v1/auth/send-otp`, `POST /api/v1/auth/verify-otp`)
   - OTP key: `otp:{phone}` in Redis
   - TTL: 5 minutes
   - Retry limit: 3 attempts
   - Request rate limit: 60 seconds cooldown

3. **Email/password fallback** (`POST /api/v1/auth/login`)

## Redis usage
- OTP storage and attempts tracking
- OTP request throttling
- Spring cache for:
  - Product list (`@Cacheable("products")`)
  - Product details (`@Cacheable("product")`)

## Core endpoints
- Auth
  - `POST /api/v1/auth/google`
  - `POST /api/v1/auth/send-otp`
  - `POST /api/v1/auth/verify-otp`
  - `POST /api/v1/auth/refresh`
- Users
  - `GET /api/v1/users/me`
  - `POST /api/v1/users/addresses`
- Products
  - `GET /api/v1/products`
  - `POST /api/v1/products` (ADMIN)
- Cart
  - `POST /api/v1/cart/items`
- Orders
  - `POST /api/v1/orders`
- Payments
  - `POST /api/v1/payments`
  - `POST /api/v1/payments/webhook`
  - `POST /api/v1/payments/signed-upload-url`

## Sample requests

### Send OTP
```http
POST /api/v1/auth/send-otp
Content-Type: application/json

{ "phoneNumber": "+15555550123" }
```

### Verify OTP
```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{ "phoneNumber": "+15555550123", "otp": "123456" }
```

### Google login
```http
POST /api/v1/auth/google
Content-Type: application/json

{ "idToken": "google_id_token_from_frontend" }
```

### Refresh token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{ "refreshToken": "<jwt_refresh_token>" }
```

### Response (Auth)
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "userId": 1,
  "role": "ROLE_USER"
}
```

## Notes
- Payment is Razorpay-style simulation only.
- File upload uses signed URL mock endpoint (no file persistence in backend).
- Suitable as baseline architecture for ~1000 users; add observability, Flyway, test coverage before production.
