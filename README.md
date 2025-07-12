# ReWear - Community Clothing Exchange Platform

ReWear is a sustainable fashion platform that enables users to exchange unused clothing through direct swaps or a point-based redemption system. Built with Next.js and Firebase, it promotes sustainable fashion and reduces textile waste.

## Features

### Core Functionality
- **User Authentication**: Email/password and social login (Google, Facebook)
- **Item Listing**: Upload up to 6 images per item with detailed descriptions
- **Browse & Search**: Filter by category, size, condition, and tags
- **Points System**: Earn and spend points for item exchanges
- **Direct Swaps**: Propose item-for-item exchanges
- **Admin Moderation**: Review and approve/reject listings
- **Impact Tracking**: Environmental impact metrics

### Technical Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **UI Components**: shadcn/ui
- **State Management**: React hooks with Firebase integration
- **Image Handling**: Firebase Storage with automatic optimization

## Firebase Configuration

### Environment Variables
Create a `.env.local` file with your Firebase configuration:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### Database Structure
- **users**: User profiles, points, admin status
- **items**: Clothing listings with moderation status
- **swapOrders**: Exchange transactions and shipping info
- **pointsTransactions**: Points earning/spending history

### Security Rules
- Users can only edit their own profiles and items
- Admin users have moderation privileges
- All write operations require authentication
- Points transactions use server-side validation

## API Endpoints

### User Management
- `createUser(userData)` - Create new user profile
- `updateUser(userId, updates)` - Update user information
- `getUser(userId)` - Fetch user profile

### Item Management
- `createItem(itemData)` - List new clothing item
- `updateItem(itemId, updates)` - Update item details
- `getItems(filters)` - Browse items with filtering
- `getItem(itemId)` - Get single item details

### Swap System
- `createSwapOrder(orderData)` - Initiate item exchange
- `updateSwapOrder(orderId, updates)` - Update order status
- `awardPoints(userId, amount, reason)` - Add points to user

### Admin Functions
- `getPendingItems()` - Get items awaiting moderation
- `moderateItem(itemId, approved, notes)` - Approve/reject items

### File Upload
- `uploadItemImages(files, itemId)` - Upload item photos
- `deleteItemImage(imageUrl)` - Remove uploaded image

## Installation & Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd rewear-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Authentication (Email/Password, Google, Facebook)
   - Set up Firestore database
   - Configure Storage bucket
   - Add your config to `.env.local`

4. **Deploy Firestore rules**
   \`\`\`bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   \`\`\`

5. **Run development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Key Features Implementation

### Authentication Flow
- Firebase Auth with email/password and social providers
- Automatic user profile creation on registration
- Protected routes with authentication checks
- Admin role management through custom claims

### Points Economy
- Users earn 100 welcome points on signup
- 50 points awarded for approved item listings
- Points deducted when redeeming items (escrowed until delivery)
- Atomic transactions prevent point manipulation
- 18-month expiration policy for inactive accounts

### Moderation System
- All items require approval before listing
- Admin dashboard for bulk moderation
- Risk scoring system for flagged content
- Rejection reasons and moderation notes
- Appeal process for disputed decisions

### Environmental Impact
- CO₂ savings: 8.5 kg per item (production avoidance)
- Water conservation: 2,700 liters per item
- Waste diversion: 0.5 kg textile waste per item
- User and platform-wide impact tracking

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Firebase Hosting
1. Build the application: `npm run build`
2. Deploy to Firebase: `firebase deploy --only hosting`

## Security Considerations

- All API calls validate user authentication server-side
- Firestore security rules prevent unauthorized access
- Image uploads restricted to authenticated users
- Points transactions use atomic operations
- Admin privileges protected by custom claims
- GDPR-compliant data handling and deletion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with proper testing
4. Submit pull request with detailed description

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or feature requests, please open an issue on GitHub or contact the development team.
