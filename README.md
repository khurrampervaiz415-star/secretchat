# Secret Chat Application

A secure chat application with admin panel for user management and question-answer system.

## Features

- **Admin Panel**: Password-protected admin interface (password: `khurram@uetksk`)
- **User Management**: Create users with custom names and passwords
- **Dynamic Questions**: Admin can change questions that users see
- **Answer Collection**: User responses are stored and linked to their accounts
- **MongoDB Integration**: All data stored in MongoDB Atlas
- **Responsive Design**: Works on desktop and mobile devices
- **Vercel Ready**: Configured for easy deployment on Vercel

## Project Structure

```
├── server.js          # Main server file with all API endpoints
├── index.html         # User login page
├── secret.html        # User question/answer page
├── admin.html         # Admin panel interface
├── admin.js           # Admin panel JavaScript
├── user-script.js     # User page JavaScript
├── script.js          # Legacy script (still functional)
├── style.css          # Main CSS with animations
├── package.json       # Node.js dependencies
├── vercel.json        # Vercel deployment configuration
└── README.md          # This file
```

## Usage

### For Users
1. Visit the main page (`/`)
2. Enter your password (provided by admin)
3. Answer the question on the secret page
4. Submit your response

### For Admins
1. Visit `/admin`
2. Login with password: `yourpassword`
3. **Create Users**: Add new users with names and passwords
4. **Manage Questions**: Update the question shown to users
5. **View Users**: See all created users
6. **View Replies**: See all user responses with their associated passwords/IDs
7. **Delete Users**: Remove users and their replies

## API Endpoints

### Public Routes
- `GET /` - Main login page
- `GET /admin` - Admin login page
- `POST /login` - User authentication
- `GET /question` - Get current active question
- `POST /replies` - Submit user answer

### Admin Routes (require admin password)
- `POST /admin/login` - Admin authentication
- `POST /admin/users` - Create new user
- `GET /admin/users` - Get all users
- `DELETE /admin/users/:userId` - Delete user
- `POST /admin/question` - Update current question
- `GET /admin/replies` - Get all user replies

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  password: String,
  created_at: Date
}
```

### Questions Collection
```javascript
{
  _id: ObjectId,
  question: String,
  is_active: Boolean,
  created_at: Date
}
```

### Replies Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  userPassword: String,
  userName: String,
  questionId: ObjectId (ref: Question),
  question: String,
  reply: String,
  created_at: Date
}
```

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Visit `http://localhost:5000`

## Vercel Deployment

This project is configured for Vercel deployment with the included `vercel.json` file.

### Deploy Steps:
1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Vercel
3. Vercel will automatically detect the configuration and deploy
4. Your app will be available at your Vercel domain

### Environment Variables
The MongoDB connection string is currently hardcoded. For production, consider using environment variables:

1. Add `MONGODB_URI` environment variable in Vercel dashboard
2. Update `server.js` to use:
   ```javascript
   mongoose.connect(process.env.MONGODB_URI || "your-fallback-connection-string")
   ```

## Security Notes

- Admin password is hardcoded as `khurram@uetksk`
- User passwords are stored as plain text (consider hashing for production)
- No rate limiting implemented
- Consider adding HTTPS enforcement for production

## Troubleshooting

### Common Issues:
1. **Server not starting**: Check if port 5000 is available
2. **Database connection fails**: Verify MongoDB Atlas connection string
3. **Admin panel not accessible**: Ensure you're using the correct password
4. **Users can't login**: Verify users are created through admin panel

### Deployment Issues:
1. **Build fails on Vercel**: Check `package.json` dependencies
2. **Database connection fails**: Verify MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
3. **Static files not loading**: Ensure all files are committed to repository

## Features Overview

### Visual Elements
- Animated twinkling stars
- Floating balloons
- Bouncing bear decorations in corners
- Responsive gradient backgrounds
- Custom CSS animations

### Functionality
- Session-based user authentication
- Real-time question updates
- Admin user management
- Reply tracking and viewing
- Mobile-responsive design

## Support

For issues or questions, check the admin panel for user activity and database connectivity. All user interactions are logged in the MongoDB database for debugging purposes.