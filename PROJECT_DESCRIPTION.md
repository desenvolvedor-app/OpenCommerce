# OpenCommerce: Project Description

## Core Essence

OpenCommerce is an open-source e-commerce boilerplate designed to provide developers with a ready-to-use foundation for creating custom online stores. Much like OpenSAS does for SaaS applications, OpenCommerce aims to eliminate the repetitive setup work for e-commerce projects, allowing developers to focus on customization and business logic.

The project's primary goals are:

1. **Simplicity** - Provide a functional e-commerce platform that can be set up with minimal configuration
2. **Modularity** - Create a plugin-ready architecture that allows for easy extension and customization
3. **Shopify Compatibility** - Structure the application to facilitate migration from Shopify
4. **Solo-Developer Friendly** - Design with simplicity and clear documentation for individual developers
5. **Community-Oriented** - Build a foundation that encourages open-source contributions

## Technical Architecture Overview

OpenCommerce is built on Next.js with a modular architecture that initially uses Firebase for authentication, database, and storage, but is designed for future flexibility to swap out these services as needed.

### Key Technical Decisions

1. **Next.js App Router** - For modern React patterns and improved SEO
2. **TypeScript** - For type safety and better developer experience
3. **Firebase** - For initial authentication, database, and storage solutions
4. **Modular Service Layer** - To abstract third-party dependencies for future flexibility
5. **Theme System** - Compatible with Shopify themes for easier migration

## Coding Guidelines

### SOLID Principles Implementation

#### Single Responsibility Principle (SRP)

Each module, service, or component should have one responsibility and one reason to change.

```typescript
// GOOD: Separate services for different responsibilities
// services/product/productService.ts
export class ProductService {
    async getProducts(): Promise<Product[]> {
        // Logic to fetch products
    }

    async getProductById(id: string): Promise<Product | null> {
        // Logic to fetch a single product
    }
}

// services/cart/cartService.ts
export class CartService {
    async addToCart(
        userId: string,
        productId: string,
        quantity: number
    ): Promise<void> {
        // Logic to add item to cart
    }
}

// BAD: Mixing responsibilities
// services/storeService.ts - AVOID THIS APPROACH
export class StoreService {
    async getProducts(): Promise<Product[]> {
        /* ... */
    }
    async processPayment(): Promise<void> {
        /* ... */
    }
    async updateUserProfile(): Promise<void> {
        /* ... */
    }
}
```

#### Open/Closed Principle (OCP)

Design components to be extended without modifying their source code.

```typescript
// GOOD: Using strategy pattern for payment methods
// interfaces/payment.ts
export interface PaymentProcessor {
    processPayment(amount: number): Promise<PaymentResult>;
}

// services/payment/stripePaymentProcessor.ts
export class StripePaymentProcessor implements PaymentProcessor {
    async processPayment(amount: number): Promise<PaymentResult> {
        // Stripe-specific implementation
    }
}

// Adding a new payment method doesn't require changing existing code
// services/payment/paypalPaymentProcessor.ts
export class PayPalPaymentProcessor implements PaymentProcessor {
    async processPayment(amount: number): Promise<PaymentResult> {
        // PayPal-specific implementation
    }
}

// Using any payment processor:
function checkout(processor: PaymentProcessor, amount: number) {
    return processor.processPayment(amount);
}
```

#### Liskov Substitution Principle (LSP)

Subtypes must be substitutable for their base types.

```typescript
// GOOD: Child classes can be used anywhere the parent is expected
// models/user.ts
export class User {
    id: string;
    email: string;

    async getProfile(): Promise<UserProfile> {
        // Common implementation
    }
}

// models/adminUser.ts
export class AdminUser extends User {
    override async getProfile(): Promise<UserProfile> {
        const profile = await super.getProfile();
        return {
            ...profile,
            isAdmin: true,
        };
    }
}

// This function works with any User type
function displayUserInfo(user: User) {
    // Works with User or AdminUser
}
```

