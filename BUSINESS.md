# Business Requirements: AI Inbound Tourism Platform

> **Single Source of Truth for Business Requirements**  
> This document must be referenced alongside `CLAUDE.md` for all development tasks.  
> `CLAUDE.md` = Technical Constitution | `BUSINESS.md` = Business Requirements

---

## Overview

The AI Inbound Tourism Platform is a comprehensive matching platform designed to connect foreign tourists visiting Japan with individual local guides. The platform facilitates domestic tour information sharing and booking, focusing on authentic local experiences that major travel companies often overlook.

### Key Platform Functions
- **Information Hub**: Centralized access to unique tourist spots and hidden gems
- **Matching Service**: Connect tourists with qualified local guides
- **Booking System**: Seamless reservation and payment processing
- **Experience Delivery**: Enable personalized, authentic cultural experiences

---

## Objectives

### Primary Goals
- **Provide Localized Information**: Grant access to unique tourist spots and hidden gems that major travel sites often miss
- **Deliver Unique Experiences**: Enable local guides to offer personalized tours, from famous sites to niche restaurants and cultural experiences
- **Revitalize Local Regions**: Stimulate local economies by directing tourist traffic to less-known areas and supporting regional businesses

### Success Metrics
- Increased tourist engagement with local/regional destinations
- Enhanced guide income opportunities
- Strengthened local business revenue from international visitors
- Improved cultural exchange and understanding

---

## Needs & Market Drivers

### Market Demand
- **Strong Foreign Interest**: Growing international fascination with Japanese culture, cuisine, and lifestyle
- **Authentic Experience Seeking**: Tourists desire genuine local experiences beyond mainstream attractions
- **Language Barriers**: Need for multilingual guidance and cultural interpretation

### Supply Side Opportunities
- **Japanese Students**: Seeking international exchange, overseas career opportunities, and intercultural understanding
- **Foreign Residents**: Foreign students/trainees in Japan needing additional income streams
- **Local Expertise**: Underutilized knowledge of hidden gems and local culture

### Economic Drivers
- **Local Tourism Challenges**: Traditional tourism operators struggling with globalization and competition
- **Regional Revitalization**: Government and local business initiatives to attract international visitors
- **Digital Transformation**: Opportunity to leverage AI and technology for enhanced tourism experiences

---

## Target Users

### Primary Users

#### 1. Foreign Tourists
- **Demographics**: International visitors to Japan
- **Needs**: Authentic experiences, language support, local insights
- **Pain Points**: Language barriers, limited access to hidden gems, navigation challenges

#### 2. Local Guides
- **Foreign Residents**: Foreign nationals living in Japan with local knowledge
- **Multilingual Japanese**: Japanese nationals fluent in foreign languages
- **Students**: Both Japanese and foreign students seeking income and cultural exchange
- **Professionals**: Part-time guides with specialized knowledge

### Secondary Users

#### 3. Local Businesses
- **Hotels & Accommodations**: Seeking to attract international guests
- **Restaurants**: Wanting to reach foreign diners
- **Shops & Merchants**: Looking to tap into inbound tourism demand
- **Tourism Operators**: Local tour companies and activity providers

#### 4. Government & Organizations
- **Local Governments**: Aiming for regional revitalization through tourism
- **Tourism Boards**: Promoting regional attractions and experiences
- **Educational Institutions**: Supporting student international exchange programs

---

## Revenue Model

### Multi-Stream Revenue Approach

#### 1. Guide Services (Primary Revenue)
- **Commission Model**: Platform fee on completed bookings
- **Freemium Subscription**: 
  - Free tier: Basic profile and booking capabilities
  - Premium tier: Advanced features, analytics, priority listing
- **Transaction Fees**: Payment processing and booking management

#### 2. Business Partner Revenue
- **Local Business Subscriptions**: Monthly/annual fees for enhanced visibility
- **Commission on Referrals**: Percentage of sales generated through platform recommendations
- **Advertising Revenue**: Sponsored listings and promotional content from hotels, restaurants, and attractions

#### 3. AI-Powered Services (Premium Features)
- **Real-time Translation**: Usage-based fees for AI translation services
- **Automatic Tour Generation**: Subscription or per-use fees for AI itinerary creation
- **Analytics & Insights**: Data and analytics packages for businesses and guides
- **Personalization Engine**: Advanced matching and recommendation services

#### 4. Corporate Partnerships
- **Sponsored Content**: Partnership fees from tourism boards and major attractions
- **White-label Solutions**: Platform licensing for other tourism organizations
- **Data Insights**: Anonymized tourism trend data for research and planning

