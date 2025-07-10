# What's New & Changelog

Stay updated with the latest features, improvements, and fixes in the Ottu platform.

## Latest Release (v2.4.0) - December 2024

### 🎉 New Features
- **Enhanced Multi-Currency Support**: Added support for 15 new currencies including KWD, QAR, and AED
- **Real Estate Module**: Specialized payment flows for property transactions
- **Advanced Webhook Retry Logic**: Intelligent retry mechanisms with exponential backoff
- **Payment Link Analytics**: Detailed tracking and conversion metrics for payment links

### 🔧 Improvements
- **API Performance**: 40% improvement in response times for checkout API
- **Dashboard UX**: Redesigned transaction management interface
- **Mobile SDK**: Enhanced iOS and Android SDK with better error handling
- **Webhook Security**: Improved signature verification with multiple algorithm support

### 🐛 Bug Fixes
- Fixed issue with partial refunds not updating transaction status correctly
- Resolved webhook delivery failures for high-volume merchants
- Fixed currency conversion rounding issues in multi-currency transactions
- Corrected timezone handling in scheduled reports

---

## v2.3.2 - November 2024

### 🔧 Improvements
- **Flutter SDK**: Added Flutter support for cross-platform mobile development
- **Batch Operations**: New bulk API endpoints for processing multiple transactions
- **Enhanced Reporting**: Custom date ranges and advanced filtering options

### 🐛 Bug Fixes
- Fixed 3-D Secure authentication flow for specific gateway combinations
- Resolved issues with webhook event ordering
- Fixed dashboard loading issues for accounts with high transaction volumes

---

## v2.3.1 - October 2024

### 🔧 Improvements
- **API Documentation**: Interactive API explorer with live testing
- **Webhook Events**: Added new event types for failed payment attempts
- **Security**: Enhanced API key management with scoped permissions

### 🐛 Bug Fixes
- Fixed issue with duplicate transaction creation in high-concurrency scenarios
- Resolved webhook timeout issues for slow-responding endpoints
- Fixed incorrect fee calculations for certain payment methods

---

## v2.3.0 - September 2024

### 🎉 New Features
- **Saved Cards Management**: Enhanced tokenization with customer-managed cards
- **Dispute Management**: Automated chargeback handling and evidence submission
- **Custom Payment Forms**: White-label payment form builder
- **Advanced Analytics**: Machine learning-powered transaction insights

### 🔧 Improvements
- **Performance**: 25% reduction in payment processing time
- **Security**: Implementation of additional fraud detection rules
- **Mobile Experience**: Improved mobile payment flow optimization

---

## v2.2.1 - August 2024

### 🔧 Improvements
- **Invoice API**: Enhanced invoice management with recurring billing support
- **Webhook Reliability**: Improved webhook delivery with better error handling
- **Dashboard Performance**: Faster loading times for transaction lists

### 🐛 Bug Fixes
- Fixed issue with partial captures not reflecting in settlement reports
- Resolved webhook signature validation for special characters
- Fixed currency display issues in multi-currency accounts

---

## v2.2.0 - July 2024

### 🎉 New Features
- **Auto-Debit Payments**: Recurring payment support with flexible scheduling
- **Payment Method Routing**: Smart routing based on success rates and costs
- **Enhanced Notifications**: SMS and WhatsApp payment notifications
- **Comprehensive SDKs**: New JavaScript and Python SDKs

### 🔧 Improvements
- **API Stability**: Improved error handling and response consistency
- **Dashboard Insights**: Enhanced transaction analytics and reporting
- **Security**: Additional layers of fraud protection

---

## Upcoming Features

### Q1 2025 Roadmap
- **Apple Pay & Google Pay**: Native wallet integration
- **Cryptocurrency Support**: Bitcoin and Ethereum payment acceptance
- **Advanced Reconciliation**: AI-powered transaction matching
- **Multi-Tenant Architecture**: Enhanced white-label capabilities

### Q2 2025 Roadmap
- **GraphQL API**: Complete GraphQL API implementation
- **Enhanced Analytics**: Predictive analytics and insights
- **Marketplace Payments**: Support for marketplace and split payments
- **Voice Payments**: Integration with voice assistants

## Migration Guides

### Migrating to v2.4.0
- **Webhook Changes**: Updated webhook payload structure for enhanced events
- **API Deprecations**: Legacy endpoints will be deprecated in v2.5.0
- **New Required Fields**: Additional validation for international transactions

### Breaking Changes
- **v2.4.0**: Webhook signature algorithm updated (backward compatible for 6 months)
- **v2.3.0**: Enhanced error response format for API endpoints
- **v2.2.0**: Updated payment status enumeration values

## Support

For technical questions about new features or migration assistance:
- **Developer Support**: dev-support@ottu.com
- **Documentation**: Always up-to-date with latest changes
- **Migration Assistance**: Dedicated support for major version updates

## Stay Connected

- **Status Page**: [status.ottu.com](https://status.ottu.com) - Real-time system status
- **Developer Blog**: Latest technical articles and best practices
- **GitHub**: Sample code and community contributions
- **Newsletter**: Monthly updates delivered to your inbox