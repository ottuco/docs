---
title: Change or Reset Your Password
sidebar_label: Passwords
description: How to change your Ottu Dashboard password, what to do if you forgot your password, and how an administrator resets a user's password.
---

import StepShow, { Step } from "@site/src/components/StepShow";

# Change or Reset Your Password

You change your own password inside the Ottu Dashboard. If you forgot it and cannot sign in, use **Forgot Password?** on the sign-in page, or ask Ottu support to reset it.

## How do I change my password?

**Who can do it:** any user who is signed in.

<StepShow>

<Step image="/img/business/dashboard/user-menu.png" alt="The three-dot menu in the top-right corner, with Administration panel and Account settings">

In the Ottu Dashboard, click the three-dot menu in the top-right corner, next to your name.

</Step>

<Step image="/img/business/dashboard/user-menu.png" spot="28.7,39.4,60.9,14.2" alt="The three-dot menu in the top-right corner, with Administration panel and Account settings">

Click **Account settings**.

</Step>

<Step image="/img/business/dashboard/account-change-password.png" spot="0.7,65.7,28.6,29" alt="The Change password link at the bottom of Account settings">

Click **Change password**.

</Step>

<Step image="/img/business/dashboard/change-password-form.png" spot="3.8,35.9,92.1,35.5" alt="The Change password form with New password and Confirm password">

Type the new password in **New password** and again in **Confirm password**.

</Step>

<Step image="/img/business/dashboard/change-password-form.png" spot="41.1,76.2,17.3,16.4" alt="The Submit button of the Change password form">

Click **Submit**.

</Step>

</StepShow>

The message **Password changed successfully** appears. Use the new password the next time you sign in.

If you sign in with your company account (single sign-on), you have no Ottu password to change: change it at your company's sign-in provider.

## I forgot my password

1. On the sign-in page of your Ottu Dashboard, click **Forgot Password?** and follow the instructions.
2. If the sign-in page has no **Forgot Password?** link, ask Ottu support to reset your password, through the live chat or by email to [csd@ottu.com](mailto:csd@ottu.com). Give:
   - the address of your Ottu Dashboard, for example `yourcompany.ottu.net`;
   - your username.

Your password is reset and the new one is sent to the email address saved on your user. When you are signed in again, change it to one only you know, as described above.

An administrator of your Ottu account can also set a new password for you: see the steps below.

## Reset the password of another user

**Who can do it:** an administrator of your account.

<StepShow>

<Step image="/img/business/dashboard/user-menu.png" spot="28.7,10.4,60.9,14.2" alt="The three-dot menu in the top-right corner, with Administration panel and Account settings">

In the Ottu Dashboard, click the three-dot menu in the top-right corner and click **Administration panel**.

</Step>

<Step image="/img/business/dashboard/admin-topnav.png" spot="58.1,14.2,12.2,71.1" alt="The top menu of the Administration panel, with Users">

In the top menu, click **Users**, then click the user.

</Step>

<Step>

On the **General** tab, under **Password**, click **Reset password**. For a user who has no password yet, the link reads **Set password**.

</Step>

<Step>

Type the new password twice and confirm.

</Step>

<Step>

Give the new password to the user in a safe way, and ask them to change it after they sign in.

</Step>

</StepShow>

## Password rules

A new password must:

- have at least 8 characters;
- contain at least one digit, one uppercase letter and one special character, such as `!` or `#`;
- not be only digits, and not be a common password;
- not be too similar to your username, name or email;
- be different from your current password and your last 5 passwords.

## What's Next?

- [Users and Access](/business/users-and-access/) -- Get the list of users on your account
- [Why can't I see all the transactions?](/business/users-and-access/transaction-visibility) -- What decides which transactions a user sees
- [API Keys](/business/settings/api-keys) -- Credentials for API access, separate from your password
