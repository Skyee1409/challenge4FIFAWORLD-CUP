# Deployment Guide: Deploying ArenaMind to Render

Since ArenaMind is a fully static client-side web application, it can be deployed to **Render** as a **Static Site** for free in just a few minutes.

---

## Step 1: Initialize Git and Push to GitHub

1. Open your terminal in the `c:\challenge4` directory.
2. Initialize git and commit the codebase:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: ArenaMind Dashboard"
   ```
3. Create a new repository on your GitHub account (e.g., named `arenamind-fifa2026`).
4. Link your local repository and push:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/arenamind-fifa2026.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy on Render

1. Log in to [Render (render.com)](https://dashboard.render.com/).
2. Click the **"New +"** button in the dashboard and select **"Static Site"**.
3. Connect your GitHub account and search for/select your `arenamind-fifa2026` repository.
4. In the configuration settings, set the following:
   - **Name**: `arenamind-fifa2026`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Click **"Create Static Site"** to deploy.

Render will deploy the application within a minute and provide a live URL (e.g., `https://arenamind-fifa2026.onrender.com`).
