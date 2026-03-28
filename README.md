# DevineVibes E-commerce Backend (Spring Boot)

Production-ready monolith backend with layered architecture and feature grouping.

## Architecture

```
com.devinevibes
├── config
├── security
├── exception
├── controller/{auth,user,product,cart,order,payment}
├── service/{auth,user,product,cart,order,payment,notification}
├── repository/{user,product,cart,order,payment}
├── dto/{auth,user,product,cart,order,payment}
└── entity/{user,product,cart,order,payment}
```

## Implemented Modules
- Auth (Google ID token + OTP login)
- User profile
- Product catalog (CRUD + pagination/filter)
- Cart
- Order placement
- Payment simulation + webhook
- Notification abstraction (OTP mock logger)

## Auth Flows

### Google Login
1. Client sends Google ID token to `/api/auth/google`
2. Backend verifies token and extracts claims
3. Auto-registers user if missing
4. Returns access + refresh JWT

### OTP Login
1. `POST /api/auth/send-otp` stores OTP in Redis key `otp:{phone}` for 5 mins
2. `POST /api/auth/verify-otp` validates OTP and issues JWTs

## Redis Usage
- OTP keys: `otp:{phone}`
- Product cache keys (through Spring cache):
  - `product:{id}`
  - `products:all`

## API Endpoints (sample)

### Auth
- `POST /api/auth/google`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/refresh`

### Product
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

### Cart
- `POST /api/cart/add`
- `GET /api/cart`
- `DELETE /api/cart/{productId}`

### Orders
- `POST /api/orders`
- `GET /api/orders`

### Payment
- `POST /api/payment/create`
- `POST /api/payment/webhook`
- `GET /api/payment/signed-url?fileName=...`

## Example Request/Response

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{ "phone": "9876543210" }
```

Response: `202 Accepted`

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{ "phone": "9876543210", "otp": "123456" }
```

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": 1,
    "fullName": "Mobile User",
    "email": null,
    "phone": "9876543210",
    "role": "CUSTOMER"
  }
}
```

### Product list
`GET /api/products?page=0&size=20&sort=price,asc&category=electronics&q=phone`

## Run

```bash
./mvnw spring-boot:run
```

Set env vars:
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET` (base64)
- `GOOGLE_CLIENT_ID` (optional but recommended)
