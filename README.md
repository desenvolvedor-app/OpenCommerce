# OpenCommerce

[![GitHub stars](https://img.shields.io/github/stars/username/opencommerce?style=social)](https://github.com/username/opencommerce/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**OpenCommerce** is an open-source, modular e-commerce boilerplate built with Next.js that provides developers with a ready-to-use foundation for creating custom online stores. Inspired by Shopify's structure but focused on developer flexibility, OpenCommerce allows you to quickly deploy a functional e-commerce platform with minimal configuration.

## Core Features

- 🔐 **Pre-built Authentication** - Firebase authentication with multiple login options (Google, Email, etc.)
- 💾 **Database Integration** - Firebase database integration with modular architecture for easy switching
- 🛍️ **Complete E-commerce Functionality** - Product catalog, cart, checkout, and order management
- 🧩 **Plugin-Ready Architecture** - Modular design allows for easy extension and customization
- 🎨 **Themeable Structure** - Easily customize the look and feel of your store
- 🔄 **Shopify-Compatible** - Structure allows for easy migration from Shopify

## Why OpenCommerce?

While platforms like Shopify provide excellent services, they often come with limitations and ongoing costs. OpenCommerce gives developers and small businesses the freedom to create and customize their online stores without the constraints of proprietary platforms. It's designed to be simple enough for solo developers while maintaining professional standards and scalability.

## Roadmap

### Phase 1: Core Structure and Authentication (Priority 1)

- [TASK-001] Set up Next.js project with TypeScript and directory structure
- [TASK-002] Implement Firebase authentication (email/password, Google)
- [TASK-003] Create protected routes and authentication middleware
- [TASK-004] Design and implement login/registration pages
- [TASK-005] Create user profile management page

### Phase 2: Product Management and Display (Priority 2)

- [TASK-006] Design database schema for products, categories, and inventory
- [TASK-007] Implement products service layer with Firebase integration
- [TASK-008] Create reusable CRUD components for product management
- [TASK-009] Build homepage with hero section, featured products, and categories
- [TASK-010] Implement product listing page with search and filtering
- [TASK-011] Create detailed product page with all necessary information
- [TASK-012] Add "Add to Cart" functionality

### Phase 3: Shopping Cart and Checkout (Priority 3)

- [TASK-013] Implement shopping cart functionality with local storage and user authentication integration
- [TASK-014] Create cart page with product listing, quantities, and total calculation
- [TASK-015] Design and implement checkout page with shipping information
- [TASK-016] Integrate payment processing (initially with one provider, structured for extensions)
- [TASK-017] Implement order creation and confirmation flow

### Phase 4: Order Management and User Dashboard (Priority 4)

- [TASK-018] Create order history page for users
- [TASK-019] Implement order details view
- [TASK-020] Design and implement user dashboard
- [TASK-021] Add order status tracking

### Phase 5: Admin Functionality (Priority 5)

- [TASK-022] Create admin dashboard for store management
- [TASK-023] Implement product management interface (add, edit, delete)
- [TASK-024] Add category management
- [TASK-025] Create order management system for admins
- [TASK-026] Implement basic analytics dashboard

### Phase 6: Theming and Customization (Priority 6)

- [TASK-027] Design theme structure compatible with Shopify themes
- [TASK-028] Implement theme switching capability
- [TASK-029] Create documentation for theme development
- [TASK-030] Develop a default responsive theme

### Phase 7: Documentation and Community Resources (Priority 7)

- [TASK-031] Create comprehensive code documentation
- [TASK-032] Write developer guides for extending the platform
- [TASK-033] Create "Getting Started" tutorials
- [TASK-034] Document API endpoints
- [TASK-035] Set up community contribution guidelines

## Project Structure

```
opencommerce/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router Pages
│   │   ├── admin/           # Admin-related pages
│   │   ├── auth/            # Authentication pages (login, register)
│   │   ├── cart/            # Shopping cart page
│   │   ├── checkout/        # Checkout process pages
│   │   ├── products/        # Product listings and details
│   │   ├── profile/         # User profile pages
│   │   └── ...
│   ├── components/          # Reusable components
│   │   ├── common/          # Common UI components
│   │   ├── forms/           # Form components
│   │   ├── layout/          # Layout components
│   │   ├── product/         # Product-related components
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and shared logic
│   │   ├── api/             # API utilities
│   │   ├── auth/            # Authentication utilities
│   │   ├── db/              # Database utilities
│   │   └── ...
│   ├── models/              # TypeScript interfaces and types
│   ├── services/            # Service layer
│   │   ├── auth/            # Authentication services
│   │   ├── products/        # Product-related services
│   │   ├── orders/          # Order-related services
│   │   └── ...
│   ├── store/               # State management
│   ├── styles/              # Global styles
│   └── themes/              # Theme-related files
│       ├── default/         # Default theme
│       └── ...
├── config/                  # Configuration files
├── scripts/                 # Build and utility scripts
├── tests/                   # Test files
├── .env.example             # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── .gitignore              # Git ignore file
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies and scripts
├── README.md               # Project documentation
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/username/opencommerce.git
cd opencommerce
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a Firebase project and configure your application:

    - Create a new project in the [Firebase Console](https://console.firebase.google.com/)
    - Enable Authentication services (Email/Password, Google, etc.)
    - Create a Firestore database
    - Enable Storage if needed

4. Copy the `.env.example` file to `.env.local` and add your Firebase configuration:

```bash
cp .env.example .env.local
```

5. Edit the `.env.local` file with your Firebase credentials.

6. Run the development server:

```bash
npm run dev
# or
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Development Guidelines

### Code Style and Principles

OpenCommerce follows these core principles:

1. **SOLID Principles:**

    - **S**ingle Responsibility: Each module, class, or function has a single responsibility
    - **O**pen/Closed: Code entities are open for extension but closed for modification
    - **L**iskov Substitution: Subtypes must be substitutable for their base types
    - **I**nterface Segregation: Clients should not be forced to depend on methods they do not use
    - **D**ependency Inversion: Depend on abstractions, not concretions

2. **DRY (Don't Repeat Yourself):**

    - Extract common functionality into shared utilities and components
    - Use composition to share behavior between components

3. **Modular Architecture:**
    - Clear separation of concerns between components
    - Pluggable services with well-defined interfaces

### Contributing

We welcome contributions to OpenCommerce! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest features.

When contributing, please:

- Follow the established code style and structure
- Write tests for new functionality
- Document your changes
- Create focused, single-purpose pull requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [OpenSAS](https://github.com/wasp-lang/open-saas)
- Structured with lessons learned from Shopify's architecture
