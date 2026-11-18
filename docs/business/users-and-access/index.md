---
title: Users and Access
sidebar_label: Users & Access
description: How to get the list of users on your Ottu account, add or deactivate a user, control which transactions a user sees, and change a password.
---

import StepShow, { Step } from "@site/src/components/StepShow";

# Users and Access

Each person who signs in to your Ottu Dashboard has their own user. An administrator of your account manages the users in the **Administration panel**: who they are, whether they can sign in, and what they are allowed to see and do.

This section answers three questions:

- [How do I get the list of users on my account?](#how-do-i-get-the-list-of-users-on-my-account) (this page)
- [Why can't I see all the transactions?](/business/users-and-access/transaction-visibility)
- [How do I change my password?](/business/users-and-access/password)

## How do I get the list of users on my account?

**Who can do it:** an administrator of your account. Only administrators see the **Administration panel** entry. If you do not see it, ask your account administrator for the list.

<StepShow>

<Step image="/img/business/dashboard/user-menu.png" alt="The three-dot menu in the top-right corner, with Administration panel and Account settings">

In the Ottu Dashboard, click the three-dot menu in the top-right corner, next to your name.

</Step>

<Step image="/img/business/dashboard/user-menu.png" spot="28.7,10.4,60.9,14.2" alt="The three-dot menu in the top-right corner, with Administration panel and Account settings">

Click **Administration panel**.

</Step>

<Step image="/img/business/dashboard/admin-topnav.png" spot="58.1,14.2,12.2,71.1" alt="The top menu of the Administration panel, with Users">

In the top menu of the Administration panel, click **Users**.

</Step>

</StepShow>

The page lists every user on your account with their username, whether they are active, whether they are a superuser or staff, and their groups.

To narrow the list:

- Type a username in the search box and click **Search** to find one user.
- Use the filters **superuser status**, **staff status**, **active** and **groups** to show only those users.

The list cannot be exported to a file. To share it, copy it from the page.

## Add a user

**Who can do it:** an administrator.

<StepShow>

<Step image="/img/business/dashboard/admin-topnav.png" spot="58.1,14.2,12.2,71.1" alt="The top menu of the Administration panel, with Users">

Open the **Users** page as described above.

</Step>

<Step image="/img/business/dashboard/admin-users-add.png" spot="60.2,8.9,30.9,62.9" alt="The Add User button on the Users page">

Click **Add User** at the top right of the page.

</Step>

<Step>

Fill in the username, **First name**, **Last name**, email address and **Phone number**, then **Password** and **Password confirmation**. Each user needs their own email address.

</Step>

<Step>

Save.

</Step>

<Step>

Give the new user the username and the password yourself. Ottu does not send them an invitation email.

</Step>

</StepShow>

Then give the user the permissions they need: see [How an administrator gives a user access](/business/users-and-access/transaction-visibility#how-an-administrator-gives-a-user-access).

## Deactivate a user who left

**Who can do it:** an administrator.

<StepShow>

<Step image="/img/business/dashboard/admin-topnav.png" spot="58.1,14.2,12.2,71.1" alt="The top menu of the Administration panel, with Users">

Open the **Users** page and click the user.

</Step>

<Step image="/img/business/dashboard/admin-user-perm-tab.png" spot="1.9,23.5,17.9,17.9" alt="The Permissions tab of a user, with the Active checkbox">

Open the **Permissions** tab and untick **Active**.

</Step>

<Step image="/img/business/dashboard/admin-user-save.png" spot="1.2,2.8,97.6,21.2" alt="The Save button on the user page">

Click **Save**.

</Step>

</StepShow>

The user is signed out and can no longer sign in.

## What's Next?

- [Why can't I see all the transactions?](/business/users-and-access/transaction-visibility) -- What decides which transactions a user sees
- [Change or reset a password](/business/users-and-access/password) -- For yourself or for another user
- [Refund & Void Access Control](/business/operations/refund-void-access-control) -- Who can refund and void