#### Interface Segregation Principle (ISP)

Create focused, specific interfaces rather than general-purpose ones.

```typescript
// GOOD: Specific interfaces for different capabilities
export interface ProductReader {
    getProducts(): Promise<Product[]>;
    getProductById(id: string): Promise<Product | null>;
}

export interface ProductWriter {
    createProduct(product: ProductInput): Promise<Product>;
    updateProduct(id: string, data: Partial<ProductInput>): Promise<Product>;
    deleteProduct(id: string): Promise<void>;
}

// Consumer only depends on what it needs
class ProductListComponent {
    constructor(private productReader: ProductReader) {}

    async loadProducts() {
        this.products = await this.productReader.getProducts();
    }
}

// BAD: Forcing consumers to depend on methods they don't use
export interface ProductService {
    getProducts(): Promise<Product[]>;
    getProductById(id: string): Promise<Product | null>;
    createProduct(product: ProductInput): Promise<Product>;
    updateProduct(id: string, data: Partial<ProductInput>): Promise<Product>;
    deleteProduct(id: string): Promise<void>;
    // Many other methods a consumer might not need
}
```

#### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions.

```typescript
// GOOD: Depending on interfaces, not implementations
// services/database/databaseInterface.ts
export interface Database {
    getAll<T>(collection: string): Promise<T[]>;
    getById<T>(collection: string, id: string): Promise<T | null>;
    create<T>(collection: string, data: T): Promise<T>;
    update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
    delete(collection: string, id: string): Promise<void>;
}

// services/database/firebaseDatabase.ts
export class FirebaseDatabase implements Database {
    // Firebase implementation
}

// Using the database abstraction
export class ProductRepository {
    constructor(private db: Database) {}

    async getProducts(): Promise<Product[]> {
        return this.db.getAll<Product>('products');
    }
}
```

### DRY (Don't Repeat Yourself) Implementation

1. **Shared Components**

```typescript
// components/common/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  // Common button styling and behavior
  return (
    <button
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage throughout the application
<Button variant="primary" onClick={handleSave}>Save</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
```

2. **Custom Hooks for Common Logic**

```typescript
// hooks/useForm.ts
export function useForm<T>(initialValues: T) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<keyof T, string>>(
        {} as Record<keyof T, string>
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form handling logic

    return { values, errors, isSubmitting, handleChange, handleSubmit };
}

// Usage in multiple forms
const { values, errors, handleChange, handleSubmit } = useForm({
    name: '',
    email: '',
});
```

3. **Service Composition**

```typescript
// Creating reusable service functions
function createCrudService<T>(collection: string, db: Database) {
    return {
        getAll: () => db.getAll<T>(collection),
        getById: (id: string) => db.getById<T>(collection, id),
        create: (data: T) => db.create<T>(collection, data),
        update: (id: string, data: Partial<T>) =>
            db.update<T>(collection, id, data),
        delete: (id: string) => db.delete(collection, id),
    };
}

// Using the factory function for multiple services
export const productService = createCrudService<Product>('products', db);
export const categoryService = createCrudService<Category>('categories', db);
```

### Modular Structure Implementation

1. **Feature-Based Organization**

Organize code by domain/feature rather than technical function:

```
src/
  ├── features/
  │   ├── products/
  │   │   ├── components/
  │   │   ├── hooks/
  │   │   ├── services/
  │   │   ├── types.ts
  │   │   └── index.ts
  │   ├── cart/
  │   │   ├── components/
  │   │   ├── hooks/
  │   │   ├── services/
  │   │   ├── types.ts
  │   │   └── index.ts
  │   └── ...
```

2. **Clear Service Boundaries**

Each service should have well-defined interfaces and handle its own data access:

