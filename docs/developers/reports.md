---
title: Reports
sidebar_label: Reports
hide_table_of_contents: true
---

import ApiDocEmbed from "@site/src/components/ApiDocEmbed";

# Reports API

The Reports-API lets merchants access their completed transaction reports programmatically.\
It’s designed for reconciliation, accounting, analytics, and compliance — without exposing any public storage links.

Two secure APIs are provided:

1. **List Reports**: Returns a filtered, paginated list of finished reports (auto or manual), plus a secure `download_action`.
2. **Download Report**: Downloads the binary file using authenticated access.

**Why this matters:**\
The dashboard already shows reports, but this API enables automated systems (ERP, BI tools, finance scripts) to fetch and download reports safely.

## [Quick Start](#quick-start)

This quick start shows how to authenticate, list available reports, and securely download a report using the Reports API in just a few steps.

![Reports quick start](/img/reports/reports-quickstart.png)

<ol className="stepper">
  <li className="stepper-item">
    <strong>Authenticate</strong>
    <div>Choose one authentication method:</div>
    <ul>
      <li>
        <strong>API Key (recommended)</strong>
        <div>Add your private API key to the request header:</div>
        <pre>
          <code>Api-Key: your_private_api_key</code>
        </pre>
      </li>
      <li>
        <strong>Basic Auth (user-based)</strong>
        <div>
          Use Basic Auth credentials. The user must have the
          <code>report.can_view_report</code> permission (or be a superuser).
        </div>
      </li>
    </ul>
  </li>

  <li className="stepper-item">
    <strong>List Available Reports</strong>
    <div>Call the List Reports API to retrieve finished reports.</div>
    <div>
      <strong>Request</strong>
    </div>

    ```bash
    curl -X GET "https://sandbox.ottu.net/api/v1/reports?limit=10" \
      -H "Api-Key: your_private_api_key"
    ```

    <div>
      <strong>What you get</strong>
    </div>
    <ul>
      <li>A list of completed reports only</li>
      <li>Each report includes metadata and a secure <code>download_action.url</code></li>
    </ul>

  </li>

  <li className="stepper-item">
    <strong>Select a Report</strong>
    <div>
      From the response, choose the report you want to download and copy its
      <code>encrypted_id</code> or <code>download_action.url</code>.
    </div>
    <div>Example:</div>

    ```json
    "download_action": {
      "method": "GET",
      "url": "https://<ottu-url>/b/api/v1/reports/files/{report_id}/download/"
    }
    ```

  </li>

  <li className="stepper-item">
    <strong>Download the Report</strong>
    <div>Use the provided <code>download_action.url</code> to download the file.</div>
    <div>
      <strong>Request</strong>
    </div>

    ```bash
    curl -X GET "https://<ottu-url>/b/api/v1/reports/files/{report_id}/download/" \
      -H "Api-Key: your_private_api_key"
    ```

    <div>
      <strong>Result</strong>
    </div>
    <ul>
      <li>The report file is returned as binary (CSV, XLSX, etc.)</li>
      <li>The download action is securely authenticated and audit-logged</li>
    </ul>

  </li>

  <li className="stepper-item">
    <strong>Handle Common Scenarios</strong>
    <ul>
      <li>
        <strong>No reports found:</strong> The API returns <code>200 OK</code> with an empty
        <code>results</code> array.
      </li>
      <li>
        <strong>Missing permission (Basic Auth):</strong> The API returns <code>403 Forbidden</code>.
      </li>
      <li>
        <strong>Invalid credentials:</strong> The API returns <code>401 Unauthorized</code>.
      </li>
    </ul>
  </li>
</ol>

## [Setup](#setup)

#### Base URL

Use your Ottu domain:

```
https://<ottu-url>
```

#### Endpoints

#### **1) List Reports**

```
GET b/api/v1/reports
```

#### **2) Download Report**

From the response of **List Reports API**, extract `download_action.url` for the desired report.

make GET request to `download_action.url` to download the file

:::info
If you don’t pass date filters, the List Reports API returns **the last 30 days** of finished reports, sorted newest first.
:::

## [Authentication](#authentication)

**Supported Methods**

