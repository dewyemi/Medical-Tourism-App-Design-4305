# EmirAfrik Medical Tourism Database Documentation

## Overview
This document describes the comprehensive database structure for the EmirAfrik Medical Tourism platform, built on Supabase PostgreSQL. The database is designed to support the complete patient journey from initial inquiry to post-treatment follow-up.

## Database Architecture

### Core Authentication & Authorization

#### 1. User Roles System (`user_roles_meditravel_x8f24k`)
- **Purpose**: Manages user roles and access control
- **Key Fields**:
  - `user_id`: References auth.users(id) 
  - `role`: One of 'patient', 'admin', 'healthcare_provider'
  - Unique constraint on (user_id, role) to prevent duplicate roles

#### 2. Permissions System (`permissions_meditravel_x8f24k`)
- **Purpose**: Defines fine-grained permissions for different actions
- **Key Permissions**:
  - `bookings:*` - Booking management permissions
  - `users:*` - User management permissions
  - `analytics:*` - Analytics access permissions
  - `destinations:*` - Destination management permissions
  - `treatments:*` - Treatment management permissions

#### 3. Role Permissions Junction (`role_permissions_meditravel_x8f24k`)
- **Purpose**: Maps roles to specific permissions
- **Default Assignments**:
  - **Patient**: bookings:create/read/update, users:read/update, analytics:read
  - **Healthcare Provider**: bookings:read/update, users:read, analytics:read
  - **Admin**: All permissions

### Patient Journey Management

#### 4. Patient Journeys (`patient_journeys_emirafrik`)
- **Purpose**: Tracks patient progression through the medical tourism process
- **Journey Stages**:
  1. `initial_inquiry` - First contact
  2. `medical_history_collection` - Gathering medical information
  3. `preliminary_assessment` - Initial medical evaluation
  4. `treatment_selection` - Choosing treatment options
  5. `provider_matching` - Finding suitable healthcare providers
  6. `payment_processing` - Financial arrangements
  7. `appointment_booking` - Scheduling treatments
  8. `pre_travel_preparation` - Travel arrangements
  9. `visa_accommodation` - Documentation and lodging
  10. `arrival_orientation` - Arrival support
  11. `treatment_execution` - Active treatment phase
  12. `recovery_monitoring` - Post-treatment recovery
  13. `discharge_planning` - Discharge arrangements
  14. `return_travel` - Travel back home
  15. `follow_up_care` - Ongoing care coordination
  16. `outcome_assessment` - Final evaluation

#### 5. Journey Milestones (`journey_milestones_emirafrik`)
- **Purpose**: Tracks specific milestones within each journey stage
- **Features**: Task assignment, due dates, completion tracking

#### 6. Medical History (`medical_history_emirafrik`)
- **Purpose**: Stores comprehensive patient medical information
- **Key Data**:
  - Medical conditions, medications, allergies
  - Previous surgeries, family history
  - Lifestyle factors, emergency contacts
  - Insurance information, medical documents

### Treatment & Provider Management

#### 7. Treatment Recommendations (`treatment_recommendations_emirafrik`)
- **Purpose**: AI-driven treatment recommendations
- **Features**: Scoring system, cost estimation, success rates

#### 8. Provider Profiles (`provider_profiles_emirafrik`)
- **Purpose**: Enhanced healthcare provider information
- **Provider Types**: doctor, specialist, surgeon, facility, coordinator
- **Tracking**: Ratings, success rates, patient counts, certifications

#### 9. Care Plans (`care_plans_emirafrik`)
- **Purpose**: Detailed treatment and recovery plans
- **Features**: Instructions, medications, follow-up schedules

### Communication & Support

#### 10. Support Tickets (`support_tickets_emirafrik`)
- **Purpose**: Customer service and issue tracking
- **Categories**: general, medical, payment, travel, technical, complaint, emergency
- **Priority Levels**: low, medium, high, urgent
- **Auto-generated ticket numbers**: EMF-YYYYMMDD-XXXXXX format

#### 11. Ticket Messages (`ticket_messages_emirafrik`)
- **Purpose**: Conversation history for support tickets
- **Features**: Attachments, internal notes

#### 12. Communication Logs (`communication_logs_emirafrik`)
- **Purpose**: Comprehensive communication tracking
- **Types**: message, call, video_call, email, notification

### Travel & Logistics

#### 13. Travel Coordination (`travel_coordination_emirafrik`)
- **Purpose**: Manages all travel-related arrangements
- **Features**:
  - Departure/destination tracking
  - Visa status management
  - Accommodation and flight bookings
  - Local transportation arrangements
  - Travel insurance coordination

#### 14. Appointments (`appointments_emirafrik`)
- **Purpose**: Medical appointment scheduling
- **Types**: consultation, pre_treatment, treatment, post_treatment, follow_up, emergency
- **Features**: Duration tracking, status management, reminder system

## Row Level Security (RLS)

All tables implement comprehensive RLS policies:

### Patient Data Access
- **Patients**: Can only access their own data
- **Healthcare Providers**: Can access assigned patient data
- **Admins**: Full access to all data

### Permission-Based Access
- Uses the `user_has_permission()` function for fine-grained access control
- Permissions are checked at the database level for security

## Key Functions

### 1. `handle_new_user()`
- Automatically assigns 'patient' role to new users
- Triggered on user registration

### 2. `user_has_permission(user_id, permission_name)`
- Checks if a user has a specific permission
- Used for authorization in application logic

### 3. `get_user_permissions(user_id)`
- Returns all permissions for a user
- Used for UI permission management

### 4. `advance_patient_journey(user_id, new_stage)`
- Progresses patient through journey stages
- Creates journey if it doesn't exist

### 5. `assign_admin_role_to_user(email)`
- Safely assigns admin role to users
- Used for administrative setup

## Migration History

- **20230701**: User roles and permissions system
- **20240101**: Admin role assignment utilities
- **20240102**: Provider application system
- **20240201**: Patient journey tracking system
- **20240301**: Treatment recommendation engine

## Security Features

1. **Row Level Security**: All tables protected by RLS policies
2. **Role-Based Access**: Three-tier role system (patient, provider, admin)
3. **Permission-Based Actions**: Fine-grained permission system
4. **Secure Functions**: All functions use SECURITY DEFINER
5. **Data Isolation**: Patients can only access their own data

## Integration Points

### Supabase Integration
- Uses Supabase Auth for user management
- Real-time subscriptions for live updates
- Storage integration for document management

### Application Integration
- React context providers for state management
- Real-time journey tracking
- Automated workflow triggers
- Notification system integration

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried fields are indexed
2. **JSONB Usage**: Flexible data storage for complex objects
3. **Efficient Queries**: Functions optimize common query patterns
4. **Connection Pooling**: Supabase handles connection management

## Future Enhancements

1. **AI Integration Points**: Tables designed for ML model integration
2. **Analytics Schema**: Ready for business intelligence tools
3. **Audit Trails**: Comprehensive change tracking
4. **Multi-tenancy**: Ready for white-label deployments

## Usage Examples

### Creating a New Patient Journey
```sql
SELECT advance_patient_journey(
    'user-uuid-here', 
    'medical_history_collection'
);
```

### Checking User Permissions
```sql
SELECT user_has_permission(
    'user-uuid-here', 
    'bookings:create'
);
```

### Assigning Admin Role
```sql
SELECT assign_admin_role_to_user('admin@example.com');
```

## Support & Maintenance

For database issues or schema changes, contact the development team. All migrations are versioned and can be rolled back if necessary.

---
*Last Updated: December 2024*  
*Database Version: 1.0*  
*Platform: Supabase PostgreSQL*