---
title: Merchant First Journey
sidebar_label: Getting Started
---

# Merchant First Journey

This guide walks you through a complete end-to-end workflow using the Ottu Real Estate Plugin -- from adding your first property to collecting rent payments. Follow along with the example scenario below to learn each step.

## Example Scenario

Throughout this guide, we use the following example entities:

| Entity | Details |
|---|---|
| **Property** | Greenfield Towers -- an independent villa with 6 stories (6 units), classified as Residential Building or Villa |
| **Tenant** | John Doe |
| **Contract** | Residential Lease Agreement connecting the tenant to a specific unit |

## Step 1: Add a Property

1. Navigate to the [Property Management](/business/industry/real-estate/properties) section on the dashboard.
2. Click **Add Property**.
3. Fill in the [New Property Form](/business/industry/real-estate/properties#new-property-form) with the key details:
   - **Name**: Greenfield Towers
   - **Location**: Downtown City
   - **Classification**: Residential Building or Villa

The merchant can choose to either save the property or add new units to it.

### Add New Unit

1. Click **Add Unit Type with Units** at the bottom of the New Property Form to open the unit details form.
2. Click **ADD OR EDIT UNITS** to specify the number of units associated with the property.

![Add or edit units](/img/business/real-estate/placeholder.png)

3. Click the **ADD** button to define the details of these units, then fill in the required information.

![Define unit details](/img/business/real-estate/placeholder.png)

![Unit information form](/img/business/real-estate/placeholder.png)

4. Save the property to make it available for actions like tenant assignment or contract creation.

Refer to the [Property Management](/business/industry/real-estate/properties) section for further details on managing property settings and custom fields.

## Step 2: Add a Tenant

1. Navigate to the [Tenant & Contract Dashboard](/business/industry/real-estate/tenant-contract/dashboard).
2. Click **Add Tenant** to register a new tenant.
3. Provide essential information in the [New Tenant Form](/business/industry/real-estate/tenant-contract/tenant-management#new-tenant-form):
   - **Name**: John Doe
   - **Contact Details**: Email and phone number
   - **Assigned Property**: Link the tenant to a specific unit or property
4. Save the tenant's profile.

For a comprehensive guide, refer to the [Tenant Management](/business/industry/real-estate/tenant-contract/tenant-management) section.

## Step 3: Add a Contract

1. Access the [Tenant & Contract Dashboard](/business/industry/real-estate/tenant-contract/dashboard).
2. Click **Add Contract** to create a lease agreement.
3. Fill in the [New Contract Form](/business/industry/real-estate/tenant-contract/add-contract#new-contract-form) details:
   - **Property Name**: Greenfield Towers
   - **Tenant Name**: John Doe
   - **Unit**: Click **ADD UNIT** and select Unit Number 2
   - **Contract Duration**: 20-12-2024 to 19-01-2026
   - **Payment Start Date**: 01-01-2025
   - **Number of Invoices for Advanced Payment**: 3
   - **Payment Period**: Monthly
4. Finalize and save the contract.

Refer to the [Contract Management](/business/industry/real-estate/tenant-contract/contract-management) page for additional information on editing and managing contracts.

**Invoices generated during contracting:**

![Invoices while contracting](/img/business/real-estate/placeholder.png)

## Step 4: Print Unit Vacancy Report

1. Access the [Property Management](/business/industry/real-estate/properties) table in the dashboard.
2. Click the **Filter** button to define parameters:
   - Unit Type: **Villa**
   - Property Classification: **Residential Building or Villa**
3. Click the **Print** button in the Property Management table.
4. The system automatically generates a PDF containing the unit vacancy details for the filtered criteria.
5. Download the PDF to your device for record-keeping or sharing.

![Unit vacancy report](/img/business/real-estate/placeholder.png)

## Step 5: Print and Generate Invoices

1. Navigate to the [Generate Invoice](/business/industry/real-estate/generate-invoice) section.
2. Choose the property as **Greenfield Towers** and specify the desired period (e.g., 2024-12).
3. Click the **Show** button.
4. All relevant invoices are displayed.

![Displayed invoices](/img/business/real-estate/placeholder.png)

5. **Print Invoices**:
   1. Click the **Print** button to generate a PDF report containing all displayed invoice details.
   2. Download the PDF for record-keeping or printing.

   ![Invoice PDF report](/img/business/real-estate/placeholder.png)

6. **Generate Invoices**:
   1. Click the **GENERATE INVOICES AND SEND PAYMENT LINKS** button to generate the displayed invoices.
   2. The associated payment links are automatically sent to the respective tenants.

Refer to the [Generate Invoice](/business/industry/real-estate/generate-invoice) guide for detailed instructions.

## Step 6: Pay via Invoice Link

1. The invoice link is shared automatically with the tenant via email or SMS.
2. The tenant accesses the payment page by clicking the link.

![Payment page](/img/business/real-estate/placeholder.png)

3. The tenant completes the payment using available methods like cards or wallets.

## Step 7: Record a Manual Payment

1. Access the **Contract Action List**. For instructions on accessing contract actions, see the [Contract Management](/business/industry/real-estate/tenant-contract/contract-management#triggering-contract-actions) page.
2. Select **Manual Payment** to record an offline payment.

![Manual payment option](/img/business/real-estate/placeholder.png)

3. After selecting Manual Payment, a [Manual Payment Form](/business/industry/real-estate/tenant-contract/manual-payment#manual-payment-form) appears. Fill in the required information.
4. Confirm and save the transaction.

See [Manual Payment](/business/industry/real-estate/tenant-contract/manual-payment) for more details.

## Step 8: View and Print Invoices and Payments

1. Access the [Invoices Dashboard](/business/industry/real-estate/invoices-management#invoices-management-dashboard).
2. Use filters for specific invoices or payments by property, tenant, or date range.
3. Review the details.
4. Click the **Print** button to generate a PDF file containing invoice details for easy printing.

By following these steps, merchants can effectively manage their properties, tenants, contracts, and financial transactions, ensuring a smooth workflow and maximizing operational efficiency.

## What's Next?

- [Property Management](/business/industry/real-estate/properties) -- Add and manage properties and units in detail
- [Tenant & Contract Management](/business/industry/real-estate/tenant-contract/) -- Manage tenants and contracts
- [Generate Invoice](/business/industry/real-estate/generate-invoice) -- Create and send invoices
- [Invoices Management](/business/industry/real-estate/invoices-management) -- Track and manage all invoices