- [Private API Key](/docs/developers/getting-started/authentication#private-key-api-key)
- [Basic Authentication](/docs/developers/getting-started/authentication#basic-authentication)

For detailed information on authentication procedures, please refer to the [Authentication documentation](#authentication).

## [Permissions](#permissions)

Permissions apply only when using [Basic Auth](/docs/developers/getting-started/authentication#basic-authentication).

#### Required permission

- `report.can_view_report`

#### Rules

- If the user has the permission or is a superuser, the **List** and **Download** APIs work normally.
- If the user **does not have the permission**, the API responds with:
  - **403 Forbidden**
  - Message like: `"No permission assigned"`

:::tip
API Key authentication does **not** require user permissions, since it is merchant-scoped.
:::

## [How it works](#how-it-works)

#### Reports sources

Reports can be generated in two ways:

- **Auto reports**: daily / weekly / monthly / yearly schedules.
- **Manual reports**: created via dashboard.

#### Visibility and security rules

- A merchant can only see **their own reports**.
- Only **finished reports** are returned.
- **No public or raw storage URLs are ever returned.**
- Every download attempt is **audit-logged**.

#### Download workflow (high-level)

1. Call **List Reports** to get available reports.
2. Pick a report from `results`.
3. Use its secure `download_action.url`.
4. Call that URL with the same authentication headers.
5. The report file is returned as binary.

![Reports workflow](/img/reports/reports-workflow.png)

## [API Schema Reference](#api-schema-reference)

---

<ApiDocEmbed path="list-reports.api.mdx" />

---

<ApiDocEmbed path="download-report.api.mdx" />

---

## [Guide](#guide)

#### 1) List Reports

**Purpose:**\
Retrieve a paginated list of completed reports.

**Request**

```
GET b/api/v1/reports/files/
```

**Query parameters**

|       Name       | Type | Required | Notes                                           |
| :--------------: | :--: | :------: | ----------------------------------------------- |
| `created_after`  | date |    No    | Lower bound (inclusive)                         |
| `created_before` | date |    No    | Upper bound (inclusive)                         |
|    `interval`    | enum |    No    | `daily`, `weekly`, `monthly`, `yearly`          |
|     `source`     | enum |    No    | `auto` or `manual`                              |
|     `limit`      | int  |    No    | Default 50, max 200                             |
|     `offset`     | int  |    No    | Pagination mode (cursor recommended if enabled) |

**Response**&#x20;

- `download_action.url` – pre-signed download URL with embedded token.
- `download_action.method` – always `GET`.

#### 2) Download Report

**Purpose**\
Download the report file as binary.

**Request**

```
GET b/api/v1/reports/files/a75cd20e-d5b7-4019-972e-c0fe45c1bb96/download/
```

:::info
`:report_id` is file download token&#x20;
:::

**Response**

- Returns the file directly (CSV, XLSX, etc.) as binary.
- No JSON body unless there’s an error.

## [Best Practices](#best-practices)

1. **Use API Key for automation**
   - More stable and permission-free for system integrations.
2. **Always filter by date**
   - Avoid pulling large histories unintentionally.
   - Example: fetch only last month’s reports.
3. **Respect pagination**
   - Use `limit` and `cursor/offset` until `next` is null.
4. **Handle empty results**
   - A valid response can be:

     ```json
     { "count": 0, "next": null, "previous": null, "results": [] }
     ```

5. **Log your own download tracking**
   - Even though Ottu logs downloads, your system should store:
     - report id
     - download time
     - success state
6. **Retry safely**
   - On `429 rate_limited`, backoff before retrying.

## [FAQ](#faq)

#### 1. **Can I download reports without listing them first?**

You technically can if you already stored the `encrypted_id`.\
But listing first is the safest way to discover available reports.

#### 2. **Why don’t I see reports that are still generating?**

The List Reports API returns **finished reports only** to keep results correct and fast.

#### 3. **What happens if I don’t pass date filters?**

The API returns reports from the **last 30 days**, newest first.

#### 4. **Can I share download links publicly?**

No. Download URLs are secure, tokenized, and require authentication.\
They are not permanent or public.

#### 5. **What errors should I expect?**

| HTTP | code                 | message                  | When                               |
| ---- | -------------------- | ------------------------ | ---------------------------------- |
| 400  | `invalid_parameters` | Bad filters              | `created_before` < `created_after` |
| 401  | `unauthorized`       | Invalid/missing auth     | Header missing or wrong            |
| 403  | `forbidden`          | Insufficient permissions | Basic user lacks report permission |
| 404  | `not_found`          | Report not found         | Wrong or inaccessible ID           |
| 429  | `rate_limited`       | Too many requests        | Quota exceeded                     |

#### 6. **I’m using Basic Auth but still getting 403 — why?**

Your user is missing `report.can_view_report`.\
Ask your admin to enable report API access.

#### 7. **Are downloads logged even if they fail?**

Yes. Every attempt is logged with outcome status for audit compliance.