---

## Core Features & Required Data

### Phase 1: Foundation Features (Low-Medium Complexity)

#### Identity Verification & Onboarding
**Difficulty: Medium**
- **Features**:
  - Passport scanning with OCR
  - Facial recognition verification
  - Payment method setup (Stripe integration)
  - Bank account verification for payouts
  - Background check integration for guides
- **Required Data**:
  - User passport/ID information
  - Facial biometric data (securely hashed)
  - Payment credentials
  - Banking information
  - Verification status and history

#### Guide Discovery & Search
**Difficulty: Medium**
- **Features**:
  - Advanced filtering system
  - Geographic search and mapping
  - Availability calendar
  - Multi-criteria sorting
- **Search Criteria**:
  - Region/location radius
  - Languages spoken (with proficiency levels)
  - Cost range and pricing tiers
  - User ratings and review scores
  - Experience level and specializations
  - Vehicle availability (car, bicycle, etc.)
  - Tour types (cultural, food, nature, etc.)
- **Required Data**:
  - Guide profiles and qualifications
  - Location and coverage areas
  - Pricing structures
  - Availability calendars
  - Review and rating history
  - Specialization tags and categories

#### Communication Tools
**Difficulty: Medium**
- **Features**:
  - In-app messaging system
  - Voice call capabilities
  - Photo and document sharing
  - Real-time location sharing during tours
  - Multi-language support
- **Required Data**:
  - Message history and threads
  - Media file storage
  - Call logs and duration
  - Location tracking data (with consent)

### Phase 2: Enhanced Features (Medium-High Complexity)

#### Intelligent Recommendations
**Difficulty: Medium-High**
- **Guide Matching**:
  - ML-based compatibility scoring
  - Preference learning from user behavior
  - Historical booking analysis
- **Business Recommendations**:
  - Location-based suggestions
  - Review and rating integration
  - Personal preference matching
- **Required Data**:
  - User preference profiles
  - Historical booking and interaction data
  - Business ratings and reviews
  - Geographic and demographic data
  - Behavioral analytics data

#### Review & Rating System
**Difficulty: Medium**
- **Features**:
  - Multi-dimensional rating system
  - Photo and video review capabilities
  - Verified purchase requirements
  - Guide response system
- **Required Data**:
  - Rating scores across multiple categories
  - Review text and media content
  - Verification status of reviewers
  - Guide response and resolution data

### Phase 3: AI-Powered Advanced Features (High Complexity)

#### Automatic Tour Generation
**Difficulty: High**
- **Features**:
  - AI-powered itinerary creation
  - Transportation time calculations
  - POI recommendations with scheduling
  - Weather and seasonal considerations
  - Budget optimization
  - Real-time adjustments
- **Required Data**:
  - Comprehensive POI database with attributes
  - Transportation schedules and routes
  - Historical weather data
  - User preference profiles
  - Real-time traffic and availability data
  - Pricing information for attractions and services

#### Real-time Translation & Cultural Bridge
**Difficulty: High**
- **Features**:
  - Live conversation translation
  - Cultural context explanations
  - Menu and sign translation via camera
  - Voice-to-voice translation
- **Required Data**:
  - Multi-language translation models
  - Cultural context database
  - User language preferences
  - Conversation history (with privacy controls)

#### Advanced Analytics Dashboard
**Difficulty: Medium-High**
- **Features**:
  - Guide performance analytics
  - Business intelligence for local partners
  - Tourist behavior insights
  - Revenue optimization recommendations
- **Required Data**:
  - Booking and transaction data
  - User engagement metrics
  - Geographic and temporal patterns
  - Revenue and commission tracking
  - Performance benchmarks

### Cross-Platform Requirements

#### Data Privacy & Security
- GDPR and local privacy law compliance
- Secure data encryption and storage
- User consent management
- Right to data deletion and portability

#### Scalability & Performance
- Multi-region deployment capability
- Real-time data synchronization
- High-availability architecture
- Mobile-first responsive design

#### Integration Requirements
- Payment gateway integration (Stripe)
- Map services (Google Maps/Mapbox)
- Translation services APIs
- Social media authentication
- Email and SMS notification services

---

## Implementation Priority

1. **Phase 1 (MVP)**: User registration, guide profiles, basic search, messaging
2. **Phase 2 (Growth)**: Enhanced matching, reviews, payment processing, mobile optimization  
3. **Phase 3 (Differentiation)**: AI features, advanced analytics, ecosystem expansion

This business requirements document provides the foundation for all development decisions and must be consulted alongside the technical specifications in `CLAUDE.md`.