```typescript
// features/products/services/productService.ts
export interface ProductService {
    getProducts(): Promise<Product[]>;
    getProductById(id: string): Promise<Product | null>;
    // Other methods
}

export class FirebaseProductService implements ProductService {
    constructor(private db: FirebaseDatabase) {}

    async getProducts(): Promise<Product[]> {
        return this.db.getAll<Product>('products');
    }

    async getProductById(id: string): Promise<Product | null> {
        return this.db.getById<Product>('products', id);
    }

    // Other methods
}

// Export a default instance for convenience
export const productService = new FirebaseProductService(firebaseDb);
```

3. **Dependency Injection**

Use dependency injection to make services testable and swappable:

```typescript
// lib/container.ts - A simple dependency injection container
export class Container {
    private services = new Map<string, any>();

    register<T>(key: string, instance: T): void {
        this.services.set(key, instance);
    }

    get<T>(key: string): T {
        if (!this.services.has(key)) {
            throw new Error(`Service ${key} not found`);
        }
        return this.services.get(key) as T;
    }
}

// Setting up the container
const container = new Container();
container.register('database', new FirebaseDatabase());
container.register(
    'productService',
    new FirebaseProductService(container.get('database'))
);

// Using services
const productService = container.get<ProductService>('productService');
```

## Community Contribution Guidelines

To encourage community contributions:

1. **Comprehensive Documentation**

    - Document all key components and services with JSDoc comments
    - Provide clear examples of usage
    - Create tutorials for common customizations

2. **Consistent Coding Style**

    - Use ESLint and Prettier for code formatting
    - Follow the established patterns in the codebase
    - Include TypeScript types for all functions and components

3. **Testing Requirements**

    - Write tests for all new functionality
    - Maintain high test coverage
    - Use integration tests for key user flows

4. **Pull Request Process**

    - Create focused, single-purpose PRs
    - Include detailed descriptions of changes
    - Reference related issues
    - Add or update tests as needed

5. **Issue Templates**
    - Provide templates for bug reports
    - Include templates for feature requests
    - Guide contributors on providing necessary information

## Approach to Theme Development

The theme system should be compatible with Shopify's theme structure to facilitate migration:

```
src/
  ├── themes/
  │   ├── default/
  │   │   ├── components/
  │   │   │   ├── Header.tsx
  │   │   │   ├── Footer.tsx
  │   │   │   └── ...
  │   │   ├── templates/
  │   │   │   ├── HomePage.tsx
  │   │   │   ├── ProductPage.tsx
  │   │   │   └── ...
  │   │   ├── theme.config.ts
  │   │   └── styles.css
  │   └── ...
```

Theme components should receive data through props and avoid direct dependencies on services:

```typescript
// themes/default/templates/ProductPage.tsx
interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
  onAddToCart: (quantity: number) => void;
}

export function ProductPage({ product, relatedProducts, onAddToCart }: ProductPageProps) {
  // Render the product page
}

// app/products/[id]/page.tsx
export default async function ProductPageRoute({ params }: { params: { id: string } }) {
  const product = await productService.getProductById(params.id);
  const relatedProducts = await productService.getRelatedProducts(params.id);

  return (
    <ThemeProvider>
      <ProductPage
        product={product}
        relatedProducts={relatedProducts}
        onAddToCart={(quantity) => cartService.addToCart(product.id, quantity)}
      />
    </ThemeProvider>
  );
}
```

## Summary

OpenCommerce aims to be the go-to open-source solution for developers looking to create custom e-commerce platforms without reinventing the wheel. By following SOLID principles, maintaining a DRY codebase, and focusing on modularity, the project provides a robust foundation that's easy to extend and customize.

The initial implementation with Firebase provides a quick setup path, while the modular architecture ensures that developers can replace components as their needs evolve. By maintaining compatibility with Shopify's structure, OpenCommerce also offers an exit path for merchants looking to move away from proprietary platforms.

Through clear documentation, consistent coding standards, and a welcoming community approach, OpenCommerce seeks to build a sustainable open-source project that serves both individual developers and the broader e-commerce ecosystem.
