# Instructions to connect to a docker db with LibreOffice Base

## Step 1: Configure LibreOffice Java Settings
## Before creating the database file, you must point LibreOffice to your downloaded JDBC driver.
1. Open LibreOffice (any application like Writer or Calc).
2. Go to Tools > Options (or Preferences on Mac).
3. Expand LibreOffice on the left and click Advanced.
4. Ensure Use a Java runtime environment is checked and a JRE is selected.
5. Click the Class Path... button on the right.
6. Click Add Archive... and select your downloaded PostgreSQL .jar file.
7. Click OK, then restart LibreOffice completely.

## Step 2: Set Up the Connection in Base
1. Open LibreOffice Base.
2. Select Connect to an existing database and choose JDBC from the dropdown. Click Next.
3. In the Datasource URL field, enter the connection string using this format:
```
postgresql://localhost:5432/piscineds
```
4. In the JDBC driver class field, type exactly:
```
org.postgresql.Driver
```

5. Click Test Class. If it says "The JDBC driver was loaded successfully," click Next.

## Step 3: Authentication and Finalize
1. Enter your PostgreSQL User name (e.g., postgres).
2. Check the Password required box if your database requires a password.
3. Click Test Connection to verify. Base will prompt you for the password.
4. Click Next, choose whether to register the database, and click Finish to save the .odf file.