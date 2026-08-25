You will create an application that lets a family track allowance. It should have the following features:  

- A homepage/marketing page describing the application.
- A login with Google button - this is used by the parent.
- A simple admin that lets the parent add kids. A kid is just a name and a weekly allowance number.
- The admin lets the parent deduct, or add money to a kid with a reason (memo line like on a check)
- Each family has a unique home page using 5 or so unique letters, so for example: (root domain)/f41sd
- The parent, in the admin, can set a password for their family
- When the kids hit their unique URL, they enter the password and can see the whole family of kids and their totals. 
- You can click on a kid to see a transaction history, paginated

The UI should be mobile friendly, light and fun.

Implementation details:  

- Uses Google social login for the parent
- Astro site
- No REACT on the front end, just simple vanilla JS
- Deployed on Netlify
- Serverless scheduled function runs on Sunday to add allowance for each kid
- Netlify Database for storage. We need a table for users (connected to social login). We need a table for kids, which has their name plus weekly allowance. We need a transaction table that has a date, related kid, an amount (positive or negative), and an optional memo
- When the Sunday schedule event runs, its adding to the transaction table with a memo like, "Allowance added!"
- The Sunday allowance function needs to intelligently detect a possible duplicate run. So before it adds allowance for kid X on date Y, it checks to ensure allowance hasn't been given in the past 6 days. So perhaps the transaction table has a boolean column for 'fromAllowance' to make it easier to check. 
- For the family page, it requires the simple password the parent set up for the family. 
- For the family page, all the kids can see all the kids, no need to hide anything there

If there is anything else I'm missing, ask. I also want good instructions on how to setup the Google app so social login works. We will probably need to support local callback urls for oauth and production urls, so assume you read that from the environment. Finally I'll also want to tie this to a new GitHub repo.

